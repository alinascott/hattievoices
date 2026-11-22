// Picks the smaller copies of a photograph made by scripts/make-thumbnails.mjs.
// If the copies haven't been made (for example sharp failed to install), every
// helper falls back to the original image, so pages still work.

import { existsSync, readFileSync } from 'node:fs';
import { url } from './url';

type Entry = {
  width: number;
  height: number;
  sizes: Record<string, string>;
  og: { src: string; width: number; height: number };
};

const MANIFEST = 'public/images/thumbs/manifest.json';
let cache: Record<string, Entry> | undefined;
function manifest(): Record<string, Entry> {
  if (!cache) cache = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  return cache!;
}

export type ResponsiveImage = { src: string; srcset?: string; width?: number; height?: number };

/**
 * `src`, `srcset`, `width` and `height` for an <img>. Pair with a `sizes` attribute
 * saying how wide the image is shown, so the browser downloads the smallest copy that fits.
 */
export function responsive(path: string): ResponsiveImage {
  const e = manifest()[path];
  if (!e) return { src: url(path) };
  const set = Object.entries(e.sizes).map(([w, src]) => `${url(src)} ${w}w`);
  set.push(`${url(path)} ${e.width}w`);
  return { src: url(path), srcset: set.join(', '), width: e.width, height: e.height };
}

/** Absolute URL and size of the picture shown when a page is shared, or undefined if none was made. */
export function shareImage(path: string, site: URL | undefined) {
  const og = manifest()[path]?.og;
  if (!og) return undefined;
  return { src: new URL(url(og.src), site).href, width: og.width, height: og.height };
}
