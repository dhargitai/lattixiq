#!/usr/bin/env node

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function generateIcons() {
  console.log("Generating PWA icons...");

  for (const size of ICON_SIZES) {
    const svgPath = path.join(PUBLIC_DIR, `icon-${size}x${size}.svg`);
    const pngPath = path.join(PUBLIC_DIR, `icon-${size}x${size}.png`);

    try {
      // Read SVG file
      const svgContent = await fs.readFile(svgPath, "utf-8");

      // Convert SVG to PNG using sharp
      await sharp(Buffer.from(svgContent)).resize(size, size).png().toFile(pngPath);

      console.log(`✓ Generated ${path.basename(pngPath)}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${path.basename(pngPath)}:`, error);
    }
  }

  // Also generate favicon.ico from the smallest icon
  try {
    const svgContent = await fs.readFile(path.join(PUBLIC_DIR, "icon-72x72.svg"), "utf-8");

    // Generate different sizes for favicon
    const sizes = [16, 32, 48];
    const buffers = await Promise.all(
      sizes.map((size) => sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer())
    );

    // For now, just use the 32x32 as favicon.ico
    await sharp(buffers[1]).toFile(path.join(PUBLIC_DIR, "favicon.ico"));

    console.log("✓ Generated favicon.ico");
  } catch (error) {
    console.error("✗ Failed to generate favicon.ico:", error);
  }

  console.log("\n✨ Icon generation complete!");
}

generateIcons().catch(console.error);
