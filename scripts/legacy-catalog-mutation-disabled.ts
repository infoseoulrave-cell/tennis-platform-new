export function disableLegacyCatalogMutation(): never {
  throw new Error(
    "Legacy catalog mutation scripts are disabled. "
    + "Use scripts/backfill-racket-evidence.ts: run its default dry-run first, "
    + "then use the exact --apply flag only after review.",
  );
}
