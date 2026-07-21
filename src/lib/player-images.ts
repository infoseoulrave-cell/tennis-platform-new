export function playerThumbnailUrl(url: string): string {
  if (!url.startsWith("https://upload.wikimedia.org/wikipedia/commons/thumb/")) return url;
  return url.replace(/\/(?:\d+)px-([^/]+)$/, "/240px-$1");
}

