export type VerifiedRacketImage = {
  url: string;
  source: "Tennis Warehouse";
  kind: "verified-retailer-photo";
};

/**
 * Product-code allowlist checked against the canonical RacketLab slug.
 *
 * This intentionally does not trust a URL merely because it is hosted by a
 * retailer. The previous catalog mapped unrelated generations and models to
 * whichever image looked similar. Unknown and local generated artwork now
 * fail closed to the explicit no-photo state.
 */
const TENNIS_WAREHOUSE_CODE_TO_SLUGS: Record<string, readonly string[]> = {
  BPAR26: ["babolat-pure-aero-2026"],
  BPA98R: ["babolat-pure-aero-98-2026"],
  BPAT26: ["babolat-pure-aero-team-2026"],
  BPALTR: ["babolat-pure-aero-lite-2026"],
  BPD25R: ["babolat-pure-drive-2025"],
  BPDLR: ["babolat-pure-drive-lite-2025"],
  BRPTR: ["babolat-pure-drive-team-2025"],
  PS9816: ["babolat-pure-strike-98-16x19-2024"],
  PS1019: ["babolat-pure-strike-100-2024"],
  WB9816: ["wilson-blade-98-16x19-v9-2024"],
  WB18V: ["wilson-blade-98-18x20-v9-2024"],
  WB100L: ["wilson-blade-100l-v9-2024"],
  W97V14: ["wilson-pro-staff-97-v14-2024"],
  WSP300D: ["wilson-shift-99-v1-2024"],
  WSP315: ["wilson-shift-99-pro-v1-2024"],
  HSPDP6: ["head-speed-pro-2026"],
  HSPMP6: ["head-speed-mp-2026"],
  HSMPL6: ["head-speed-mp-l-2026"],
  HBOOP6: ["head-boom-pro-2026"],
  HBOMP6: ["head-boom-mp-2026"],
  HGMPG: ["head-gravity-mp-2025"],
  HGPRR: ["head-gravity-pro-2025"],
  HREM24: ["head-extreme-mp-2024"],
  HPRMP: ["head-prestige-mp-2023", "head-prestige-mp-2025"],
  VC108G: ["yonex-vcore-100-2026"],
  VC988G: ["yonex-vcore-98-2026"],
  VC1L8G: ["yonex-vcore-100l-2026"],
  EZ10BB: ["yonex-ezone-100-2025"],
  EZ98BB: ["yonex-ezone-98-2025"],
  EZ1LBB: ["yonex-ezone-100l-2025"],
  PERM97: ["yonex-percept-97-2025"],
  PERM1D: ["yonex-percept-100d-2025"],
  DF500: ["dunlop-fx-500-2025"],
  DF50T: ["dunlop-fx-500-tour-2025"],
  DSX3R: ["dunlop-sx-300-2025"],
  DSXTR: ["dunlop-sx-300-tour-2025"],
  DCX2S: ["dunlop-cx-200-2025"],
  TF40R1: ["tecnifibre-tf-40-305-2024"],
  ISO305: [
    "tecnifibre-t-fight-305-isoflex-2022",
    "tecnifibre-t-fight-305-isoflex-2024",
  ],
  WB9810: ["wilson-blade-98-16x19-v10-2026"],
  WU1005: ["wilson-ultra-100-v5-2025"],
  HRMP: ["head-radical-mp-2025"],
  PD98R: ["babolat-pure-drive-98-gen11-2025"],
  CL103V: ["wilson-clash-100-v3-2025"],
  VC958G: ["yonex-vcore-95-8th-gen-2026"],
  TEZ98B: ["yonex-ezone-98-tour-2025"],
  TF30ST: ["tecnifibre-t-fight-300-2025"],
  PTR698: ["prince-tour-98-2026"],
  WB1001: ["wilson-blade-100-v10-2026"],
  WU99P5: ["wilson-ultra-99-pro-v5-2025"],
  HPRR: ["head-radical-pro-2025"],
  HREP24: ["head-extreme-pro-2024"],
  HRTMPG: ["head-gravity-team-2025"],
  PTR61P: ["prince-tour-100p-305g-2026"],
};

function productCode(url: URL): string | null {
  const path = url.searchParams.get("path");
  const match = path?.match(/^([A-Z0-9]+)-1\.jpg$/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function resolveRacketImage(
  imageUrl: string | null | undefined,
  canonicalSlug: string,
): VerifiedRacketImage | null {
  if (!imageUrl) return null;

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== "img.tennis-warehouse.com") {
    return null;
  }

  const code = productCode(parsed);
  if (!code || !TENNIS_WAREHOUSE_CODE_TO_SLUGS[code]?.includes(canonicalSlug)) {
    return null;
  }

  return {
    url: imageUrl,
    source: "Tennis Warehouse",
    kind: "verified-retailer-photo",
  };
}
