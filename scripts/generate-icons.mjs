/**
 * 生成 Android 各密度档位的图标
 * 将 public/icon-512.png（512x512）缩放为 Android 需要的各尺寸
 * 用法：node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcIcon = path.join(rootDir, 'public', 'icon-512.png');

// Android mipmap 密度配置
const densities = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192,
};

const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

async function generate() {
  for (const [density, size] of Object.entries(densities)) {
    const dir = path.join(resDir, `mipmap-${density}`);
    const outPath = path.join(dir, 'ic_launcher_foreground.png');

    // 前景图标保留透明区域（内边距约 25%）
    const padding = Math.round(size * 0.25);
    const contentSize = size - padding * 2;

    // 先缩放内容，再放到尺寸画布中央
    const content = await sharp(srcIcon)
      .resize(contentSize, contentSize)
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: content, top: padding, left: padding }])
      .png()
      .toFile(outPath);

    console.log(`  ${density}: ${size}x${size} -> ${outPath}`);
  }

  console.log('\n✅ Android mipmap 图标生成完成');
}

generate().catch((err) => {
  console.error('生成失败:', err);
  process.exit(1);
});
