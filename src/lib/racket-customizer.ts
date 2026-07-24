import {
  RACKET_CUSTOMIZER_PROFILES,
  type RacketCustomizerProfile,
} from "../data/racket-customizer-profiles.generated";

export function imageProductCode(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    if (
      url.protocol !== "https:"
      || url.hostname !== "img.tennis-warehouse.com"
      || url.pathname !== "/watermark/rs.php"
    ) {
      return null;
    }

    const pathValues = url.searchParams.getAll("path");
    if (pathValues.length !== 1) {
      return null;
    }

    return (
      pathValues[0]?.match(/^([A-Z0-9]+)-1\.jpg$/i)?.[1]?.toUpperCase()
      ?? null
    );
  } catch {
    return null;
  }
}

export function resolveCustomizerProfile(
  slug: string,
  imageUrl: string,
): RacketCustomizerProfile | null {
  const profile = RACKET_CUSTOMIZER_PROFILES.find((item) => item.slug === slug);

  return profile && imageProductCode(imageUrl) === profile.productCode
    ? profile
    : null;
}

export function matchesCustomizerDimensions(
  profile: RacketCustomizerProfile,
  naturalWidth: number,
  naturalHeight: number,
): boolean {
  return Number.isFinite(naturalWidth)
    && Number.isFinite(naturalHeight)
    && naturalWidth > 0
    && naturalHeight > 0
    && naturalWidth === profile.intrinsicWidth
    && naturalHeight === profile.intrinsicHeight;
}
