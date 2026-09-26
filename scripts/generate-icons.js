import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('./public');
const logoPath = path.join(publicDir, 'nuvvo-logo.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(logoPath)) {
  console.error(`Error: Source logo not found at ${logoPath}`);
  process.exit(1);
}

// Dark background matching the edge of the Nuvvo circular badge
const darkBg = { r: 11, g: 11, b: 11, alpha: 1 };

async function generateIcons() {
  console.log(`Reading source logo from: ${logoPath}`);

  // 1. Standard PWA 192x192
  await sharp(logoPath)
    .resize(192, 192, { fit: 'contain', background: darkBg })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✔ Generated public/pwa-192x192.png');

  // 2. Standard PWA 512x512
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: darkBg })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✔ Generated public/pwa-512x512.png');

  // 3. Maskable PWA 512x512
  // Android / W3C safe zone specification is the inner 80% circle (radius 40% of min dimension).
  // 512 * 0.80 = ~410px. We scale the logo to 410x410 and pad it to 512x512 on dark background.
  const safeSize = 410;
  const padding = Math.round((512 - safeSize) / 2);
  const safeLogoBuffer = await sharp(logoPath)
    .resize(safeSize, safeSize, { fit: 'contain', background: darkBg })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: darkBg,
    },
  })
    .composite([{ input: safeLogoBuffer, top: padding, left: padding }])
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✔ Generated public/pwa-maskable-512x512.png (inside Android safe zone)');

  // 4. Apple Touch Icon 180x180
  await sharp(logoPath)
    .resize(180, 180, { fit: 'contain', background: darkBg })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✔ Generated public/apple-touch-icon.png');

  // 5. Favicon 64x64
  await sharp(logoPath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✔ Generated public/favicon.png');

  // 6. SVG container wrapping the actual Nuvvo logo as base64 to ensure zero old SVG artifacts remain
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0b0b0b"/>
  <image href="data:image/png;base64,${logoBase64}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>\n`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('✔ Generated public/icon.svg (from actual Nuvvo logo)');

  console.log('Finished generating all PWA and web icons from actual Nuvvo logo.');
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
