export function racketCustomizerPath(slug: string): string {
  return `/customizer/${encodeURIComponent(slug)}`;
}
