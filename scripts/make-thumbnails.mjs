// Makes smaller copies of the photographs in public/images/ for the site to show:
// - 480 px and 960 px wide WebP copies, used by the photo grids, the homepage
//   slideshow and photo pages (the browser picks the size that fits the screen)
// - a 1,200 px JPEG used as the preview picture when a page is shared on
//   WhatsApp, Facebook, email and so on
//
// Runs automatically before `npm run dev` and `npm run build`, so there is
// nothing to do by hand: add the original image to public/images/ as usual.
// Copies go to public/images/thumbs/, which is not committed (the deploy
// workflow makes them fresh on every build). Unchanged images are skipped.
//
// If sharp can't be loaded, the site still builds and shows the originals.

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const SRC = 'public/images';
const OUT = join(SRC, 'thumbs');
const WIDTHS = [480, 960];
const OG_WIDTH = 1200;
// Logos and full-resolution originals offered as downloads aren't photographs shown on pages
const SKIP = (name) => name.includes('logo') || extname(name).toLowerCase() === '.png';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[thumbnails] sharp is not available; the site will use the original images.');
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
const fresh = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

const manifest = {};
let made = 0;
for (const name of readdirSync(SRC).sort()) {
  const src = join(SRC, name);
  if (!statSync(src).isFile() || !/\.(jpe?g|png)$/i.test(name) || SKIP(name)) continue;

  const stem = basename(name, extname(name));
  const { width, height } = await sharp(src).metadata();
  const entry = { width, height, sizes: {} };

  for (const w of WIDTHS.filter((w) => w < width)) {
    const file = `${stem}-${w}.webp`;
    const out = join(OUT, file);
    if (!fresh(out, src)) {
      await sharp(src).resize({ width: w }).webp({ quality: 72 }).toFile(out);
      made++;
    }
    entry.sizes[w] = `/images/thumbs/${file}`;
  }

  const ogW = Math.min(OG_WIDTH, width);
  const ogFile = `${stem}-og.jpg`;
  const ogOut = join(OUT, ogFile);
  if (!fresh(ogOut, src)) {
    await sharp(src).resize({ width: ogW }).flatten({ background: '#ffffff' }).jpeg({ quality: 78, mozjpeg: true }).toFile(ogOut);
    made++;
  }
  entry.og = { src: `/images/thumbs/${ogFile}`, width: ogW, height: Math.round((height * ogW) / width) };

  manifest[`/images/${name}`] = entry;
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`[thumbnails] ${Object.keys(manifest).length} images, ${made} copies made.`);
