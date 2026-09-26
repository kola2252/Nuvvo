import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resDir = path.resolve('./android/app/src/main/res');
const publicDir = path.resolve('./public');
const logoPath = path.join(publicDir, 'nuvvo-logo.png');

if (!fs.existsSync(logoPath)) {
  console.error(`Error: Source logo not found at ${logoPath}`);
  process.exit(1);
}

// Android launcher density specs
// size: legacy icon size (48dp)
// fgSize: adaptive foreground size (108dp)
const densities = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

const darkBg = { r: 11, g: 11, b: 11, alpha: 1 };
const transparentBg = { r: 0, g: 0, b: 0, alpha: 0 };

// Create SVG circular mask for round launcher icons
function createCircleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff" /></svg>`
  );
}

async function syncAndroidIcons() {
  console.log(`Syncing Android launcher icons from: ${logoPath}`);

  for (const { folder, size, fgSize } of densities) {
    const targetDir = path.join(resDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Standard legacy launcher icon: ic_launcher.png (size x size)
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: darkBg })
      .png({ quality: 100 })
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round legacy launcher icon: ic_launcher_round.png (size x size, circular mask)
    const baseRound = await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: darkBg })
      .toBuffer();

    await sharp(baseRound)
      .composite([{ input: createCircleMask(size), blend: 'dest-in' }])
      .png({ quality: 100 })
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Adaptive launcher foreground: ic_launcher_foreground.png (fgSize x fgSize)
    // Android Adaptive Icon spec: 108dp canvas with safe zone in the center 72dp (~67%).
    // We scale the Nuvvo logo to ~68% of fgSize and place it centered on a transparent canvas.
    const logoContentSize = Math.round(fgSize * 0.68);
    const offset = Math.round((fgSize - logoContentSize) / 2);

    const fgLogo = await sharp(logoPath)
      .resize(logoContentSize, logoContentSize, { fit: 'contain', background: transparentBg })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: transparentBg,
      },
    })
      .composite([{ input: fgLogo, top: offset, left: offset }])
      .png({ quality: 100 })
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✔ Synced ${folder}: ic_launcher (${size}x${size}), ic_launcher_round (${size}x${size}), ic_launcher_foreground (${fgSize}x${fgSize})`);
  }

  console.log('Finished syncing all Android launcher icon assets successfully!');
}

syncAndroidIcons().catch((err) => {
  console.error('Failed to sync Android icons:', err);
  process.exit(1);
});
