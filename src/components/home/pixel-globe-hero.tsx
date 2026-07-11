import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePrimaryAccent } from "../../context/primary-accent-context";

type ParticleKind = "grid" | "land";

class Particle {
  lat: number;
  lon: number;
  type: ParticleKind;
  vx = 0;
  vy = 0;
  size: number;
  baseAlpha: number;
  z = 0;
  visible = false;
  homeX = 0;
  homeY = 0;
  x = 0;
  y = 0;

  constructor(lat: number, lon: number, type: ParticleKind) {
    this.lat = lat;
    this.lon = lon;
    this.type = type;
    this.size = type === "land" ? 2 : 1.5;
    this.baseAlpha = type === "land" ? 0.9 : 0.55;
  }

  updatePosition(
    centerX: number,
    centerY: number,
    globeRadius: number,
    rotation: number,
  ) {
    const phi = ((90 - this.lat) * Math.PI) / 180;
    const theta = ((this.lon + rotation) * Math.PI) / 180;

    const x3d = globeRadius * Math.sin(phi) * Math.cos(theta);
    const y3d = globeRadius * Math.cos(phi);
    const z3d = globeRadius * Math.sin(phi) * Math.sin(theta);

    this.z = z3d;
    this.visible = z3d > 0;

    this.homeX = centerX + x3d;
    this.homeY = centerY - y3d;

    if (this.x === 0 && this.y === 0) {
      this.x = this.homeX;
      this.y = this.homeY;
    }
  }

  update(mouseX: number, mouseY: number, forceRadius: number, forceStrength: number) {
    if (!this.visible) return;

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < forceRadius && dist > 0) {
      const force = (forceRadius - dist) / forceRadius;
      const angle = Math.atan2(dy, dx);
      this.vx += Math.cos(angle) * force * forceStrength;
      this.vy += Math.sin(angle) * force * forceStrength;
    }

    this.vx += (this.homeX - this.x) * 0.02;
    this.vy += (this.homeY - this.y) * 0.02;
    this.vx *= 0.9;
    this.vy *= 0.9;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    globeRadius: number,
    particleColor: string,
  ) {
    if (!this.visible) return;
    const depthFade = (this.z / globeRadius) * 0.5 + 0.5;
    const alpha = this.baseAlpha * depthFade;
    ctx.fillStyle = particleColor.replace("ALPHA", String(alpha));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * depthFade, 0, Math.PI * 2);
    ctx.fill();
  }
}

function buildParticles(): Particle[] {
  const particles: Particle[] = [];

  for (let lat = -80; lat <= 80; lat += 15) {
    for (let lon = 0; lon < 360; lon += 6) {
      particles.push(new Particle(lat, lon, "grid"));
    }
  }

  for (let lon = 0; lon < 360; lon += 20) {
    for (let lat = -80; lat <= 80; lat += 6) {
      particles.push(new Particle(lat, lon, "grid"));
    }
  }

  const landCoords: [number, number, number][] = [
    [40, -100, 25],
    [50, -95, 20],
    [45, -75, 15],
    [-10, -60, 20],
    [-20, -55, 18],
    [-30, -65, 15],
    [50, 10, 18],
    [55, 20, 15],
    [0, 20, 25],
    [-15, 25, 20],
    [-25, 25, 18],
    [40, 80, 30],
    [50, 100, 25],
    [30, 110, 20],
    [-25, 135, 18],
  ];

  landCoords.forEach(([lat, lon, density]) => {
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const offsetLat = lat + (i - density / 2) * 1.5;
        const offsetLon = lon + (j - density / 2) * 1.5;
        if (Math.random() > 0.3) {
          particles.push(new Particle(offsetLat, offsetLon, "land"));
        }
      }
    }
  });

  return particles;
}

type PixelGlobeHeroProps = {
  className?: string;
};

export function PixelGlobeHero({ className }: PixelGlobeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const { accentHue: accentHueRaw } = usePrimaryAccent();
  const accentHue = accentHueRaw ?? 240; // fall back to blue when monochrome (globe needs a hue)
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = buildParticles();
    const mouse = { x: -1000, y: -1000 };
    let rotation = 0;
    let raf = 0;
    let width = 0;
    let height = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const isDark = resolvedTheme === "dark";
    const trailAlpha = isDark ? 0.22 : 0.12;
    const trailRgb = isDark ? "10, 12, 18" : "248, 248, 252";
    const particleColor = `oklch(0.62 0.2 ${accentHue} / ALPHA)`;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.left = `${mouse.x}px`;
        cursor.style.top = `${mouse.y}px`;
        cursor.style.opacity = "1";
      }
    };

    const onLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const animate = () => {
      ctx.fillStyle = `rgba(${trailRgb}, ${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const globeRadius = Math.min(width, height) * 0.28;

      if (!reducedMotion) rotation += 0.18;

      particles.forEach((p) => {
        p.updatePosition(centerX, centerY, globeRadius, rotation);
        p.update(mouse.x, mouse.y, 160, 1.4);
      });

      particles.sort((a, b) => a.z - b.z);
      particles.forEach((p) => p.draw(ctx, globeRadius, particleColor));

      raf = requestAnimationFrame(animate);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [accentHue, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 ${className ?? ""}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block size-full" />
      <div
        ref={cursorRef}
        className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: `oklch(0.62 0.22 ${accentHue} / 0.75)`,
          boxShadow: `0 0 24px oklch(0.62 0.22 ${accentHue} / 0.45)`,
        }}
      />
    </div>
  );
}
