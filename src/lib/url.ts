// Prefixes an internal path with the site's base path, so links keep working
// when the site is served from a GitHub Pages project subfolder.
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
