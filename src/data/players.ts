export type PlayerPhoto = {
  url: string;
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl: string;
};

export type PlayerEquipment = {
  brand: string;
  line: string;
  relationship: "official-endorsement" | "official-player-listing";
  sourceUrl: string;
  disclosure: string;
};

export type Player = {
  id: string;
  name: string;
  nameKo: string;
  country: string;
  countryFlag: string;
  initial: string;
  tags: string[];
  equipment: PlayerEquipment;
  synergy: string;
  photo: PlayerPhoto;
  verifiedAt: string;
};

const VERIFIED_AT = "2026-07-21";
const DISCLOSURE =
  "브랜드가 공개한 후원·표시 라인 기준입니다. 선수의 실제 프로 스톡 프레임, 무게, 밸런스와 스트링 세팅은 시판 제품과 다를 수 있습니다.";

const LICENSES = {
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;

function commonsPhoto(
  file: string,
  url: string,
  credit: string,
  license: keyof typeof LICENSES,
): PlayerPhoto {
  return {
    url,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
    credit,
    license,
    licenseUrl: LICENSES[license],
  };
}

function equipment(
  brand: string,
  line: string,
  sourceUrl: string,
  relationship: PlayerEquipment["relationship"] = "official-endorsement",
): PlayerEquipment {
  return { brand, line, sourceUrl, relationship, disclosure: DISCLOSURE };
}

export const players: Player[] = [
  {
    id: "sinner",
    name: "Jannik Sinner",
    nameKo: "야니크 시너",
    country: "Italy",
    countryFlag: "🇮🇹",
    initial: "S",
    tags: ["빠른 전개", "양쪽 윙 파워", "공격적 베이스라인"],
    equipment: equipment("HEAD", "Speed", "https://www.head.com/en/athletes/tennis/atp/jannik-sinner"),
    synergy: "HEAD가 공식적으로 Speed 라인의 대표 선수로 소개합니다. 빠른 스윙과 공격적인 베이스라인 전개를 강조하는 라인입니다.",
    photo: commonsPhoto(
      "Jannik_Sinner_(2024_US_Open)_04_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Jannik_Sinner_%282024_US_Open%29_04_%28cropped%29.jpg/960px-Jannik_Sinner_%282024_US_Open%29_04_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "alcaraz",
    name: "Carlos Alcaraz",
    nameKo: "카를로스 알카라스",
    country: "Spain",
    countryFlag: "🇪🇸",
    initial: "A",
    tags: ["강한 스핀", "폭발적 전환", "올코트"],
    equipment: equipment("Babolat", "Pure Aero 98", "https://www.babolat.com/gb/Collection?plid=pure-aero"),
    synergy: "Babolat은 알카라스를 Pure Aero 98의 대표 선수로 소개합니다. 실제 투어 프레임 사양은 시판 98 모델과 동일하다고 단정하지 않습니다.",
    photo: commonsPhoto(
      "Carlos_Alcaraz_Wimbledon_2025_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Carlos_Alcaraz_Wimbledon_2025_%28cropped%29.jpg/960px-Carlos_Alcaraz_Wimbledon_2025_%28cropped%29.jpg",
      "12121343A",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "djokovic",
    name: "Novak Djokovic",
    nameKo: "노박 조코비치",
    country: "Serbia",
    countryFlag: "🇷🇸",
    initial: "D",
    tags: ["정밀한 리턴", "수비 전환", "코트 커버"],
    equipment: equipment("HEAD", "Speed Legend", "https://www.head.com/en/rs/stories/novak-djokovic-career-highlights"),
    synergy: "HEAD는 조코비치와 Speed Legend 라인을 연결해 소개합니다. 투어에서 쓰는 커스텀 프레임과 리테일 제품은 구분해서 봐야 합니다.",
    photo: commonsPhoto(
      "Novak_Djokovic_Practicing_Tennis_05_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Novak_Djokovic_Practicing_Tennis_05_%28cropped%29.jpg/960px-Novak_Djokovic_Practicing_Tennis_05_%28cropped%29.jpg",
      "Amaury Laporte",
      "CC BY 2.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "zverev",
    name: "Alexander Zverev",
    nameKo: "알렉산더 즈베레프",
    country: "Germany",
    countryFlag: "🇩🇪",
    initial: "Z",
    tags: ["강한 서브", "긴 리치", "베이스라인 압박"],
    equipment: equipment("HEAD", "Gravity", "https://www.head.com/en_AU/athletes/tennis/atp/alexander-zverev"),
    synergy: "HEAD가 공식 Gravity 선수로 소개합니다. 큰 스윙과 안정적인 베이스라인 전개에 초점을 둔 후원 라인입니다.",
    photo: commonsPhoto(
      "Alexander_Zverev.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Alexander_Zverev.jpg/960px-Alexander_Zverev.jpg",
      "Rick Munroe",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "medvedev",
    name: "Daniil Medvedev",
    nameKo: "다닐 메드베데프",
    country: "Russia",
    countryFlag: "🇷🇺",
    initial: "M",
    tags: ["깊은 리턴", "플랫 드라이브", "변칙적 리듬"],
    equipment: equipment("Tecnifibre", "T-FIGHT 305S", "https://b2b.tecnifibre.com/en/articletecnimag-n1daniilmedvedev.html"),
    synergy: "Tecnifibre는 메드베데프를 T-FIGHT 305S와 연결해 소개합니다. 이 표기는 공식 리테일 대응 라인입니다.",
    photo: commonsPhoto(
      "Danill_Medvedev_Miami_2019_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Danill_Medvedev_Miami_2019_%28cropped%29.jpg/960px-Danill_Medvedev_Miami_2019_%28cropped%29.jpg",
      "LacosteWiki",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "fritz",
    name: "Taylor Fritz",
    nameKo: "테일러 프리츠",
    country: "USA",
    countryFlag: "🇺🇸",
    initial: "F",
    tags: ["빅 서브", "공격적 포핸드", "첫 타구 압박"],
    equipment: equipment("HEAD", "Radical", "https://www.head.com/en/athletes/tennis/atp/taylor-fritz"),
    synergy: "HEAD의 공식 선수 페이지는 프리츠가 Radical 라인을 사용한다고 설명합니다. 기존 Speed 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg/960px-Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg",
      "Rickmunroe01",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "ruud",
    name: "Casper Ruud",
    nameKo: "카스페르 루드",
    country: "Norway",
    countryFlag: "🇳🇴",
    initial: "R",
    tags: ["헤비 탑스핀", "클레이 전개", "안정적 랠리"],
    equipment: equipment("Yonex", "EZONE 100", "https://www.yonex.com/news/team-yonex-shines-at-the-australian-open-2026-in-melbournes-summer-heat/"),
    synergy: "Yonex의 2026 선수 장비 목록은 루드의 대응 모델을 EZONE 100으로 명시합니다.",
    photo: commonsPhoto(
      "Ruud_RG22_(58)_(52144535415).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Ruud_RG22_%2858%29_%2852144535415%29.jpg/960px-Ruud_RG22_%2858%29_%2852144535415%29.jpg",
      "si.robi",
      "CC BY-SA 2.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "de-minaur",
    name: "Alex de Minaur",
    nameKo: "앨릭스 디미노어",
    country: "Australia",
    countryFlag: "🇦🇺",
    initial: "D",
    tags: ["빠른 발", "카운터펀치", "코트 커버"],
    equipment: equipment("Wilson", "Blade", "https://sg.wilson.com/pages/blade"),
    synergy: "Wilson의 공식 Blade 페이지가 디미노어를 해당 라인의 선수로 소개합니다. 기존 Dunlop FX 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Alex_De_Minaur_(43875330731).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Alex_De_Minaur_%2843875330731%29.jpg/960px-Alex_De_Minaur_%2843875330731%29.jpg",
      "Keith Allison",
      "CC BY-SA 2.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "rublev",
    name: "Andrey Rublev",
    nameKo: "안드레이 루블료프",
    country: "Russia",
    countryFlag: "🇷🇺",
    initial: "R",
    tags: ["폭발적 포핸드", "빠른 템포", "공격적 리턴"],
    equipment: equipment("HEAD", "Gravity", "https://www.head.com/en_US/athletes/tennis/atp/andrey-rublev"),
    synergy: "HEAD는 루블료프가 Gravity 색상을 들고 투어에 등장한 사실을 공식 선수 페이지에서 설명합니다.",
    photo: commonsPhoto(
      "Andrey_Rublev_(19639185239).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Andrey_Rublev_%2819639185239%29.jpg/960px-Andrey_Rublev_%2819639185239%29.jpg",
      "Carine06",
      "CC BY-SA 2.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "dimitrov",
    name: "Grigor Dimitrov",
    nameKo: "그리고르 디미트로프",
    country: "Bulgaria",
    countryFlag: "🇧🇬",
    initial: "D",
    tags: ["한손 백핸드", "올코트", "터치 플레이"],
    equipment: equipment("Wilson", "Pro Staff", "https://www.wilson.com/en-us/blog/tennis/wilson-labs/wilson-pro-staff-history"),
    synergy: "Wilson의 공식 Pro Staff 역사 페이지는 디미트로프를 현재 투어의 Pro Staff 선수로 소개합니다.",
    photo: commonsPhoto(
      "Grigor_Dimitrov_(2023_DC_Open)_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grigor_Dimitrov_%282023_DC_Open%29_01.jpg/960px-Grigor_Dimitrov_%282023_DC_Open%29_01.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "swiatek",
    name: "Iga Swiatek",
    nameKo: "이가 시비옹테크",
    country: "Poland",
    countryFlag: "🇵🇱",
    initial: "S",
    tags: ["헤비 탑스핀", "강한 포핸드", "빠른 회복"],
    equipment: equipment("Tecnifibre", "T-FIGHT 300S", "https://www.tecnifibre.com/en-ue/products/tfight-300s-ig"),
    synergy: "Tecnifibre가 시비옹테크가 사용하는 제품으로 T-FIGHT 300S를 공식 명시합니다. 기존 Yonex 표기는 잘못된 정보였습니다.",
    photo: commonsPhoto(
      "Iga_Swiatek_2023_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/14/Iga_Swiatek_2023_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "sabalenka",
    name: "Aryna Sabalenka",
    nameKo: "아리나 사발렌카",
    country: "Belarus",
    countryFlag: "🇧🇾",
    initial: "S",
    tags: ["폭발적 파워", "공격적 베이스라인", "강한 서브"],
    equipment: equipment("Wilson", "Blade V10", "https://jp.wilson.com/pages/tennis-rackets-blade-v10"),
    synergy: "Wilson의 2026 Blade V10 공식 페이지가 사발렌카를 글로벌 앰배서더로 소개합니다.",
    photo: commonsPhoto(
      "Aryna_Sabalenka_US_Open_2024_practice_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Aryna_Sabalenka_US_Open_2024_practice_%28cropped%29.jpg/960px-Aryna_Sabalenka_US_Open_2024_practice_%28cropped%29.jpg",
      "Ocoudis",
      "CC0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "gauff",
    name: "Coco Gauff",
    nameKo: "코코 고프",
    country: "USA",
    countryFlag: "🇺🇸",
    initial: "G",
    tags: ["빠른 발", "강한 수비", "공격 전환"],
    equipment: equipment("HEAD", "Boom", "https://www.head.com/en_US/tennis"),
    synergy: "HEAD의 2026 공식 테니스 페이지는 고프를 Boom 선수로 분류합니다. 기존 Yonex 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Coco_Gauff_Miami_Open.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Coco_Gauff_Miami_Open.jpg/960px-Coco_Gauff_Miami_Open.jpg",
      "Rick Munroe",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "paolini",
    name: "Jasmine Paolini",
    nameKo: "자스민 파올리니",
    country: "Italy",
    countryFlag: "🇮🇹",
    initial: "P",
    tags: ["빠른 풋워크", "공격적 리턴", "일관성"],
    equipment: equipment("Yonex", "VCORE", "https://www.yonex.com/athletes/jasmine-paolini"),
    synergy: "Yonex의 공식 선수 페이지와 카탈로그가 파올리니를 VCORE 라인과 연결합니다. 기존 Babolat 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Jasmine_Paolini_(2023_US_Open)_01_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jasmine_Paolini_%282023_US_Open%29_01_%28cropped%29.jpg/960px-Jasmine_Paolini_%282023_US_Open%29_01_%28cropped%29.jpg",
      "Hameltion / Blackcat",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "zheng",
    name: "Qinwen Zheng",
    nameKo: "정친원",
    country: "China",
    countryFlag: "🇨🇳",
    initial: "Z",
    tags: ["빅 서브", "폭발적 포핸드", "공격적 전개"],
    equipment: equipment("Wilson", "Tour racquet (retail line not disclosed)", "https://www.wilson.com/en-us/explore/tennis/wilson-athletes", "official-player-listing"),
    synergy: "Wilson은 정친원을 공식 선수로 등재하지만 현재 공개 페이지에서 특정 리테일 라인을 확정하지 않습니다. 따라서 모델을 추정하지 않습니다.",
    photo: commonsPhoto(
      "Zheng_Qinwen_(2024_US_Open)_01_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Zheng_Qinwen_%282024_US_Open%29_01_%28cropped%29.jpg/960px-Zheng_Qinwen_%282024_US_Open%29_01_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "rybakina",
    name: "Elena Rybakina",
    nameKo: "엘레나 리바키나",
    country: "Kazakhstan",
    countryFlag: "🇰🇿",
    initial: "R",
    tags: ["강한 서브", "플랫 드라이브", "짧은 포인트"],
    equipment: equipment("Yonex", "VCORE 100", "https://www.yonex.com/news/team-yonex-shines-at-the-australian-open-2026-in-melbournes-summer-heat/"),
    synergy: "Yonex의 2026 선수 장비 목록이 리바키나의 대응 모델을 VCORE 100으로 명시합니다.",
    photo: commonsPhoto(
      "Elena_Rybakina_US_Open_2024_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Elena_Rybakina_US_Open_2024_%28cropped%29.jpg/960px-Elena_Rybakina_US_Open_2024_%28cropped%29.jpg",
      "Ocoudis",
      "CC0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "pegula",
    name: "Jessica Pegula",
    nameKo: "제시카 페굴라",
    country: "USA",
    countryFlag: "🇺🇸",
    initial: "P",
    tags: ["안정적 베이스라인", "깊은 리턴", "빠른 타이밍"],
    equipment: equipment("Yonex", "EZONE 98", "https://www.yonex.com/news/tennis/wimbledon-2023-rybakina-kyrgios-and-ruud-lead-team-yonex/"),
    synergy: "Yonex의 공식 선수 장비 목록은 페굴라를 EZONE 98과 연결합니다. 기존 Babolat Pure Drive 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Jessica_Pegula_(Roland_Garros_2023)_04_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jessica_Pegula_%28Roland_Garros_2023%29_04_%28cropped%29.jpg/960px-Jessica_Pegula_%28Roland_Garros_2023%29_04_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "navarro",
    name: "Emma Navarro",
    nameKo: "에마 나바로",
    country: "USA",
    countryFlag: "🇺🇸",
    initial: "N",
    tags: ["올코트", "빠른 전환", "다양한 전술"],
    equipment: equipment("Yonex", "VCORE", "https://www.yonex.com/media/wysiwyg/Tennis_Catalog_2025_1.pdf"),
    synergy: "Yonex 공식 카탈로그가 나바로를 VCORE 라인 선수로 기재합니다. 존재하지 않던 Commons 사진 URL도 검증된 파일로 교체했습니다.",
    photo: commonsPhoto(
      "Emma_Navarro_(2023_US_Open)_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Emma_Navarro_%282023_US_Open%29_01.jpg/960px-Emma_Navarro_%282023_US_Open%29_01.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "kasatkina",
    name: "Daria Kasatkina",
    nameKo: "다리아 카사트키나",
    country: "Australia",
    countryFlag: "🇦🇺",
    initial: "K",
    tags: ["다양한 구질", "전술적 전개", "드롭샷"],
    equipment: equipment("Artengo", "TR990 POWER PRO", "https://www.decathlon.fr/c/stories/une-raquette-choisie-par-une-pro_d3832bc1-90c3-4a0b-b713-bc4299cc5004"),
    synergy: "Decathlon은 카사트키나가 블라인드 테스트 후 TR990 POWER PRO를 선택했다고 공식 소개합니다. 국적 표기도 2026 WTA 기준 호주로 갱신했습니다.",
    photo: commonsPhoto(
      "Daria_Kasatkina_(2023_DC_Open)_12_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Daria_Kasatkina_%282023_DC_Open%29_12_%28cropped%29.jpg/960px-Daria_Kasatkina_%282023_DC_Open%29_12_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "andreeva",
    name: "Mirra Andreeva",
    nameKo: "미라 안드레예바",
    country: "Russia",
    countryFlag: "🇷🇺",
    initial: "A",
    tags: ["다재다능", "빠른 판단", "공격적 리턴"],
    equipment: equipment("Wilson", "Blade V10", "https://sg.wilson.com/pages/roland-garros-2026"),
    synergy: "Wilson의 2026 공식 페이지는 안드레예바가 Blade V10으로 경기했다고 명시합니다. 기존 HEAD Speed 표기는 바로잡았습니다.",
    photo: commonsPhoto(
      "Mirra_Andreeva_WMQ23_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Mirra_Andreeva_WMQ23_%28cropped%29.jpg",
      "si.robi",
      "CC BY-SA 2.0",
    ),
    verifiedAt: VERIFIED_AT,
  },
];
