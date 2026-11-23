// Lists every public page so search engines can find them all.
// Served at /sitemap.xml; robots.txt points to it. New stories, photographs and
// media records are added automatically, so there is nothing to update by hand.
import type { APIRoute } from 'astro';
import { getMedia, getPhotos, getStories } from '../lib/content';
import { url } from '../lib/url';

const PAGES = ['/', '/stories/', '/photographs/', '/media/', '/about/', '/get-involved/'];

export const GET: APIRoute = async ({ site }) => {
  const abs = (path: string) => new URL(url(path), site).href;
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const entries: { loc: string; lastmod?: string }[] = [
    ...PAGES.map((p) => ({ loc: abs(p) })),
    ...(await getStories()).map((s) => ({ loc: abs(`/stories/${s.id}/`), lastmod: day(s.data.published) })),
    ...(await getPhotos()).map((p) => ({ loc: abs(`/photographs/${p.id}/`), lastmod: day(p.data.published) })),
    ...(await getMedia()).map((m) => ({ loc: abs(`/media/${m.id}/`), lastmod: day(m.data.published) })),
  ];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
