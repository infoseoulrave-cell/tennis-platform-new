/**
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
  "babolat-pure-aero-2026": { primary: "#CCFB53", secondary: "#3C4344" },
  "babolat-pure-aero-98-2026": { primary: "#C4FD43", secondary: "#43545B" },
  "babolat-pure-aero-lite-2026": { primary: "#D3FE54", secondary: "#333B3C" },
  "babolat-pure-aero-team-2026": { primary: "#D2FD54", secondary: "#43545B" },
  "babolat-pure-drive-2025": { primary: "#343C4B", secondary: "#83BCDB" },
  "babolat-pure-drive-98-gen11-2025": { primary: "#2B3444", secondary: "#4B93BC" },
  "babolat-pure-drive-lite-2025": { primary: "#2C3343", secondary: "#7CB4D3" },
  "babolat-pure-drive-team-2025": { primary: "#333B4C", secondary: "#83BCDB" },
  "babolat-pure-strike-100-2024": { primary: "#9CA4AB", secondary: "#6B737C" },
  "babolat-pure-strike-98-16x19-2024": { primary: "#939CA4", secondary: "#FD5443" },
  "dunlop-cx-200-2025": { primary: "#84242C", secondary: "#2D3235" },
  "dunlop-fx-500-2025": { primary: "#1B1B1B", secondary: "#74D4FC" },
  "dunlop-fx-500-tour-2025": { primary: "#232324", secondary: "#7CDAFD" },
  "dunlop-sx-300-2025": { primary: "#323334", secondary: "#C2EC5C" },
  "dunlop-sx-300-tour-2025": { primary: "#2A2B2D", secondary: "#CCF26B" },
  "head-boom-mp-2026": { primary: "#02B3DC", secondary: "#232B34" },
  "head-boom-pro-2026": { primary: "#02B3DC", secondary: "#242B34" },
  "head-extreme-mp-2024": { primary: "#DBE4CB", secondary: "#BBE364" },
  "head-extreme-pro-2024": { primary: "#CDEC83", secondary: "#DBE5CB" },
  "head-gravity-mp-2025": { primary: "#1B1C1D", secondary: "#4B4B4C" },
  "head-gravity-pro-2025": { primary: "#1B1B1C", secondary: "#4B4B4C" },
  "head-gravity-team-2025": { primary: "#1B1B1C", secondary: "#4B4B4C" },
  "head-prestige-mp-2023": { primary: "#423D44", secondary: "#726D73" },
  "head-radical-mp-2025": { primary: "#FC634C", secondary: "#FC1C2B" },
  "head-radical-pro-2025": { primary: "#FB1B2C", secondary: "#FD6B5C" },
  "head-speed-mp-2026": { primary: "#43454B", secondary: "#E5E5E3" },
  "head-speed-mp-l-2026": { primary: "#3B3D42", secondary: "#E5E4E3" },
  "head-speed-pro-2026": { primary: "#43454B", secondary: "#E5E5E3" },
  "prince-tour-100p-305g-2026": { primary: "#1B1C1C", secondary: "#4B4B4C" },
  "prince-tour-98-2026": { primary: "#1B1C1C", secondary: "#4B4B4C" },
  "tecnifibre-t-fight-300-2025": { primary: "#E4E3E3", secondary: "#B5B3B3" },
  "tecnifibre-t-fight-305-isoflex-2022": { primary: "#E3E3E5", secondary: "#B5B4BB" },
  "tecnifibre-tf-40-305-2024": { primary: "#E4E4E4", secondary: "#434443" },
  "wilson-blade-100-v10-2026": { primary: "#037444", secondary: "#538B6C" },
  "wilson-blade-100l-v9-2024": { primary: "#025B64", secondary: "#039394" },
  "wilson-blade-98-16x19-v10-2026": { primary: "#025B34", secondary: "#03AB64" },
  "wilson-blade-98-16x19-v9-2024": { primary: "#025B63", secondary: "#3C3D42" },
  "wilson-blade-98-18x20-v9-2024": { primary: "#145B64", secondary: "#5C5C62" },
  "wilson-clash-100-v3-2025": { primary: "#2C2B2C", secondary: "#5B5B5C" },
  "wilson-pro-staff-97-v14-2024": { primary: "#433D43", secondary: "#835C54" },
  "wilson-shift-99-pro-v1-2024": { primary: "#CCD4DC", secondary: "#A3A5AB" },
  "wilson-shift-99-v1-2024": { primary: "#DBDBDC", secondary: "#ACACAC" },
  "wilson-ultra-100-v5-2025": { primary: "#0264DB", secondary: "#1B3C9C" },
  "wilson-ultra-99-pro-v5-2025": { primary: "#0133B4", secondary: "#ACD4FE" },
  "yonex-ezone-100-2025": { primary: "#3B5CA4", secondary: "#242B64" },
  "yonex-ezone-100l-2025": { primary: "#3B5CA4", secondary: "#242B5C" },
  "yonex-ezone-98-2025": { primary: "#446CB3", secondary: "#243B8C" },
  "yonex-ezone-98-tour-2025": { primary: "#4B74BB", secondary: "#242B63" },
  "yonex-percept-100d-2025": { primary: "#4B4D63", secondary: "#7B7D93" },
  "yonex-percept-97-2025": { primary: "#4B4D63", secondary: "#7B7D93" },
  "yonex-vcore-100-2026": { primary: "#94011C", secondary: "#D32C44" },
  "yonex-vcore-100l-2026": { primary: "#A40323", secondary: "#D32C43" },
  "yonex-vcore-95-8th-gen-2026": { primary: "#B3021C", secondary: "#AB3B4C" },
  "yonex-vcore-98-2026": { primary: "#AB0224", secondary: "#EC5B6C" },
};

export function colorwayForSlug(slug: string): GeneratedColorway | null {
  return RACKET_COLORWAYS[slug] ?? null;
}
