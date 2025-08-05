#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Create a 1x1 pixel PNG as placeholder
const createPlaceholderPng = () => {
  // This is a minimal 1x1 pixel PNG (transparent)
  const buffer = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d, // IHDR chunk length
    0x49,
    0x48,
    0x44,
    0x52, // IHDR
    0x00,
    0x00,
    0x00,
    0x01, // width: 1
    0x00,
    0x00,
    0x00,
    0x01, // height: 1
    0x08,
    0x06, // bit depth: 8, color type: 6 (RGBA)
    0x00,
    0x00,
    0x00, // compression, filter, interlace
    0x1f,
    0x15,
    0xc4,
    0x89, // CRC
    0x00,
    0x00,
    0x00,
    0x0a, // IDAT chunk length
    0x49,
    0x44,
    0x41,
    0x54, // IDAT
    0x78,
    0x9c,
    0x62,
    0x00,
    0x00,
    0x00,
    0x02,
    0x00,
    0x01, // compressed data
    0xe5,
    0x27,
    0xde,
    0xfc, // CRC
    0x00,
    0x00,
    0x00,
    0x00, // IEND chunk length
    0x49,
    0x45,
    0x4e,
    0x44, // IEND
    0xae,
    0x42,
    0x60,
    0x82, // CRC
  ]);
  return buffer;
};

const publicDir = path.join(__dirname, "..", "public");
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create placeholder PNG files
const pngBuffer = createPlaceholderPng();

sizes.forEach((size) => {
  const pngPath = path.join(publicDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Created placeholder ${pngPath}`);
});

// Create badge
fs.writeFileSync(path.join(publicDir, "badge-72x72.png"), pngBuffer);
console.log("Created placeholder badge-72x72.png");

console.log("\nNote: These are placeholder PNG files. For production, generate proper icons.");
