/**
 * 제품 사진에서 라켓별 프레임 대표색을 뽑아
 * `src/data/racket-colorways.generated.ts` 를 만든다.
 *
 *   node --env-file=.env.local --import tsx scripts/generate-racket-colorways.ts
 *   node --env-file=.env.local --import tsx scripts/generate-racket-colorways.ts --check
 *
 * `--check` 는 파일을 쓰지 않고 현재 산출물과 달라지는지만 본다. 같은 입력에
 * 같은 출력이 나오는지 확인하는 용도다.
 *
 * sharp 는 devDependency 이며 이 스크립트에서만 쓴다. 런타임 번들에는 들어가지
 * 않는다.
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

import {
  extractColorway,
  type ExtractedColorway,
} from "./lib/racket-colorway-extraction";

const OUTPUT = fileURLToPath(
  new URL("../src/data/racket-colorways.generated.ts", import.meta.url),
);

/** 사진을 이 폭으로 줄여서 처리한다. 대표색에는 충분하고 훨씬 빠르다. */
const WORK_WIDTH = 480;

type CatalogRow = {
  slug: string;
  name: string;
  imageUrl: string;
};

function generateSlug(brand: string, model: string, year: number | null): string {
  const modelHasYear =
    year != null && new RegExp(`(?:^|\\D)${year}(?:\\D|$)`).test(model);
  return [brand, model, modelHasYear ? "" : year ?? ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadCatalog(): Promise<CatalogRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
    );
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("racket_models")
    .select(
      `id, name, release_year, image_url,
       brands!inner(name),
       racket_specs!inner(head_size_sq_in)`,
    )
    .eq("discontinued", false)
    .eq("racket_specs.ingestion_state", "published");

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const record = row as unknown as {
        name: string;
        release_year: number | null;
        image_url: string | null;
        brands: { name: string } | { name: string }[];
      };
      const brand = Array.isArray(record.brands)
        ? record.brands[0]?.name
        : record.brands?.name;
      if (!brand || !record.image_url) return null;
      return {
        slug: generateSlug(brand, record.name, record.release_year),
        name: `${brand} ${record.name}`,
        imageUrl: record.image_url,
      };
    })
    .filter((row): row is CatalogRow => row !== null)
    // 정렬해 두면 산출물 순서가 매번 같다.
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

async function colorwayFor(row: CatalogRow): Promise<ExtractedColorway | null> {
  const response = await fetch(row.imageUrl);
  if (!response.ok) return null;

  const buffer = Buffer.from(await response.arrayBuffer());
  const { data, info } = await sharp(buffer)
    .resize({ width: WORK_WIDTH, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return extractColorway({
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  });
}

function render(entries: [string, ExtractedColorway][]): string {
  const lines = entries.map(
    ([slug, colorway]) =>
      `  ${JSON.stringify(slug)}: { primary: "${colorway.primary}", secondary: "${colorway.secondary}" },`,
  );

  return `/**
 * 자동 생성 파일입니다. 직접 고치지 마세요.
 *
 *   node --env-file=.env.local --import tsx scripts/generate-racket-colorways.ts
 *
 * 제품 사진에서 프레임 대표색을 뽑은 결과입니다. 추출에 실패한 라켓은 아예
 * 넣지 않으며, 화면에서는 중립색으로 그려집니다. 색을 지어내지 않습니다.
 */

export type GeneratedColorway = {
  readonly primary: string;
  readonly secondary: string;
};

export const RACKET_COLORWAYS: Readonly<Record<string, GeneratedColorway>> = {
${lines.join("\n")}
};

export function colorwayForSlug(slug: string): GeneratedColorway | null {
  return RACKET_COLORWAYS[slug] ?? null;
}
`;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const catalog = await loadCatalog();
  console.log(`catalog: ${catalog.length} rackets with a product photo`);

  const entries: [string, ExtractedColorway][] = [];
  const failures: string[] = [];

  for (const row of catalog) {
    try {
      const colorway = await colorwayFor(row);
      if (!colorway) {
        failures.push(`${row.slug} (근거 부족)`);
        continue;
      }
      entries.push([row.slug, colorway]);
      console.log(
        `  ${row.slug.padEnd(38)} ${colorway.primary} / ${colorway.secondary}  ` +
          `coverage ${(colorway.coverage * 100).toFixed(1)}%`,
      );
    } catch (error) {
      failures.push(`${row.slug} (${(error as Error).message})`);
    }
  }

  const output = render(entries);

  if (checkOnly) {
    const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : "";
    if (current === output) {
      console.log("\n--check: 산출물이 동일합니다 (결정적)");
      return;
    }
    console.error("\n--check: 산출물이 달라졌습니다");
    process.exitCode = 1;
    return;
  }

  writeFileSync(OUTPUT, output, "utf8");
  console.log(`\nwrote ${entries.length} colorways -> ${OUTPUT}`);
  if (failures.length > 0) {
    // 조용히 빠뜨리면 "다 됐다"로 읽힌다. 빠진 것은 반드시 남긴다.
    console.log(`추출 실패 ${failures.length}건 (중립색으로 렌더됩니다):`);
    for (const failure of failures) console.log(`  - ${failure}`);
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
