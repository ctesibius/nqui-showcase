/**
 * Rasterizes public/favicon.svg to public/favicon.ico (multi-size).
 * Run: node scripts/generate-favicon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "favicon.svg");
const outPath = join(root, "public", "favicon.ico");

const svg = readFileSync(svgPath);
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);
const ico = await toIco(pngs);
writeFileSync(outPath, ico);

console.log(`Wrote ${outPath} (${sizes.join(", ")} px)`);
