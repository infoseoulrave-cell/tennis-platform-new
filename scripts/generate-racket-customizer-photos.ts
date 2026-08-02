/**
 * 제품 사진에서 커스터마이저용 사진·마스크 세트를 만든다.
 *
 *   node --env-file=.env.local --import tsx scripts/generate-racket-customizer-photos.ts
 *   node --env-file=.env.local --import tsx scripts/generate-racket-customizer-photos.ts --check
 *
 * 라켓마다 셋을 만든다.
 *   public/images/customizer/<slug>.jpg       — 사진 사본 (마스크와 픽셀 정렬 보장)
 *   public/images/customizer/<slug>-bed.png   — 정면 스트링 베드 알파 마스크
 *   public/images/customizer/<slug>-grip.png  — 그립 알파 마스크
 * 그리고 매니페스트 `src/data/racket-customizer-photos.generated.ts` 를 생성한다.
 *
 * 제품 사진의 라켓은 스트링이 없는(unstrung) 상태다. 그래서 화면은 빈 베드
 * 위에 합성 스트링을 그리고 베드 마스크로 잘라 후프 안에만 남긴다. 영역은
 * 전부 사진에서 자동 검출한다 — 손으로 찍은 좌표는 없다. 검출 품질이 기준에
 * 못 미치는 라켓은 매니페스트에서 빠지고 화면은 스펙 도식으로 fail-closed 된다.
 *
 * `--check` 는 파일을 쓰지 않고 매니페스트가 현재 산출물과 달라지는지만 본다.
 * sharp 는 devDependency 이며 이 스크립트에서만 쓴다.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

import {
  DEFAULT_SEGMENTATION,
  fillOuterBackground,
  findGripRows,
  rowWidths,
  segmentRacketPhoto,
} from "./lib/racket-photo-segmentation";
import {
  buildGripMask,
  gripRowCoverage,
  refineBed,
  trimGripRows,
  type BBox,
} from "./lib/racket-photo-overlays";

const MANIFEST_OUTPUT = fileURLToPath(
  new URL("../src/data/racket-customizer-photos.generated.ts", import.meta.url),
);
const ASSET_DIR = fileURLToPath(
  new URL("../public/images/customizer", import.meta.url),
);

/** 표시용으로 충분하고 세그멘테이션에도 안정적인 처리 폭. */
const WORK_WIDTH = 640;

/** 그립 run 사이 이 픽셀 이하 틈은 같은 그립으로 본다 (흰 그립 내부 채움). */
const GRIP_MAX_GAP = 24;
/** 라켓 전장(27인치) 대비 그립 길이(약 7.5인치) 비율. */
const GRIP_LENGTH_RATIO = 0.28;
/** 정면 베드 폭이 사진 폭의 이 비율보다 좁으면 검출 실패로 본다. */
const MIN_BED_WIDTH_RATIO = 0.25;
/** 후프 안쪽 베드의 종횡비(세로/가로)와 채움비 허용 범위. 타원이면 채움비는
 * 약 0.785 다. 스로트가 섞이거나 흰 프레임이 삼켜진 베드는 여기서 걸러진다. */
const BED_ASPECT_MIN = 1.05;
const BED_ASPECT_MAX = 1.55;
const MIN_BED_FILL_RATIO = 0.72;
/** 그립 픽셀 하한과 행 커버리지 하한. 얼룩진 그립을 fail-closed 로 거른다. */
const MIN_GRIP_PIXELS = 1200;
const MIN_GRIP_ROW_COVERAGE = 0.85;

type CatalogRow = {
  slug: string;
  name: string;
  imageUrl: string;
};

type ManifestEntry = {
  slug: string;
  width: number;
  height: number;
  bed: BBox;
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
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

/** 마스크(0/255)를 알파 채널 PNG 바이트로 만든다. 가장자리는 살짝 부드럽게 한다. */
async function maskToPng(
  mask: Uint8Array,
  width: number,
  height: number,
): Promise<Buffer> {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < mask.length; i += 1) {
    const offset = i * 4;
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = mask[i];
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .blur(0.4)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

type ProcessResult = {
  entry: ManifestEntry;
  photo: Buffer;
  bedPng: Buffer;
  gripPng: Buffer;
  stats: { bedPixels: number; gripPixels: number; gripCoverage: number };
};

type ProcessFailure = { reason: string };

async function processRacket(
  row: CatalogRow,
): Promise<ProcessResult | ProcessFailure> {
  const response = await fetch(row.imageUrl);
  if (!response.ok) return { reason: `사진 응답 ${response.status}` };

  const source = Buffer.from(await response.arrayBuffer());
  const { data, info } = await sharp(source)
    .resize({ width: WORK_WIDTH, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const image = {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
  const segmentation = segmentRacketPhoto(image);

  const bed = refineBed(segmentation.enclosedGaps, info.width, info.height);
  if (!bed || bed.bbox.width < info.width * MIN_BED_WIDTH_RATIO) {
    return { reason: "정면 베드 검출 실패" };
  }
  const bedAspect = bed.bbox.height / bed.bbox.width;
  if (
    bedAspect < BED_ASPECT_MIN
    || bedAspect > BED_ASPECT_MAX
    || bed.fillRatio < MIN_BED_FILL_RATIO
  ) {
    return {
      reason:
        `베드 형태 미달 (종횡비 ${bedAspect.toFixed(2)}, 채움비 ${bed.fillRatio.toFixed(2)})`,
    };
  }

  // 그립은 흰색 그립이 배경에 먹히는 경우가 있어 실루엣 run 을 메워 다시 만든다.
  const outside = fillOuterBackground(image, DEFAULT_SEGMENTATION);
  const silhouette = new Uint8Array(outside.length);
  for (let i = 0; i < outside.length; i += 1) {
    silhouette[i] = outside[i] ? 0 : 1;
  }
  const widths = rowWidths(silhouette, info.width, info.height);
  const rawGripRows = findGripRows(widths, info.height);
  if (!rawGripRows) return { reason: "그립 구간 검출 실패" };

  // 실루엣 세로 길이 = 라켓 전장(27인치). 그립은 그중 약 28% 다.
  let silhouetteTop = info.height;
  let silhouetteBottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    if (widths[y] > 0) {
      if (y < silhouetteTop) silhouetteTop = y;
      silhouetteBottom = y;
    }
  }
  const racketRows = silhouetteBottom - silhouetteTop + 1;
  const gripRows = trimGripRows(
    silhouette,
    info.width,
    rawGripRows,
    GRIP_MAX_GAP,
    Math.round(racketRows * GRIP_LENGTH_RATIO),
  );

  const grip = buildGripMask(
    silhouette,
    info.width,
    info.height,
    gripRows,
    segmentation.bedMask,
    GRIP_MAX_GAP,
  );
  const gripCoverage = gripRowCoverage(
    grip.mask,
    info.width,
    info.height,
    gripRows,
  );
  if (grip.pixels < MIN_GRIP_PIXELS || gripCoverage < MIN_GRIP_ROW_COVERAGE) {
    return {
      reason: `그립 품질 미달 (${grip.pixels}px, 커버리지 ${(gripCoverage * 100).toFixed(0)}%)`,
    };
  }

  const photo = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .jpeg({ quality: 82 })
    .toBuffer();

  const bedPng = await maskToPng(bed.mask, info.width, info.height);
  const gripPng = await maskToPng(grip.mask, info.width, info.height);

  return {
    entry: {
      slug: row.slug,
      width: info.width,
      height: info.height,
      bed: bed.bbox,
    },
    photo,
    bedPng,
    gripPng,
    stats: {
      bedPixels: segmentation.bedPixels,
      gripPixels: grip.pixels,
      gripCoverage,
    },
  };
}

function renderManifest(entries: ManifestEntry[]): string {
  const lines = entries.map(
    (entry) =>
      `  ${JSON.stringify(entry.slug)}: { width: ${entry.width}, height: ${entry.height}, ` +
      `bed: { x: ${entry.bed.x}, y: ${entry.bed.y}, width: ${entry.bed.width}, height: ${entry.bed.height} } },`,
  );

  return `/**
 * 자동 생성 파일입니다. 직접 고치지 마세요.
 *
 *   node --env-file=.env.local --import tsx scripts/generate-racket-customizer-photos.ts
 *
 * 제품 사진에서 스트링 베드와 그립 영역을 자동 검출한 라켓의 목록입니다.
 * 여기 없는 라켓은 검출 품질이 기준에 못 미친 것이며, 화면은 스펙 도식으로
 * 그려집니다. 사진과 마스크는 /images/customizer/<slug>{.jpg,-bed.png,-grip.png} 입니다.
 */

export type CustomizerPhotoBed = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type CustomizerPhoto = {
  readonly width: number;
  readonly height: number;
  readonly bed: CustomizerPhotoBed;
};

export const CUSTOMIZER_PHOTOS: Readonly<Record<string, CustomizerPhoto>> = {
${lines.join("\n")}
};

export function customizerPhotoForSlug(slug: string): CustomizerPhoto | null {
  return CUSTOMIZER_PHOTOS[slug] ?? null;
}
`;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const catalog = await loadCatalog();
  console.log(`catalog: ${catalog.length} rackets with a product photo`);

  const results: ProcessResult[] = [];
  const failures: string[] = [];

  for (const row of catalog) {
    try {
      const result = await processRacket(row);
      if ("reason" in result) {
        failures.push(`${row.slug} (${result.reason})`);
        continue;
      }
      results.push(result);
      const { stats, entry } = result;
      console.log(
        `  ${row.slug.padEnd(38)} bed ${String(stats.bedPixels).padStart(6)}px ` +
          `[${entry.bed.width}x${entry.bed.height}]  grip ${String(stats.gripPixels).padStart(6)}px ` +
          `${(stats.gripCoverage * 100).toFixed(0)}%`,
      );
    } catch (error) {
      failures.push(`${row.slug} (${(error as Error).message})`);
    }
  }

  const manifest = renderManifest(results.map(({ entry }) => entry));

  if (checkOnly) {
    const current = existsSync(MANIFEST_OUTPUT)
      ? readFileSync(MANIFEST_OUTPUT, "utf8")
      : "";
    if (current === manifest) {
      console.log("\n--check: 매니페스트가 동일합니다 (결정적)");
      return;
    }
    console.error("\n--check: 매니페스트가 달라졌습니다");
    process.exitCode = 1;
    return;
  }

  mkdirSync(ASSET_DIR, { recursive: true });
  for (const { entry, photo, bedPng, gripPng } of results) {
    writeFileSync(resolve(ASSET_DIR, `${entry.slug}.jpg`), photo);
    writeFileSync(resolve(ASSET_DIR, `${entry.slug}-bed.png`), bedPng);
    writeFileSync(resolve(ASSET_DIR, `${entry.slug}-grip.png`), gripPng);
  }
  writeFileSync(MANIFEST_OUTPUT, manifest, "utf8");

  console.log(`\nwrote ${results.length} photo sets -> ${ASSET_DIR}`);
  if (failures.length > 0) {
    // 조용히 빠뜨리면 "다 됐다"로 읽힌다. 빠진 것은 반드시 남긴다.
    console.log(`제외 ${failures.length}건 (도식으로 렌더됩니다):`);
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
