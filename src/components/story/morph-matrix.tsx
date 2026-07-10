import { type RefObject, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { buildShapes, type ShapePoint } from "./hero-shapes";

const N = 900;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type RGB = [number, number, number];

function makeResolver() {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const cx = c.getContext("2d", { willReadFrequently: true })!;
  return (color: string): RGB => {
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = "#000";
    cx.fillStyle = color;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
}

const VERT = /* glsl */ `
  attribute float aBrightness;
  attribute float aAccent;
  varying float vBrightness;
  varying float vAccent;
  uniform float uSize;
  uniform float uPixelRatio;
  void main() {
    vBrightness = aBrightness;
    vAccent = aAccent;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.4 + aBrightness) / max(0.1, -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uFg;
  uniform vec3 uAccent;
  varying float vBrightness;
  varying float vAccent;
  void main() {
    vec3 c = mix(uFg, uAccent, vAccent);
    float a = clamp(vBrightness * 0.9 + 0.12, 0.0, 1.0);
    gl_FragColor = vec4(c, a);
  }
`;

/**
 * Three.js point cloud of N dots that morph dot-for-dot between four library
 * motifs (from hero-shapes.ts) as `progressRef` (0..1) advances. Brighter
 * structural dots sit forward in Z; the cloud tilts toward the cursor for
 * parallax and the dots repel from the pointer on the xy plane. Theme-aware;
 * a single static frame under prefers-reduced-motion.
 */
export function MorphMatrix({
  progressRef,
  className = "",
}: {
  progressRef: RefObject<number>;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fgProbeRef = useRef<HTMLSpanElement>(null);
  const accentProbeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resolve = makeResolver();
    const shapes = buildShapes(N);

    // Dim full-grid "panel" behind the icon: every cell has a subtle dot, softly
    // brighter toward the center — the icon lights up prominently on top of it.
    const BG: ShapePoint[] = [];
    const GRID = 26;
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = 0.055 + (0.89 * c) / (GRID - 1);
        const y = 0.055 + (0.89 * r) / (GRID - 1);
        const rr = Math.min(1, Math.hypot(x - 0.5, y - 0.5) / 0.62);
        BG.push({ x, y, b: 0.12 * (1 - rr * 0.55), accent: false });
      }
    }
    const M = BG.length;
    const TOTAL = M + N;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.5;

    const positions = new Float32Array(TOTAL * 3);
    const brightness = new Float32Array(TOTAL);
    const accent = new Float32Array(TOTAL);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));
    geo.setAttribute("aAccent", new THREE.BufferAttribute(accent, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 8.5 },
        uPixelRatio: { value: dpr },
        uFg: { value: new THREE.Vector3(0.05, 0.05, 0.05) },
        uAccent: { value: new THREE.Vector3(0.3, 0.5, 0.95) },
      },
    });

    const group = new THREE.Group();
    const points = new THREE.Points(geo, material);
    group.add(points);
    scene.add(group);

    // Per-dot physics state (local space) — background grid first, then icon.
    const px = new Float32Array(TOTAL);
    const py = new Float32Array(TOTAL);
    const pz = new Float32Array(TOTAL);
    const vx = new Float32Array(TOTAL);
    const vy = new Float32Array(TOTAL);
    let seeded = false;

    // Shape helpers — normalized 0..1 → world [-1, 1]; brighter dots forward.
    const worldX = (x: number) => x * 2 - 1;
    const worldY = (y: number) => 1 - y * 2;
    const worldZ = (b: number) => (b - 0.45) * 0.7;

    // Discrete target: each stage snaps to one whole shape and the spring flies
    // the dots there — a clean "shape A → shape B" morph, no scrubbed in-betweens.
    function target(i: number, p: number): ShapePoint {
      const stage = Math.round(clamp01(p) * (shapes.length - 1));
      return shapes[stage][i];
    }

    // Cursor: normalized device coords (-1..1) over the canvas.
    const cursor = { x: -9, y: -9, active: false };
    let rotX = 0;
    let rotY = 0;
    let auto = 0;
    const REPEL_R = 0.32;

    function step(animated: boolean) {
      const p = progressRef.current ?? 0;
      for (let i = 0; i < TOTAL; i++) {
        // First M dots are the static dim panel grid; the rest morph as the icon.
        const isBg = i < M;
        const tg = isBg ? BG[i] : target(i - M, p);
        const hx = worldX(tg.x);
        const hy = worldY(tg.y);
        const hz = isBg ? 0 : worldZ(tg.b);
        if (!seeded) {
          px[i] = hx; py[i] = hy; pz[i] = hz;
        }

        if (animated) {
          if (cursor.active) {
            const dx = px[i] - cursor.x;
            const dy = py[i] - cursor.y;
            const dist = Math.hypot(dx, dy);
            if (dist < REPEL_R && dist > 0.0001) {
              const force = (REPEL_R - dist) / REPEL_R;
              vx[i] += (dx / dist) * force * 0.03;
              vy[i] += (dy / dist) * force * 0.03;
            }
          }
          vx[i] += (hx - px[i]) * 0.14;
          vy[i] += (hy - py[i]) * 0.14;
          vx[i] *= 0.82; vy[i] *= 0.82;
          px[i] += vx[i]; py[i] += vy[i];
          pz[i] += (hz - pz[i]) * 0.12;
        } else {
          px[i] = hx; py[i] = hy; pz[i] = hz;
        }

        positions[i * 3] = px[i];
        positions[i * 3 + 1] = py[i];
        positions[i * 3 + 2] = pz[i];
        brightness[i] = tg.b;
        accent[i] = tg.accent ? 1 : 0;
      }
      seeded = true;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aBrightness.needsUpdate = true;
      geo.attributes.aAccent.needsUpdate = true;

      if (animated) {
        auto += 0.0006;
        const targRotY = cursor.active ? cursor.x * 0.4 : Math.sin(auto) * 0.12;
        const targRotX = cursor.active ? -cursor.y * 0.28 : 0;
        rotY += (targRotY - rotY) * 0.06;
        rotX += (targRotX - rotX) * 0.06;
        group.rotation.y = rotY;
        group.rotation.x = rotX;
      }
      renderer.render(scene, camera);
    }

    function readColors() {
      if (fgProbeRef.current) {
        const [r, g, b] = resolve(getComputedStyle(fgProbeRef.current).color);
        material.uniforms.uFg.value.set(r / 255, g / 255, b / 255);
      }
      if (accentProbeRef.current) {
        const [r, g, b] = resolve(getComputedStyle(accentProbeRef.current).color);
        material.uniforms.uAccent.value.set(r / 255, g / 255, b / 255);
      }
    }

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    }

    function boot() {
      resize();
      readColors();
      seeded = false;
      if (reducedMotion) step(false);
    }
    boot();

    let raf = 0;
    const loop = () => {
      step(true);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursor.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      cursor.active = true;
    };
    const onLeave = () => { cursor.active = false; };

    let staticRaf = 0;
    const onScrollStatic = () => {
      cancelAnimationFrame(staticRaf);
      staticRaf = requestAnimationFrame(() => step(false));
    };

    if (!reducedMotion) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(loop);
    } else {
      window.addEventListener("scroll", onScrollStatic, { passive: true });
    }

    const ro = new ResizeObserver(() => boot());
    ro.observe(container);
    const themeObserver = new MutationObserver(() => readColors());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(staticRaf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScrollStatic);
      ro.disconnect();
      themeObserver.disconnect();
      geo.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, progressRef]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span ref={fgProbeRef} className="pointer-events-none absolute text-foreground opacity-0" aria-hidden />
      <span ref={accentProbeRef} className="pointer-events-none absolute text-primary opacity-0" aria-hidden />
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
