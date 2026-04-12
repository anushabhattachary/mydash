#!/usr/bin/env node

/**
 * Generate all required PWA icon sizes from a source image.
 * 
 * Usage:
 *   node scripts/generate-icons.mjs [source-image-path]
 * 
 * If no source image is provided, generates placeholder icons
 * with the Lilac brand colors.
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const iconsDir = join(projectRoot, 'public', 'icons');
const screenshotsDir = join(projectRoot, 'public', 'screenshots');

// All required sizes
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure directories exist
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir, { recursive: true });

const sourceImage = process.argv[2];

async function generatePlaceholderIcon(size, filename) {
  // Create a warm linen background with a lilac-colored circle and "L"
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#FAF7F2"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.38}" fill="#C4A882" opacity="0.9"/>
      <text x="${size/2}" y="${size * 0.62}" text-anchor="middle" 
            font-family="Georgia, serif" font-size="${size * 0.45}" 
            font-weight="600" fill="#FAF7F2">L</text>
    </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(iconsDir, filename));
  console.log(`  ✓ Generated ${filename} (${size}x${size})`);
}

async function generateMaskableIcon(size, filename) {
  // Maskable icons need content in the center 80% (safe zone)
  const padding = Math.round(size * 0.1);
  const innerSize = size - padding * 2;
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#C4A882"/>
      <circle cx="${size/2}" cy="${size/2}" r="${innerSize * 0.38}" fill="#FAF7F2" opacity="0.95"/>
      <text x="${size/2}" y="${size * 0.62}" text-anchor="middle" 
            font-family="Georgia, serif" font-size="${innerSize * 0.45}" 
            font-weight="600" fill="#C4A882">L</text>
    </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(iconsDir, filename));
  console.log(`  ✓ Generated ${filename} (${size}x${size} maskable)`);
}

async function generateFromSource(sourcePath) {
  console.log(`\n🪻 Generating icons from: ${sourcePath}\n`);
  
  for (const size of SIZES) {
    await sharp(sourcePath)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(join(iconsDir, `icon-${size}.png`));
    console.log(`  ✓ Generated icon-${size}.png (${size}x${size})`);
  }
  
  // Maskable version: add padding so content stays in safe zone (center 80%)
  const maskableSize = 512;
  const safeZone = Math.round(maskableSize * 0.8);
  const padding = Math.round((maskableSize - safeZone) / 2);
  
  const resizedContent = await sharp(sourcePath)
    .resize(safeZone, safeZone, { fit: 'contain', background: { r: 196, g: 168, b: 130, alpha: 1 } })
    .toBuffer();
  
  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 196, g: 168, b: 130, alpha: 255 },
    },
  })
    .composite([{ input: resizedContent, top: padding, left: padding }])
    .png()
    .toFile(join(iconsDir, 'icon-512-maskable.png'));
  
  console.log(`  ✓ Generated icon-512-maskable.png (512x512 maskable)`);
}

async function generatePlaceholders() {
  console.log('\n🪻 Generating placeholder icons (replace with your real icon later)\n');
  
  for (const size of SIZES) {
    await generatePlaceholderIcon(size, `icon-${size}.png`);
  }
  
  await generateMaskableIcon(512, 'icon-512-maskable.png');
}

async function generatePlaceholderScreenshot() {
  const width = 390;
  const height = 844;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#FAF7F2"/>
      <text x="${width/2}" y="${height/2 - 40}" text-anchor="middle" 
            font-family="Georgia, serif" font-size="48" fill="#C4A882">🪻</text>
      <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle" 
            font-family="Georgia, serif" font-size="32" fill="#1e293b">Lilac</text>
      <text x="${width/2}" y="${height/2 + 60}" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">Your Daily Sanctuary</text>
    </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(screenshotsDir, 'mobile-home.png'));
  console.log(`  ✓ Generated mobile-home.png screenshot placeholder`);
}

async function main() {
  if (sourceImage) {
    await generateFromSource(sourceImage);
  } else {
    await generatePlaceholders();
  }
  
  await generatePlaceholderScreenshot();
  
  console.log('\n✅ All icons generated in /public/icons/');
  console.log('📸 Screenshot placeholder generated in /public/screenshots/\n');
  
  if (!sourceImage) {
    console.log('💡 To generate from your real 1024x1024 icon:');
    console.log('   node scripts/generate-icons.mjs path/to/your-icon-1024.png\n');
  }
}

main().catch(console.error);
