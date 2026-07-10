/**
 * Four abstract dot-matrix motifs, one per nqlib library. Each generator
 * returns exactly N normalized points (0..1 within a padded box) so the hero
 * canvas can morph dot-for-dot between them as the reel scrolls.
 */

export interface ShapePoint {
  x: number;
  y: number;
  b: number; // brightness 0..1
  accent: boolean;
}

const PAD_LO = 0.1;
const PAD_HI = 0.9;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mapX = (t: number) => lerp(PAD_LO, PAD_HI, t);

/** Resample an arbitrary-length list to exactly N points (dup or subsample). */
export function toN(points: ShapePoint[], n: number): ShapePoint[] {
  if (points.length === 0) {
    return Array.from({ length: n }, () => ({ x: 0.5, y: 0.5, b: 0.3, accent: false }));
  }
  const out: ShapePoint[] = [];
  for (let i = 0; i < n; i++) {
    out.push(points[Math.floor((i * points.length) / n)]);
  }
  return out;
}

// ── nqui — component swatch grid ─────────────────────────────────────────────
// A palette of rounded component blocks, each filled with a small dot grid.
function componentsShape(): ShapePoint[] {
  const pts: ShapePoint[] = [];
  const cols = 6;
  const rows = 4;
  const gapX = (PAD_HI - PAD_LO) / cols;
  const gapY = (PAD_HI - PAD_LO) / rows;
  const bw = gapX * 0.76;
  const bh = gapY * 0.7;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = PAD_LO + gapX * (c + 0.5) - bw / 2;
      const oy = PAD_LO + gapY * (r + 0.5) - bh / 2;
      const accent = idx === 8 || idx === 15; // a couple highlighted swatches
      const dc = 6;
      const dr = 5;
      for (let i = 0; i < dc; i++) {
        for (let j = 0; j < dr; j++) {
          const edge = i === 0 || i === dc - 1 || j === 0 || j === dr - 1;
          pts.push({
            x: ox + (bw * i) / (dc - 1),
            y: oy + (bh * j) / (dr - 1),
            b: edge ? 0.85 : 0.45,
            accent,
          });
        }
      }
      idx++;
    }
  }
  return pts;
}

// ── nqchart — ascending bars with a trend line ──────────────────────────────
function chartsShape(): ShapePoint[] {
  const pts: ShapePoint[] = [];
  const heights = [0.26, 0.38, 0.32, 0.5, 0.44, 0.6, 0.54, 0.72, 0.66, 0.82, 0.76];
  const bars = heights.length;
  const slotW = (PAD_HI - PAD_LO) / bars;
  const baseY = PAD_HI;
  const maxH = Math.max(...heights);
  const tops: { x: number; y: number }[] = [];
  for (let i = 0; i < bars; i++) {
    const cx = PAD_LO + slotW * (i + 0.5);
    const h = heights[i] * (PAD_HI - PAD_LO);
    const topY = baseY - h;
    tops.push({ x: cx, y: topY });
    const stepY = 0.02;
    const w = slotW * 0.56;
    const tallest = heights[i] === maxH;
    // solid-ish bar: three columns of dots
    for (let cxi = -1; cxi <= 1; cxi++) {
      const bx = cx + (cxi * w) / 2;
      for (let y = topY; y <= baseY; y += stepY) {
        pts.push({ x: bx, y, b: cxi === 0 ? 0.5 : 0.62, accent: tallest });
      }
    }
  }
  // trend line of dots across the bar tops
  for (let i = 0; i < tops.length - 1; i++) {
    const a = tops[i];
    const b = tops[i + 1];
    for (let t = 0; t < 1; t += 0.16) {
      pts.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - 0.03, b: 0.95, accent: true });
    }
  }
  return pts;
}

// ── nqgrid — spreadsheet grid ────────────────────────────────────────────────
function gridShape(): ShapePoint[] {
  const pts: ShapePoint[] = [];
  const cols = 10;
  const rows = 8;
  const stepX = (PAD_HI - PAD_LO) / cols;
  const stepY = (PAD_HI - PAD_LO) / rows;
  const dotStep = 0.016;
  // horizontal rules
  for (let r = 0; r <= rows; r++) {
    const y = PAD_LO + stepY * r;
    for (let x = PAD_LO; x <= PAD_HI + 1e-6; x += dotStep) {
      pts.push({ x, y, b: r === 1 ? 0.85 : 0.4, accent: false });
    }
  }
  // vertical rules
  for (let c = 0; c <= cols; c++) {
    const x = PAD_LO + stepX * c;
    for (let y = PAD_LO; y <= PAD_HI + 1e-6; y += dotStep) {
      pts.push({ x, y, b: c === 1 ? 0.75 : 0.4, accent: false });
    }
  }
  // a few filled/selected cells
  const filled: [number, number][] = [[3, 2], [4, 2], [3, 3], [6, 4], [2, 5]];
  for (const [c, r] of filled) {
    for (let i = 1; i < 5; i++) {
      for (let j = 1; j < 4; j++) {
        pts.push({
          x: PAD_LO + stepX * c + (stepX * i) / 5,
          y: PAD_LO + stepY * r + (stepY * j) / 4,
          b: 0.9,
          accent: true,
        });
      }
    }
  }
  return pts;
}

// ── nqgantt — staggered timeline bars ────────────────────────────────────────
function ganttShape(): ShapePoint[] {
  const pts: ShapePoint[] = [];
  const tasks: [number, number][] = [
    [0.0, 0.4],
    [0.16, 0.48],
    [0.28, 0.72],
    [0.1, 0.34],
    [0.44, 0.88],
    [0.58, 0.84],
    [0.36, 0.62],
    [0.66, 1.0],
  ];
  const rows = tasks.length;
  const rowGap = (PAD_HI - PAD_LO) / (rows + 1);
  const dotStep = 0.014;
  tasks.forEach(([start, end], i) => {
    const y = PAD_LO + rowGap * (i + 1);
    const x0 = mapX(start);
    const x1 = mapX(end);
    const accent = i === 4; // critical task
    for (let x = x0; x <= x1 + 1e-6; x += dotStep) {
      pts.push({ x, y: y - 0.014, b: 0.72, accent });
      pts.push({ x, y, b: 0.6, accent });
      pts.push({ x, y: y + 0.014, b: 0.72, accent });
    }
    pts.push({ x: x0, y, b: 0.95, accent });
    pts.push({ x: x1, y, b: 0.95, accent });
  });
  // faint "today" marker
  const todayX = mapX(0.55);
  for (let y = PAD_LO; y <= PAD_HI + 1e-6; y += 0.03) {
    pts.push({ x: todayX, y, b: 0.5, accent: true });
  }
  // time-axis ticks along the top
  for (let t = 0; t <= 1.0001; t += 0.125) {
    pts.push({ x: mapX(t), y: PAD_LO - 0.02, b: 0.4, accent: false });
  }
  return pts;
}

export function buildShapes(n: number): ShapePoint[][] {
  return [componentsShape(), chartsShape(), gridShape(), ganttShape()].map((s) => toN(s, n));
}
