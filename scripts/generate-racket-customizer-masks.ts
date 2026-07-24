import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildGeneratedProfilesModule,
  buildGripMaskSvg,
  buildStringMaskSvg,
  validateMaskGeometry,
} from "./lib/racket-customizer-mask-builder";
import { RACKET_CUSTOMIZER_MASK_GEOMETRIES } from "./racket-customizer-mask-geometry";

const projectRoot = path.resolve(import.meta.dirname, "..");
const maskDirectory = path.join(projectRoot, "public", "images", "racket-customizer");
const profilesModulePath = path.join(
  projectRoot,
  "src",
  "data",
  "racket-customizer-profiles.generated.ts",
);

async function main(): Promise<void> {
  const geometries = [...RACKET_CUSTOMIZER_MASK_GEOMETRIES].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const slugs = new Set<string>();
  const productCodes = new Set<string>();

  for (const geometry of geometries) {
    validateMaskGeometry(geometry);
    if (slugs.has(geometry.slug)) {
      throw new Error(`Duplicate mask geometry slug: ${geometry.slug}`);
    }
    if (productCodes.has(geometry.productCode)) {
      throw new Error(`Duplicate mask geometry product code: ${geometry.productCode}`);
    }
    slugs.add(geometry.slug);
    productCodes.add(geometry.productCode);
  }

  await mkdir(maskDirectory, { recursive: true });
  for (const geometry of geometries) {
    await writeFile(
      path.join(maskDirectory, `${geometry.slug}-strings.svg`),
      buildStringMaskSvg(geometry),
    );
    await writeFile(
      path.join(maskDirectory, `${geometry.slug}-grip.svg`),
      buildGripMaskSvg(geometry),
    );
  }

  await writeFile(profilesModulePath, buildGeneratedProfilesModule(geometries));
  console.log(`Generated ${geometries.length} profiles and ${geometries.length * 2} masks.`);
}

void main();
