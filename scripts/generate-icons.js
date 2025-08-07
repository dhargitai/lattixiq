#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Create a simple SVG icon
const createSvgIcon = (
  size
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#6366f1" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}px" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">LQ</text>
</svg>`;

// Convert SVG to PNG using canvas (placeholder - in production use proper tools)
const createPngPlaceholder = (size) =>
  // For now, we'll create a simple HTML file that can be opened to save as PNG
  `<!DOCTYPE html>
<html>
<head>
  <title>Icon ${size}x${size}</title>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; }
    .icon { display: inline-block; margin: 10px; }
  </style>
</head>
<body>
  <div class="icon">
    ${createSvgIcon(size)}
  </div>
  <p>Right-click and save as icon-${size}x${size}.png</p>
</body>
</html>`;
// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach((size) => {
  const svgContent = createSvgIcon(size);
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created ${svgPath}`);
});

// Create a badge icon (smaller, for notification badge)
const badgeContent = createSvgIcon(72);
fs.writeFileSync(path.join(publicDir, "badge-72x72.svg"), badgeContent);
console.log(`Created badge-72x72.svg`);

// Create an HTML file to help convert to PNG
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>LattixIQ Icons</title>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
    .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .icon-item { background: white; padding: 20px; text-align: center; border-radius: 8px; }
    .icon { display: inline-block; margin: 10px; }
    .download-link { display: block; margin-top: 10px; color: #6366f1; }
  </style>
</head>
<body>
  <h1>LattixIQ PWA Icons</h1>
  <p>Use these icons for the PWA manifest. You can use an online tool to convert SVG to PNG.</p>
  <div class="icon-grid">
    ${sizes
      .map(
        (size) => `
    <div class="icon-item">
      <div class="icon">${createSvgIcon(size)}</div>
      <p>icon-${size}x${size}.png</p>
      <a href="icon-${size}x${size}.svg" download class="download-link">Download SVG</a>
    </div>
    `
      )
      .join("")}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, "generate-icons.html"), htmlContent);
console.log("\nCreated generate-icons.html - Open this file in a browser to view all icons");
console.log(
  "\nNote: For production, use proper image generation tools to create PNG files from these SVGs."
);
