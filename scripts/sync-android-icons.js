import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const resDir = path.resolve('./android/app/src/main/res');

function generateIcon(width, height) {
  const png = new PNG({ width, height });
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width / 512;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      
      const gradT = (x / width + y / height) / 2;
      let r = Math.round(255 * (1 - gradT) + 215 * gradT);
      let g = Math.round(107 * (1 - gradT) + 38 * gradT);
      let b = Math.round(53 * (1 - gradT) + 56 * gradT);
      let a = 255;

      const cornerRadius = width * 0.22;
      const dx = Math.max(0, Math.abs(x - centerX) - (centerX - cornerRadius));
      const dy = Math.max(0, Math.abs(y - centerY) - (centerY - cornerRadius));
      const distToCorner = Math.sqrt(dx * dx + dy * dy);
      if (distToCorner > cornerRadius) {
        a = 0;
      } else if (distToCorner > cornerRadius - 1.5) {
        a = Math.round(255 * (1 - (distToCorner - (cornerRadius - 1.5)) / 1.5));
      }

      if (a > 0) {
        const relX = (x - centerX) / (scale * 0.85);
        const relY = (y - (centerY - 20 * scale)) / (scale * 0.85);

        let isIconPixel = false;
        const knobDist = Math.sqrt(relX * relX + (relY + 80) * (relY + 80));
        if (knobDist <= 16) isIconPixel = true;

        if (relY >= -70 && relY <= 30) {
          const domeRadius = 110;
          const domeYOffset = 30;
          const distSq = relX * relX + (relY - domeYOffset) * (relY - domeYOffset);
          if (distSq <= domeRadius * domeRadius && relY <= 30) isIconPixel = true;
        }

        if (relX >= -120 && relX <= 120 && relY >= 35 && relY <= 52) isIconPixel = true;

        if (relY >= -115 && relY <= -90 && Math.abs(relX) <= 60) {
          const wave = Math.sin(relY * 0.25) * 8;
          if (Math.abs(relX - wave) <= 4 || Math.abs(relX - 35 - wave) <= 3.5 || Math.abs(relX + 35 - wave) <= 3.5) {
            isIconPixel = true;
          }
        }

        if (relY >= 68 && relY <= 118) {
          if (relX >= -35 && relX <= -20) isIconPixel = true;
          if (relX >= 20 && relX <= 35) isIconPixel = true;
          const diagProgress = (relY - 68) / 50;
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

const sizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

for (const { folder, size } of sizes) {
  const dir = path.join(resDir, folder);
  if (fs.existsSync(dir)) {
    const buffer = generateIcon(size, size);
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), buffer);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), buffer);
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), buffer);
    console.log(`Synced ${folder} (${size}x${size})`);
  }
}

console.log('Finished syncing Android native launcher icons!');
