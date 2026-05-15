import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, "../public/icons");

// SVG ikony RSS Readera — niebieski kwadrat z literą R
function makeSvg(size) {
  const fontSize = Math.round(size * 0.45);
  const radius = Math.round(size * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#2563eb"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="white">R</text>
</svg>`;
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size)))
    .png()
    .toFile(resolve(iconsDir, `icon-${size}x${size}.png`));
  console.log(`✓ icon-${size}x${size}.png`);
}
