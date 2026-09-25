import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="nuvvoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B35" />
      <stop offset="50%" stop-color="#F2542D" />
      <stop offset="100%" stop-color="#D72638" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#nuvvoGrad)" />
  <!-- Cloche / Gourmet Food Cover -->
  <g filter="url(#shadow)" fill="#FFFFFF">
    <path d="M256 120 c-11 0 -20 9 -20 20 c0 6 3 11 7 15 c-68 11 -119 68 -119 137 l264 0 c0 -69 -51 -126 -119 -137 c4 -4 7 -9 7 -15 c0 -11 -9 -20 -20 -20 z" />
    <!-- Serving Platter -->
    <rect x="100" y="300" width="312" height="24" rx="12" fill="#FFFFFF" />
    <!-- Stylized 'N' Monogram inside dish -->
    <path d="M190 350 L190 410 L226 410 L286 350 L322 350 L322 410" stroke="#FFFFFF" stroke-width="0" fill="none"/>
    <!-- Modern N badge -->
    <text x="256" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NUVVO</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

function generatePNG(width, height, isMaskable = false) {
  const png = new PNG({ width, height });
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width / 512;
  
  // Safe zone radius for maskable: 40% of min dimension
  // Standard radius: 46% of min dimension
  const maxRadius = Math.min(width, height) * (isMaskable ? 0.40 : 0.46);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      
      // Background gradient (Orange #FF5722 to Deep Orange #D72638)
      const gradT = (x / width + y / height) / 2;
      let r = Math.round(255 * (1 - gradT) + 215 * gradT);
      let g = Math.round(107 * (1 - gradT) + 38 * gradT);
      let b = Math.round(53 * (1 - gradT) + 56 * gradT);
      let a = 255;

      if (!isMaskable) {
        // Rounded corners for standard app icon
        const cornerRadius = width * 0.22;
        const dx = Math.max(0, Math.abs(x - centerX) - (centerX - cornerRadius));
        const dy = Math.max(0, Math.abs(y - centerY) - (centerY - cornerRadius));
        const distToCorner = Math.sqrt(dx * dx + dy * dy);
        if (distToCorner > cornerRadius) {
          a = 0;
        } else if (distToCorner > cornerRadius - 1.5) {
          a = Math.round(255 * (1 - (distToCorner - (cornerRadius - 1.5)) / 1.5));
        }
      }

      if (a > 0) {
        // Draw cloche dome & plate in white in center
        const relX = (x - centerX) / (scale * (isMaskable ? 0.75 : 0.85));
        const relY = (y - (centerY - (isMaskable ? 15 : 20) * scale)) / (scale * (isMaskable ? 0.75 : 0.85));

        let isIconPixel = false;

        // Cloche knob
        const knobDist = Math.sqrt(relX * relX + (relY + 80) * (relY + 80));
        if (knobDist <= 16) isIconPixel = true;

        // Cloche dome
        if (relY >= -70 && relY <= 30) {
          const domeRadius = 110;
          const domeYOffset = 30;
          const distSq = relX * relX + (relY - domeYOffset) * (relY - domeYOffset);
          if (distSq <= domeRadius * domeRadius && relY <= 30) {
            isIconPixel = true;
          }
        }

        // Serving tray bar
        if (relX >= -120 && relX <= 120 && relY >= 35 && relY <= 52) {
          isIconPixel = true;
        }

        // Steaming culinary wave lines above
        if (relY >= -115 && relY <= -90 && Math.abs(relX) <= 60) {
          const wave = Math.sin(relY * 0.25) * 8;
          if (Math.abs(relX - wave) <= 4 || Math.abs(relX - 35 - wave) <= 3.5 || Math.abs(relX + 35 - wave) <= 3.5) {
            isIconPixel = true;
          }
        }

        // Modern Nuvvo "N" monogram below tray
        if (relY >= 68 && relY <= 118) {
          // Left stem
          if (relX >= -35 && relX <= -20) isIconPixel = true;
          // Right stem
          if (relX >= 20 && relX <= 35) isIconPixel = true;
          // Diagonal
          const diagProgress = (relY - 68) / 50; // 0 to 1
          const diagX = -25 + diagProgress * 50;
          if (Math.abs(relX - diagX) <= 10) isIconPixel = true;
        }

        if (isIconPixel) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), generatePNG(64, 64, false));

console.log('Successfully generated all PWA & Android app icons in /public!');
