#!/usr/bin/env node
// Gemini(또는 아무 이미지 툴)에서 받은 PNG/JPG를 public/images 의 webp 로 변환·교체한다.
// 기존 파일은 public/images/.backup 에 자동 백업.
//
// 사용법:
//   node scripts/replace-image.mjs <입력.png> <이름> [--width=1408] [--quality=82]
// 예:
//   node scripts/replace-image.mjs ~/Downloads/gen.png org-process-codification
//   node scripts/replace-image.mjs ./map.png problem-solving-map --width=1408
//
// <이름> 은 확장자 제외한 파일명 (예: problem-solving-map). 결과: public/images/<이름>.webp

import sharp from 'sharp';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('='))
);

const [input, rawName] = positional;
if (!input || !rawName) {
  console.error('사용법: node scripts/replace-image.mjs <입력.png> <이름> [--width=1408] [--quality=82]');
  console.error('예:    node scripts/replace-image.mjs ~/Downloads/gen.png org-process-codification');
  process.exit(1);
}

const name = rawName.replace(/\.(webp|png|jpe?g)$/i, '');
const width = parseInt(flags.width || '1408', 10);
const quality = parseInt(flags.quality || '82', 10);
const outDir = join(root, 'public', 'images');
const out = join(outDir, `${name}.webp`);

if (!existsSync(input)) {
  console.error('입력 파일을 찾을 수 없습니다:', input);
  process.exit(1);
}

// 기존 파일 백업 (public/ 밖 — 배포에 딸려나가지 않음)
if (existsSync(out)) {
  const backupDir = join(root, '.image-backup');
  mkdirSync(backupDir, { recursive: true });
  copyFileSync(out, join(backupDir, `${name}.webp`));
  console.log(`  백업: .image-backup/${name}.webp`);
}

const src = await sharp(input).metadata();
await sharp(input)
  .resize({ width, withoutEnlargement: false }) // 폭 기준, 원본 비율 유지
  .webp({ quality })
  .toFile(out);
const dst = await sharp(out).metadata();

console.log(`✓ 교체 완료: public/images/${name}.webp`);
console.log(`  ${src.width}x${src.height} (${src.format}) → ${dst.width}x${dst.height} (webp q${quality})`);
if (Math.abs(dst.width / dst.height - 1408 / 768) > 0.05) {
  console.log('  ⚠ 16:9(1408x768)와 비율이 다릅니다 — 카드 레이아웃이 어긋날 수 있으니 16:9로 생성 권장.');
}
console.log('  확인: npm run build  (또는  npm run dev)');
