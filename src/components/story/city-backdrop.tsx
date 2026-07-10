import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

/**
 * Abstract city backdrop — a foggy monochrome skyline of instanced block
 * buildings (à la architectural visualization), threaded by a glowing network:
 * accent nodes on rooftop "hubs" with arcs and traveling pulses between them.
 * The metaphor: one design system wired through every discipline of a city —
 * software, mechanical, electrical.
 *
 * Deliberately quiet: buildings sit a few percent from the page background and
 * dissolve into theme-colored fog, so content stays prominent. The camera
 * drifts slowly through the city as the page scrolls. Theme-aware via color
 * probes; static frame under prefers-reduced-motion; skipped below md.
 */

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

/** Deterministic pseudo-random so the skyline is stable across mounts. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CityBackdrop() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fgProbeRef = useRef<HTMLSpanElement>(null);
  const bgProbeRef = useRef<HTMLSpanElement>(null);
  const accentProbeRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resolve = makeResolver();
    const rnd = mulberry32(20260710);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);

    // ── Buildings — one InstancedMesh, per-instance monochrome variation ──────
    const specs: { x: number; z: number; w: number; d: number; h: number }[] = [];
    const BLOCK = 2.0;
    for (let gz = -34; gz <= 8; gz += BLOCK) {
      for (let gx = -16; gx <= 16; gx++) {
        if (Math.abs(gx) < 2) continue; // clearing along the camera path
        if (rnd() < 0.22) continue; // plazas
        const tallBias = Math.min(1, Math.abs(gx) / 10 + 0.35);
        const h = (0.5 + Math.pow(rnd(), 1.6) * 5.2) * tallBias + 0.3;
        specs.push({
          x: gx * BLOCK + (rnd() - 0.5) * 0.7,
          z: gz + (rnd() - 0.5) * 0.7,
          w: 0.8 + rnd() * 0.8,
          d: 0.8 + rnd() * 0.8,
          h,
        });
      }
    }

    const box = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshLambertMaterial();
    const buildings = new THREE.InstancedMesh(box, buildingMat, specs.length);
    const m = new THREE.Matrix4();
    const shade = new THREE.Color();
    specs.forEach((s, i) => {
      m.makeScale(s.w, s.h, s.d);
      m.setPosition(s.x, s.h / 2, s.z);
      buildings.setMatrixAt(i, m);
      // Slight per-building brightness variation; recolored on theme change.
      const v = 0.9 + rnd() * 0.2;
      buildings.setColorAt(i, shade.setScalar(v));
    });
    scene.add(buildings);

    // Lighting — soft hemisphere + a low sun for facade contrast.
    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 0.9);
    const sun = new THREE.DirectionalLight(0xffffff, 0.45);
    sun.position.set(4, 8, 2);
    scene.add(hemi, sun);

    // ── The network — hubs on tall rooftops, arcs between them, pulses ───────
    const hubs = specs
      .filter((s) => s.h > 2.6)
      .sort(() => rnd() - 0.5)
      .slice(0, 16)
      .map((s) => new THREE.Vector3(s.x, s.h + 0.08, s.z));

    const curves: THREE.QuadraticBezierCurve3[] = [];
    const addEdge = (a: THREE.Vector3, b: THREE.Vector3) => {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.9 + a.distanceTo(b) * 0.14;
      curves.push(new THREE.QuadraticBezierCurve3(a, mid, b));
    };
    for (let i = 0; i < hubs.length - 1; i++) addEdge(hubs[i], hubs[i + 1]);
    for (let i = 0; i < 7; i++) {
      const a = hubs[Math.floor(rnd() * hubs.length)];
      const b = hubs[Math.floor(rnd() * hubs.length)];
      if (a !== b) addEdge(a, b);
    }

    const SEG = 22;
    const linePos = new Float32Array(curves.length * SEG * 2 * 3);
    curves.forEach((curve, ci) => {
      const pts = curve.getPoints(SEG);
      for (let s = 0; s < SEG; s++) {
        const o = (ci * SEG + s) * 6;
        linePos[o] = pts[s].x; linePos[o + 1] = pts[s].y; linePos[o + 2] = pts[s].z;
        linePos[o + 3] = pts[s + 1].x; linePos[o + 4] = pts[s + 1].y; linePos[o + 5] = pts[s + 1].z;
      }
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.45, fog: true });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // Hub nodes
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(hubs.flatMap((h) => [h.x, h.y, h.z])), 3),
    );
    const nodeMat = new THREE.PointsMaterial({ size: 0.14, transparent: true, opacity: 0.95, fog: true });
    scene.add(new THREE.Points(nodeGeo, nodeMat));

    // Pulses — one point traveling per edge.
    const pulsePos = new Float32Array(curves.length * 3);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({ size: 0.1, transparent: true, opacity: 0.95, fog: true });
    scene.add(new THREE.Points(pulseGeo, pulseMat));
    const pulseSpeed = curves.map(() => 0.05 + rnd() * 0.09);
    const pulseOffset = curves.map(() => rnd());
    const pv = new THREE.Vector3();
    function updatePulses(time: number) {
      curves.forEach((curve, i) => {
        const t = (time * pulseSpeed[i] + pulseOffset[i]) % 1;
        curve.getPoint(t, pv);
        pulsePos[i * 3] = pv.x; pulsePos[i * 3 + 1] = pv.y; pulsePos[i * 3 + 2] = pv.z;
      });
      pulseGeo.attributes.position.needsUpdate = true;
    }

    // ── Theme ─────────────────────────────────────────────────────────────────
    const bgC = new THREE.Color();
    const fgC = new THREE.Color();
    const accC = new THREE.Color();
    function readColors() {
      const [br, bg2, bb] = resolve(getComputedStyle(bgProbeRef.current!).color);
      const [fr, fg2, fb] = resolve(getComputedStyle(fgProbeRef.current!).color);
      const [ar, ag, ab] = resolve(getComputedStyle(accentProbeRef.current!).color);
      bgC.setRGB(br / 255, bg2 / 255, bb / 255);
      fgC.setRGB(fr / 255, fg2 / 255, fb / 255);
      accC.setRGB(ar / 255, ag / 255, ab / 255);

      renderer.setClearColor(bgC, 1);
      scene.fog = new THREE.Fog(bgC, 6, 26);
      // Buildings: background nudged toward foreground — quiet, monochrome.
      buildingMat.color.copy(bgC.clone().lerp(fgC, 0.1));
      hemi.color.copy(bgC.clone().lerp(fgC, 0.05));
      hemi.groundColor.copy(bgC.clone().lerp(fgC, 0.3));
      lineMat.color.copy(accC);
      nodeMat.color.copy(accC);
      pulseMat.color.copy(accC);
    }

    // ── Camera path — slow flight down the clearing as the page scrolls ──────
    let scrollT = 0;
    function updateScroll() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollT = Math.min(1, window.scrollY / max);
    }
    function placeCamera(t: number, time: number) {
      const z = 9 - t * 26;
      const sway = reducedMotion ? 0 : Math.sin(time * 0.1) * 0.5;
      camera.position.set(sway, 8 + t * 1.5, z);
      camera.lookAt(sway * 0.3, 1.2, z - 20);
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const time = (performance.now() - t0) / 1000;
      updatePulses(time);
      placeCamera(scrollT, time);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    let staticRaf = 0;
    const renderStatic = () => {
      cancelAnimationFrame(staticRaf);
      staticRaf = requestAnimationFrame(() => {
        updatePulses(0);
        placeCamera(scrollT, 0);
        renderer.render(scene, camera);
      });
    };

    const onScroll = () => {
      updateScroll();
      if (reducedMotion) renderStatic();
    };

    resize();
    readColors();
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      renderStatic();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const themeObserver = new MutationObserver(() => {
      readColors();
      if (reducedMotion) renderStatic();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(staticRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      box.dispose();
      buildingMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      renderer.dispose();
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <span ref={fgProbeRef} className="absolute text-foreground opacity-0" />
      <span ref={bgProbeRef} className="absolute text-background opacity-0" />
      <span ref={accentProbeRef} className="absolute text-primary opacity-0" />
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
