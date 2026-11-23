// Tells search engines they may index the site and where the sitemap is.
// Note: search engines only read robots.txt at the root of a domain, so on a
// GitHub Pages project address (username.github.io/repo/) submit the sitemap in
// Google Search Console instead. With a custom domain this file does the job.
import type { APIRoute } from 'astro';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
