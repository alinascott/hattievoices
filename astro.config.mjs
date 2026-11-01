// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/.
// The deploy workflow sets SITE_URL and BASE_PATH; locally both fall back to the root.
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
});
