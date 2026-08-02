/**
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
  "babolat-pure-aero-2026": { width: 500, height: 858, bed: { x: 194, y: 55, width: 286, height: 377 } },
  "babolat-pure-aero-98-2026": { width: 500, height: 858, bed: { x: 209, y: 66, width: 272, height: 357 } },
  "babolat-pure-drive-2025": { width: 500, height: 857, bed: { x: 191, y: 48, width: 288, height: 381 } },
  "babolat-pure-drive-98-gen11-2025": { width: 500, height: 857, bed: { x: 200, y: 56, width: 280, height: 366 } },
  "babolat-pure-drive-lite-2025": { width: 500, height: 857, bed: { x: 188, y: 45, width: 291, height: 385 } },
  "babolat-pure-drive-team-2025": { width: 500, height: 857, bed: { x: 198, y: 56, width: 281, height: 371 } },
  "babolat-pure-strike-100-2024": { width: 500, height: 857, bed: { x: 189, y: 37, width: 293, height: 388 } },
  "babolat-pure-strike-98-16x19-2024": { width: 500, height: 857, bed: { x: 187, y: 32, width: 295, height: 391 } },
  "dunlop-cx-200-2025": { width: 500, height: 857, bed: { x: 176, y: 23, width: 302, height: 406 } },
  "dunlop-fx-500-2025": { width: 500, height: 857, bed: { x: 199, y: 55, width: 273, height: 361 } },
  "dunlop-fx-500-tour-2025": { width: 500, height: 858, bed: { x: 177, y: 24, width: 297, height: 393 } },
  "dunlop-sx-300-2025": { width: 500, height: 857, bed: { x: 205, y: 55, width: 274, height: 372 } },
  "dunlop-sx-300-tour-2025": { width: 500, height: 857, bed: { x: 198, y: 44, width: 281, height: 382 } },
  "head-boom-mp-2026": { width: 500, height: 857, bed: { x: 182, y: 38, width: 299, height: 392 } },
  "head-boom-pro-2026": { width: 500, height: 857, bed: { x: 176, y: 27, width: 302, height: 397 } },
  "head-extreme-mp-2024": { width: 500, height: 857, bed: { x: 194, y: 55, width: 285, height: 385 } },
  "head-extreme-pro-2024": { width: 500, height: 857, bed: { x: 181, y: 29, width: 299, height: 405 } },
  "head-gravity-mp-2025": { width: 500, height: 857, bed: { x: 180, y: 34, width: 302, height: 394 } },
  "head-gravity-pro-2025": { width: 500, height: 857, bed: { x: 160, y: 27, width: 320, height: 415 } },
  "head-gravity-team-2025": { width: 500, height: 857, bed: { x: 177, y: 49, width: 306, height: 395 } },
  "head-prestige-mp-2023": { width: 500, height: 857, bed: { x: 232, y: 94, width: 250, height: 343 } },
  "head-radical-mp-2025": { width: 500, height: 857, bed: { x: 197, y: 45, width: 283, height: 379 } },
  "head-radical-pro-2025": { width: 500, height: 858, bed: { x: 201, y: 52, width: 279, height: 373 } },
  "prince-tour-100p-305g-2026": { width: 500, height: 857, bed: { x: 192, y: 49, width: 290, height: 387 } },
  "prince-tour-98-2026": { width: 500, height: 857, bed: { x: 190, y: 42, width: 291, height: 398 } },
  "tecnifibre-t-fight-300-2025": { width: 500, height: 858, bed: { x: 202, y: 62, width: 273, height: 373 } },
  "tecnifibre-t-fight-305-isoflex-2022": { width: 500, height: 857, bed: { x: 183, y: 29, width: 298, height: 402 } },
  "tecnifibre-tf-40-305-2024": { width: 500, height: 857, bed: { x: 184, y: 34, width: 297, height: 399 } },
  "wilson-blade-100-v10-2026": { width: 500, height: 857, bed: { x: 182, y: 36, width: 299, height: 387 } },
  "wilson-blade-100l-v9-2024": { width: 500, height: 857, bed: { x: 184, y: 46, width: 298, height: 386 } },
  "wilson-blade-98-16x19-v10-2026": { width: 500, height: 858, bed: { x: 192, y: 34, width: 291, height: 386 } },
  "wilson-blade-98-16x19-v9-2024": { width: 500, height: 857, bed: { x: 180, y: 24, width: 302, height: 405 } },
  "wilson-blade-98-18x20-v9-2024": { width: 500, height: 857, bed: { x: 191, y: 36, width: 292, height: 393 } },
  "wilson-clash-100-v3-2025": { width: 500, height: 857, bed: { x: 187, y: 47, width: 294, height: 384 } },
  "wilson-pro-staff-97-v14-2024": { width: 500, height: 857, bed: { x: 180, y: 27, width: 299, height: 405 } },
  "wilson-shift-99-pro-v1-2024": { width: 500, height: 857, bed: { x: 181, y: 39, width: 301, height: 392 } },
  "wilson-shift-99-v1-2024": { width: 500, height: 857, bed: { x: 188, y: 42, width: 294, height: 383 } },
  "wilson-ultra-100-v5-2025": { width: 500, height: 857, bed: { x: 189, y: 47, width: 293, height: 390 } },
  "wilson-ultra-99-pro-v5-2025": { width: 500, height: 857, bed: { x: 190, y: 37, width: 293, height: 394 } },
  "yonex-ezone-100-2025": { width: 500, height: 857, bed: { x: 192, y: 49, width: 290, height: 377 } },
  "yonex-ezone-100l-2025": { width: 500, height: 857, bed: { x: 193, y: 51, width: 289, height: 375 } },
  "yonex-ezone-98-2025": { width: 500, height: 857, bed: { x: 189, y: 39, width: 293, height: 377 } },
  "yonex-ezone-98-tour-2025": { width: 500, height: 857, bed: { x: 190, y: 41, width: 292, height: 376 } },
  "yonex-percept-100d-2025": { width: 500, height: 857, bed: { x: 183, y: 33, width: 299, height: 391 } },
  "yonex-percept-97-2025": { width: 500, height: 857, bed: { x: 180, y: 27, width: 302, height: 393 } },
  "yonex-vcore-100l-2026": { width: 500, height: 858, bed: { x: 188, y: 45, width: 293, height: 379 } },
  "yonex-vcore-95-8th-gen-2026": { width: 500, height: 857, bed: { x: 197, y: 56, width: 280, height: 360 } },
  "yonex-vcore-98-2026": { width: 500, height: 858, bed: { x: 191, y: 40, width: 291, height: 376 } },
};

export function customizerPhotoForSlug(slug: string): CustomizerPhoto | null {
  return CUSTOMIZER_PHOTOS[slug] ?? null;
}
