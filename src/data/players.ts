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

export const PLAYERS_VERIFIED_AT = "2026-07-24";
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
    synergy: "시너는 큰 서브와 양쪽 스트로크, 빠른 움직임으로 먼저 주도권을 잡는 공격형 베이스라이너입니다. 시판 Speed 라인은 공기역학적 빔과 파워·컨트롤의 균형을 내세워 빠른 스윙으로 공세를 이어가려는 플레이에 맞는 선택지입니다.",
    photo: commonsPhoto(
      "Jannik_Sinner_(2024_US_Open)_04_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Jannik_Sinner_%282024_US_Open%29_04_%28cropped%29.jpg/960px-Jannik_Sinner_%282024_US_Open%29_04_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "알카라스는 공을 일찍 잡아 강한 스핀과 빠른 전환으로 각도를 만들고 필요하면 네트까지 전진하는 공격적 올코트 플레이어입니다. 시판 Pure Aero 98은 빠른 스윙·스핀·정밀한 방향 제어를 강조해 선제 공격과 예리한 각도 전개를 뒷받침하는 성격입니다.",
    photo: commonsPhoto(
      "Carlos_Alcaraz_Wimbledon_2025_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Carlos_Alcaraz_Wimbledon_2025_%28cropped%29.jpg/960px-Carlos_Alcaraz_Wimbledon_2025_%28cropped%29.jpg",
      "12121343A",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "조코비치는 정교한 리턴과 깊은 코트 커버로 수비를 중립화한 뒤 정확한 방향 전환으로 주도권을 되찾습니다. 시판 Speed Legend 라인은 안정감·파워·컨트롤의 조화를 강조해 빠른 공수 전환 속에서도 일관된 타구를 원하는 플레이에 어울립니다.",
    photo: commonsPhoto(
      "Novak_Djokovic_Practicing_Tennis_05_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Novak_Djokovic_Practicing_Tennis_05_%28cropped%29.jpg/960px-Novak_Djokovic_Practicing_Tennis_05_%28cropped%29.jpg",
      "Amaury Laporte",
      "CC BY 2.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "즈베레프는 큰 서브와 긴 리치를 바탕으로 깊은 베이스라인 타구로 상대를 압박하는 플레이어입니다. 시판 Gravity 라인은 공격형 베이스라이너를 위한 컨트롤·터치·관용성과 넓은 스위트존을 강조해 큰 스윙을 안정적으로 이어가려는 전개에 잘 맞습니다.",
    photo: commonsPhoto(
      "Alexander_Zverev.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Alexander_Zverev.jpg/960px-Alexander_Zverev.jpg",
      "Rick Munroe",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "메드베데프는 깊은 리턴과 낮고 플랫한 스트로크, 예측하기 어려운 리듬으로 긴 베이스라인 교환을 통제합니다. 시판 T-FIGHT 305S는 98인치 헤드와 18×19 패턴의 컨트롤에 기동성·충격 안정성을 더해 빠른 대응과 정교한 방향 전환을 중시하는 플레이에 맞습니다.",
    photo: commonsPhoto(
      "Danill_Medvedev_Miami_2019_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Danill_Medvedev_Miami_2019_%28cropped%29.jpg/960px-Danill_Medvedev_Miami_2019_%28cropped%29.jpg",
      "LacosteWiki",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "프리츠는 큰 서브와 묵직한 그라운드스트로크로 짧은 공을 만들고 빠르게 위너를 노리는 파워형 베이스라이너입니다. 시판 Radical 라인은 파워·컨트롤·스핀의 균형과 올코트 활용성을 강조해 강하게 밀어붙이면서도 방향과 구질을 바꾸는 전개를 받쳐줍니다.",
    photo: commonsPhoto(
      "Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg/960px-Taylor_Fritz_-_Delray_Beach_Open_Final_Round.jpg",
      "Rickmunroe01",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "루드는 무거운 탑스핀 포핸드로 상대를 뒤로 밀고 안정적인 랠리에서 공격 기회를 만드는 베이스라이너입니다. 시판 EZONE 100은 100인치 헤드에서 파워와 편안함을 강조해 반복적인 풀스윙과 깊이 있는 전개를 돕는 성격입니다.",
    photo: commonsPhoto(
      "Ruud_RG22_(58)_(52144535415).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Ruud_RG22_%2858%29_%2852144535415%29.jpg/960px-Ruud_RG22_%2858%29_%2852144535415%29.jpg",
      "si.robi",
      "CC BY-SA 2.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
  },
  {
    id: "de-minaur",
    name: "Alex de Minaur",
    nameKo: "앨릭스 디미노어",
    country: "Australia",
    countryFlag: "🇦🇺",
    initial: "D",
    tags: ["빠른 발", "카운터펀치", "코트 커버"],
    equipment: equipment("Wilson", "Ultra V5", "https://www.wilson.com/en-gb/blog/tennis/unveiling-wilson-ultra-swing-with-power"),
    synergy: "디미노르는 빠른 발과 짧은 준비 동작으로 상대의 속도를 받아쳐 수비를 곧바로 공격으로 전환합니다. 시판 Ultra V5 라인은 폭발적이면서 정확한 파워, 각도·스핀 구사, 수비→공격 전환을 강조해 코트 전역에서 빠르게 재가속하는 플레이와 맞습니다.",
    photo: commonsPhoto(
      "Alex_De_Minaur_(43875330731).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Alex_De_Minaur_%2843875330731%29.jpg/960px-Alex_De_Minaur_%2843875330731%29.jpg",
      "Keith Allison",
      "CC BY-SA 2.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "루블료프는 큰 포핸드와 빠른 템포로 베이스라인에서 위험을 감수하며 먼저 공격하는 플레이어입니다. 시판 Gravity 라인은 공격형 베이스라이너용 컨트롤·터치·관용성과 넓은 스위트존을 내세워 강한 풀스윙의 방향성과 안정성을 보완하는 성격입니다.",
    photo: commonsPhoto(
      "Andrey_Rublev_(19639185239).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Andrey_Rublev_%2819639185239%29.jpg/960px-Andrey_Rublev_%2819639185239%29.jpg",
      "Carine06",
      "CC BY-SA 2.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "디미트로프는 한손 백핸드와 슬라이스, 네트 플레이를 섞어 템포와 높이를 바꾸는 정교한 올코트 플레이어입니다. 시판 Pro Staff 라인은 볼 감각과 정밀성을 핵심으로 내세워 다양한 구질과 타점에서 섬세하게 방향을 만드는 전개에 잘 맞습니다.",
    photo: commonsPhoto(
      "Grigor_Dimitrov_(2023_DC_Open)_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grigor_Dimitrov_%282023_DC_Open%29_01.jpg/960px-Grigor_Dimitrov_%282023_DC_Open%29_01.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "시비옹테크는 높은 회전량의 포핸드와 빠른 풋워크로 베이스라인 랠리를 주도합니다. 시판 T-FIGHT 300S의 파워·컨트롤 균형, 쉬운 가속, 16×19 스핀 설계는 무거운 탑스핀을 공격적으로 전개하는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Iga_Swiatek_2023_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/14/Iga_Swiatek_2023_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "사발렌카는 강력한 서브와 큰 그라운드스트로크로 베이스라인에서 먼저 압박하는 공격형 선수입니다. 시판 Blade V10 라인의 파워 저장·방출 프레임과 StableFeel+ 안정성은 강한 스윙에서도 공격적인 타구를 밀어주는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Aryna_Sabalenka_US_Open_2024_practice_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Aryna_Sabalenka_US_Open_2024_practice_%28cropped%29.jpg/960px-Aryna_Sabalenka_US_Open_2024_practice_%28cropped%29.jpg",
      "Ocoudis",
      "CC0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "고프는 빠른 코트 커버와 끈질긴 수비, 강한 백핸드를 바탕으로 공수 전환에 강한 선수입니다. 시판 Boom 라인의 폭발적 파워와 안정성·컨트롤·스핀은 수비 뒤 빠르게 공격으로 전환하는 흐름과 맞습니다.",
    photo: commonsPhoto(
      "Coco_Gauff_Miami_Open.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Coco_Gauff_Miami_Open.jpg/960px-Coco_Gauff_Miami_Open.jpg",
      "Rick Munroe",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
  },
  {
    id: "paolini",
    name: "Jasmine Paolini",
    nameKo: "자스민 파올리니",
    country: "Italy",
    countryFlag: "🇮🇹",
    initial: "P",
    tags: ["빠른 풋워크", "공격적 리턴", "일관성"],
    equipment: equipment("Yonex", "VCORE 100", "https://www.yonex.com/athletes/jasmine-paolini"),
    synergy: "파올리니는 공을 일찍 잡는 공격과 드롭샷을 섞어 상대의 시간과 위치를 빼앗는 적극적인 플레이어입니다. 시판 VCORE 100의 공기역학적 스핀, 넓은 스위트존, 안정성은 다양한 공격 궤적을 만들며 랠리를 이어가는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Jasmine_Paolini_(2023_US_Open)_01_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jasmine_Paolini_%282023_US_Open%29_01_%28cropped%29.jpg/960px-Jasmine_Paolini_%282023_US_Open%29_01_%28cropped%29.jpg",
      "Hameltion / Blackcat",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
  },
  {
    id: "zheng",
    name: "Qinwen Zheng",
    nameKo: "정친원",
    country: "China",
    countryFlag: "🇨🇳",
    initial: "Z",
    tags: ["빅 서브", "폭발적 포핸드", "공격적 전개"],
    equipment: equipment("Wilson", "Ultra V5", "https://www.wilson.com/en-gb/blog/tennis/unveiling-wilson-ultra-swing-with-power", "official-player-listing"),
    synergy: "정친원은 큰 서브와 폭발적인 포핸드로 베이스라인에서 짧은 공을 만들고 먼저 마무리하는 공격형 선수입니다. 시판 Ultra V5 라인은 폭발적이면서 정확한 파워와 깊이·각도·스핀 조절을 강조해 큰 스윙으로 라인 안에 압박을 유지하는 전개를 지원합니다.",
    photo: commonsPhoto(
      "Zheng_Qinwen_(2024_US_Open)_01_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Zheng_Qinwen_%282024_US_Open%29_01_%28cropped%29.jpg/960px-Zheng_Qinwen_%282024_US_Open%29_01_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "리바키나는 폭발적인 서브와 빠르고 평평한 양쪽 그라운드스트로크로 먼저 압박하는 선수입니다. 시판 VCORE 100의 빠른 스윙·안정성·넓은 스위트존은 평평한 강타에 필요한 회전 여유와 타구 안정성을 더하는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Elena_Rybakina_US_Open_2024_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Elena_Rybakina_US_Open_2024_%28cropped%29.jpg/960px-Elena_Rybakina_US_Open_2024_%28cropped%29.jpg",
      "Ocoudis",
      "CC0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "페굴라는 공을 일찍 잡아 깊고 평평하게 보내며 양쪽에서 방향을 빠르게 바꾸는 타이밍형 베이스라이너입니다. 시판 EZONE 98의 파워·정밀성·편안함은 짧은 준비로도 깊이를 내고 빠른 템포를 유지하는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Jessica_Pegula_(Roland_Garros_2023)_04_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jessica_Pegula_%28Roland_Garros_2023%29_04_%28cropped%29.jpg/960px-Jessica_Pegula_%28Roland_Garros_2023%29_04_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
  },
  {
    id: "navarro",
    name: "Emma Navarro",
    nameKo: "에마 나바로",
    country: "USA",
    countryFlag: "🇺🇸",
    initial: "N",
    tags: ["올코트", "빠른 전환", "다양한 전술"],
    equipment: equipment("Yonex", "VCORE 98", "https://us.yonex.com/pages/athlete/emma-navarro"),
    synergy: "나바로는 빠른 전환과 의도적인 포인트 구성, 공격적인 리턴으로 상황에 따라 샷을 바꾸는 올라운더입니다. 시판 VCORE 98의 공기역학적 스핀, 안정성, 볼 포켓팅은 다양한 궤적과 코스 변화를 만드는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Emma_Navarro_(2023_US_Open)_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Emma_Navarro_%282023_US_Open%29_01.jpg/960px-Emma_Navarro_%282023_US_Open%29_01.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "카사트키나는 강한 회전과 코스 배치, 깊이·방향 변화를 섞어 상대를 움직이는 전술형 선수입니다. 시판 TR990 POWER PRO의 파워·안정성, 16×19 스핀, 조작성은 다양한 회전과 코스를 정교하게 바꾸는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Daria_Kasatkina_(2023_DC_Open)_12_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Daria_Kasatkina_%282023_DC_Open%29_12_%28cropped%29.jpg/960px-Daria_Kasatkina_%282023_DC_Open%29_12_%28cropped%29.jpg",
      "Hameltion",
      "CC BY-SA 4.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
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
    synergy: "안드레예바는 적극적인 타구와 넓은 코트 커버를 함께 갖춰 공격과 수비를 빠르게 오가는 선수입니다. 시판 Blade V10 라인의 StableFeel+ 안정성과 날카로운 타구감, 파워 저장·방출 구조는 빠른 공수 전환에서 자신 있게 스윙하는 방향과 맞습니다.",
    photo: commonsPhoto(
      "Mirra_Andreeva_WMQ23_(cropped).jpg",
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Mirra_Andreeva_WMQ23_%28cropped%29.jpg",
      "si.robi",
      "CC BY-SA 2.0",
    ),
    verifiedAt: PLAYERS_VERIFIED_AT,
  },
];
