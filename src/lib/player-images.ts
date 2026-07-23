const WIKIMEDIA_COMMONS_ORIGIN = "https://upload.wikimedia.org";
const WIKIMEDIA_COMMONS_PATH = "/wikipedia/commons/";
const PLAYER_THUMBNAIL_WIDTH = 250;

export function playerThumbnailUrl(url: string): string {
  let imageUrl: URL;

  try {
    imageUrl = new URL(url);
  } catch {
    return url;
  }

  if (
    imageUrl.origin !== WIKIMEDIA_COMMONS_ORIGIN
    || !imageUrl.pathname.startsWith(WIKIMEDIA_COMMONS_PATH)
  ) {
    return url;
  }

  const commonsPath = imageUrl.pathname.slice(WIKIMEDIA_COMMONS_PATH.length);
  const pathParts = commonsPath.split("/");

  if (pathParts[0] === "thumb") {
    const thumbnailName = pathParts.at(-1);
    if (!thumbnailName || !/^\d+px-/.test(thumbnailName)) return url;

    pathParts[pathParts.length - 1] = thumbnailName.replace(
      /^\d+px-/,
      `${PLAYER_THUMBNAIL_WIDTH}px-`,
    );
    imageUrl.pathname = `${WIKIMEDIA_COMMONS_PATH}${pathParts.join("/")}`;
    return imageUrl.toString();
  }

  if (pathParts.length !== 3 || pathParts.some((part) => !part)) return url;

  const filename = pathParts[2];
  imageUrl.pathname = `${WIKIMEDIA_COMMONS_PATH}thumb/${commonsPath}/${PLAYER_THUMBNAIL_WIDTH}px-${filename}`;
  return imageUrl.toString();
}

