import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { disableLegacyCatalogMutation } from "../scripts/legacy-catalog-mutation-disabled";

const LEGACY_MUTATORS = [
  "scripts/cleanup-discontinued.ts",
  "scripts/fix-images-v2.ts",
  "scripts/fix-images.ts",
  "scripts/modernize-catalog.ts",
  "scripts/recalibrate-scores.ts",
  "scripts/update-images-2.ts",
  "scripts/update-images.ts",
  "src/db/seed-aliases.ts",
  "src/db/seed-rackets.ts",
  "src/db/seed.ts",
] as const;

const PACKAGE_SEED_COMMANDS = {
  "db:seed": "tsx src/db/seed.ts",
  "db:seed-aliases": "tsx src/db/seed-aliases.ts",
  "db:seed-rackets": "tsx src/db/seed-rackets.ts",
} as const;

const MUTATION_PATTERN =
  /\.(?:delete|insert|update|upsert)\s*\(|\b(?:DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+\w+)\b/i;

test("the shared legacy catalog mutation guard always directs operators to the canonical backfill", () => {
  assert.throws(
    () => disableLegacyCatalogMutation(),
    /scripts\/backfill-racket-evidence\.ts.*dry-run.*--apply/is,
  );
});

test("every legacy catalog mutator is inventoried and calls the guard first", async () => {
  const workspaceRoot = new URL("../", import.meta.url);
  const directories = [
    { path: "scripts/", include: (name: string) => name.endsWith(".ts") },
    { path: "src/db/", include: (name: string) => /^seed.*\.ts$/.test(name) },
  ];
  const discoveredMutators: string[] = [];

  for (const directory of directories) {
    const directoryUrl = new URL(directory.path, workspaceRoot);
    for (const name of await readdir(directoryUrl)) {
      if (!directory.include(name)) continue;
      const relativePath = `${directory.path}${name}`;
      if (
        relativePath === "scripts/backfill-racket-evidence.ts"
        || relativePath === "scripts/expand-racket-catalog.ts"
        || relativePath === "scripts/legacy-catalog-mutation-disabled.ts"
      ) {
        continue;
      }
      const source = await readFile(new URL(relativePath, workspaceRoot), "utf8");
      if (MUTATION_PATTERN.test(source)) discoveredMutators.push(relativePath);
    }
  }

  assert.deepEqual(discoveredMutators.sort(), [...LEGACY_MUTATORS].sort());

  for (const relativePath of LEGACY_MUTATORS) {
    const source = await readFile(new URL(relativePath, workspaceRoot), "utf8");
    assert.match(
      source,
      /import\s*{\s*disableLegacyCatalogMutation\s*}\s*from\s*["'][^"']*legacy-catalog-mutation-disabled["']/,
      `${relativePath} must import the shared guard`,
    );
    assert.match(
      source,
      /(?:export\s+)?async function (?:main|updateImages|seed|seedAliases|seedRackets)\([^)]*\)(?::\s*Promise<void>)?\s*{\s*disableLegacyCatalogMutation\(\);/,
      `${relativePath} must call the shared guard before any entrypoint work`,
    );
  }
});

test("every executable package seed command points only to an inventoried guarded file", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as { scripts?: Record<string, string> };
  const seedCommands = Object.fromEntries(
    Object.entries(packageJson.scripts ?? {}).filter(([name]) =>
      name === "db:seed" || name.startsWith("db:seed-")
    ),
  );

  assert.deepEqual(seedCommands, PACKAGE_SEED_COMMANDS);
  for (const command of Object.values(seedCommands)) {
    const match = command.match(/^tsx (src\/db\/seed(?:-[a-z]+)?\.ts)$/);
    assert.ok(match);
    assert.ok(LEGACY_MUTATORS.includes(match[1] as typeof LEGACY_MUTATORS[number]));
  }
});
