// 국기 이모지는 플랫폼마다 렌더링이 다르고 홈의 아이콘 시스템과 결이 어긋나
// IOC 3자리 코드 텍스트로 표기한다. players 데이터의 country(영문명) 기준.
const COUNTRY_CODES: Record<string, string> = {
  Italy: "ITA",
  Spain: "ESP",
  Serbia: "SRB",
  Germany: "GER",
  Russia: "RUS",
  USA: "USA",
  Norway: "NOR",
  Australia: "AUS",
  Bulgaria: "BUL",
  Poland: "POL",
  Belarus: "BLR",
  China: "CHN",
  Kazakhstan: "KAZ",
};

export function countryCodeOf(country: string): string {
  return COUNTRY_CODES[country] ?? country.slice(0, 3).toUpperCase();
}
