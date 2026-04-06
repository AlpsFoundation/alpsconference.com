/** Public asset path with Vite/Astro `base` prefix (e.g. `/` or `/conference/`). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return base + normalized;
}
