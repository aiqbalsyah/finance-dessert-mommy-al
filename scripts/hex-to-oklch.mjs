#!/usr/bin/env node

/**
 * Hex to OKLCH converter for brand colors.
 *
 * Usage:
 *   node scripts/hex-to-oklch.mjs "#00F9B1"
 *   node scripts/hex-to-oklch.mjs "#00F9B1" "#013847" "#FFFFFF"
 */

function hexToOklch(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r),
    lg = toLinear(g),
    lb = toLinear(b);

  // Linear RGB → XYZ (D65)
  const x = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const y = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const z = 0.0883024619 * lr + 0.1228178733 * lg + 0.733879715 * lb;

  // XYZ → LMS (cube root)
  const l_ = Math.cbrt(
    0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
  );
  const m_ = Math.cbrt(
    0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
  );
  const s_ = Math.cbrt(
    0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z
  );

  // LMS → Oklab
  let L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  L = Math.min(1, Math.max(0, L));
  let C = Math.sqrt(A * A + B_ * B_);
  let H = (Math.atan2(B_, A) * 180) / Math.PI;
  if (H < 0) H += 360;

  // Achromatic detection
  const isGray = (r === g && g === b) || C < 0.002;
  if (isGray) {
    C = 0;
    H = 0;
  }

  const lStr = Math.round(L * 1000) / 1000;
  const cStr = Math.round(C * 10000) / 10000;
  const hStr = Math.round(H * 100) / 100;

  return `oklch(${lStr} ${cStr} ${hStr})`;
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: node scripts/hex-to-oklch.mjs <hex> [hex2] [hex3] ...");
  console.log('Example: node scripts/hex-to-oklch.mjs "#00F9B1" "#013847"');
  process.exit(1);
}

for (const hex of args) {
  const clean = hex.startsWith("#") ? hex : `#${hex}`;
  console.log(`${clean} → ${hexToOklch(clean)}`);
}
