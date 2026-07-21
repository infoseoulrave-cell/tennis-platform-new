export function formatRacketName(model: string, releaseYear?: number | null): string {
  if (!releaseYear) return model;

  const yearPattern = new RegExp(`(^|\\D)${releaseYear}(\\D|$)`);
  return yearPattern.test(model) ? model : `${model} (${releaseYear})`;
}
