import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { racketModels, racketAliases } from "./schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Korean community aliases for ~80 racket models
// ---------------------------------------------------------------------------
// Types:
//   community    — Korean forum/community nicknames (e.g. 프스, 블레이드)
//   abbreviation — shortened forms used in chat/forums (e.g. PA, PD, RF97)
//   official     — official Korean marketing names or alternative romanizations

type AliasEntry = {
  model: string;
  aliases: Array<{ alias: string; type: "community" | "abbreviation" | "official" }>;
};

const ALIAS_DATA: AliasEntry[] = [
  // =========================================================================
  // WILSON (15)
  // =========================================================================
  {
    model: "Pro Staff RF97 Autograph v13",
    aliases: [
      { alias: "프스", type: "community" },
      { alias: "RF97", type: "abbreviation" },
      { alias: "페더러 라켓", type: "community" },
      { alias: "프로스태프", type: "community" },
      { alias: "프스97", type: "abbreviation" },
    ],
  },
  {
    model: "Blade 98 v8 16x19",
    aliases: [
      { alias: "블레이드", type: "community" },
      { alias: "블98", type: "abbreviation" },
      { alias: "블레이드 16x19", type: "community" },
    ],
  },
  {
    model: "Blade 98 v8 18x20",
    aliases: [
      { alias: "블98 18x20", type: "abbreviation" },
      { alias: "블레이드 18x20", type: "community" },
    ],
  },
  {
    model: "Ultra 100 v4",
    aliases: [
      { alias: "울트라", type: "community" },
      { alias: "울100", type: "abbreviation" },
    ],
  },
  {
    model: "Ultra 108 v4",
    aliases: [
      { alias: "울108", type: "abbreviation" },
      { alias: "울트라 108", type: "community" },
    ],
  },
  {
    model: "Clash 100 v2",
    aliases: [
      { alias: "클래시", type: "community" },
      { alias: "클100", type: "abbreviation" },
    ],
  },
  {
    model: "Clash 100L v2",
    aliases: [
      { alias: "클래시 라이트", type: "community" },
      { alias: "클100L", type: "abbreviation" },
    ],
  },
  {
    model: "Burn 100S v5",
    aliases: [
      { alias: "번", type: "community" },
      { alias: "번100S", type: "abbreviation" },
    ],
  },
  {
    model: "Pro Staff 97L v13",
    aliases: [
      { alias: "프스 라이트", type: "community" },
      { alias: "프스97L", type: "abbreviation" },
    ],
  },
  {
    model: "Juice 100S",
    aliases: [
      { alias: "쥬스", type: "community" },
    ],
  },
  {
    model: "Shift 99 Pro v1",
    aliases: [
      { alias: "시프트 프로", type: "community" },
      { alias: "시프트99P", type: "abbreviation" },
    ],
  },
  {
    model: "Shift 99 v1",
    aliases: [
      { alias: "시프트", type: "community" },
      { alias: "시프트99", type: "abbreviation" },
    ],
  },
  {
    model: "Ultra Tour 95 v4",
    aliases: [
      { alias: "울투어", type: "community" },
      { alias: "울투어95", type: "abbreviation" },
    ],
  },
  {
    model: "Roland Garros Clash 100",
    aliases: [
      { alias: "롤랑가로스", type: "community" },
      { alias: "RG 클래시", type: "abbreviation" },
    ],
  },
  {
    model: "Six One 95 18x20",
    aliases: [
      { alias: "식스원", type: "community" },
      { alias: "식스원95", type: "abbreviation" },
    ],
  },

  // =========================================================================
  // HEAD (13)
  // =========================================================================
  {
    model: "Speed Pro 2024",
    aliases: [
      { alias: "스피드 프로", type: "community" },
      { alias: "스프", type: "abbreviation" },
      { alias: "조코비치 라켓", type: "community" },
    ],
  },
  {
    model: "Speed MP 2024",
    aliases: [
      { alias: "스피드 MP", type: "community" },
      { alias: "스엠피", type: "abbreviation" },
    ],
  },
  {
    model: "Prestige Pro 2023",
    aliases: [
      { alias: "프레스티지", type: "community" },
      { alias: "프레스", type: "abbreviation" },
      { alias: "프레스 프로", type: "abbreviation" },
    ],
  },
  {
    model: "Prestige MP 2023",
    aliases: [
      { alias: "프레스 MP", type: "abbreviation" },
      { alias: "프레스티지 MP", type: "community" },
    ],
  },
  {
    model: "Radical MP 2023",
    aliases: [
      { alias: "래디컬", type: "community" },
      { alias: "래디컬 MP", type: "community" },
    ],
  },
  {
    model: "Instinct MP 2022",
    aliases: [
      { alias: "인스팅트", type: "community" },
      { alias: "인스팅트 MP", type: "community" },
    ],
  },
  {
    model: "Extreme MP 2022",
    aliases: [
      { alias: "익스트림", type: "community" },
      { alias: "익스트림 MP", type: "community" },
    ],
  },
  {
    model: "MXG 5",
    aliases: [
      { alias: "MXG", type: "abbreviation" },
    ],
  },
  {
    model: "Ti.S6",
    aliases: [
      { alias: "티에스6", type: "community" },
      { alias: "TiS6", type: "abbreviation" },
    ],
  },
  {
    model: "Boom Pro 2022",
    aliases: [
      { alias: "붐", type: "community" },
      { alias: "붐 프로", type: "community" },
    ],
  },
  {
    model: "Gravity Pro 2023",
    aliases: [
      { alias: "그래비티 프로", type: "community" },
      { alias: "그래비티", type: "community" },
      { alias: "즈베레프 라켓", type: "community" },
    ],
  },
  {
    model: "Gravity MP 2023",
    aliases: [
      { alias: "그래비티 MP", type: "community" },
    ],
  },
  {
    model: "Speed S 2024",
    aliases: [
      { alias: "스피드 S", type: "community" },
    ],
  },

  // =========================================================================
  // BABOLAT (13)
  // =========================================================================
  {
    model: "Pure Aero 2023",
    aliases: [
      { alias: "퓨어에어로", type: "community" },
      { alias: "PA", type: "abbreviation" },
      { alias: "에어로", type: "community" },
      { alias: "나달 라켓", type: "community" },
    ],
  },
  {
    model: "Pure Aero Team 2023",
    aliases: [
      { alias: "PA팀", type: "abbreviation" },
      { alias: "에어로 팀", type: "community" },
    ],
  },
  {
    model: "Pure Drive 2021",
    aliases: [
      { alias: "퓨어드라이브", type: "community" },
      { alias: "PD", type: "abbreviation" },
      { alias: "퓨드", type: "abbreviation" },
    ],
  },
  {
    model: "Pure Drive Team 2021",
    aliases: [
      { alias: "PD팀", type: "abbreviation" },
      { alias: "퓨드 팀", type: "community" },
    ],
  },
  {
    model: "Pure Strike 97 18x20",
    aliases: [
      { alias: "퓨어스트라이크", type: "community" },
      { alias: "PS", type: "abbreviation" },
      { alias: "퓨스", type: "abbreviation" },
      { alias: "티엠 라켓", type: "community" },
    ],
  },
  {
    model: "Pure Strike 100 16x19",
    aliases: [
      { alias: "PS 100", type: "abbreviation" },
      { alias: "퓨스 100", type: "abbreviation" },
    ],
  },
  {
    model: "Pure Control 97 18x20",
    aliases: [
      { alias: "퓨어컨트롤", type: "community" },
      { alias: "PC", type: "abbreviation" },
    ],
  },
  {
    model: "Boost Aero",
    aliases: [
      { alias: "부스트 에어로", type: "community" },
    ],
  },
  {
    model: "Boost Drive",
    aliases: [
      { alias: "부스트 드라이브", type: "community" },
    ],
  },
  {
    model: "EVO Aero",
    aliases: [
      { alias: "에보 에어로", type: "community" },
      { alias: "에보", type: "abbreviation" },
    ],
  },
  {
    model: "Pure Aero Lite 2023",
    aliases: [
      { alias: "PA 라이트", type: "abbreviation" },
      { alias: "에어로 라이트", type: "community" },
    ],
  },
  {
    model: "Aero G",
    aliases: [
      { alias: "에어로G", type: "community" },
    ],
  },
  {
    model: "Pure Drive 110 2021",
    aliases: [
      { alias: "PD 110", type: "abbreviation" },
      { alias: "퓨드 110", type: "abbreviation" },
    ],
  },

  // =========================================================================
  // YONEX (15)
  // =========================================================================
  {
    model: "VCORE Pro 97 2021",
    aliases: [
      { alias: "브이코어 프로", type: "community" },
      { alias: "브코프", type: "abbreviation" },
    ],
  },
  {
    model: "VCORE 98 2023",
    aliases: [
      { alias: "브이코어 98", type: "community" },
      { alias: "브코98", type: "abbreviation" },
    ],
  },
  {
    model: "VCORE 100 2023",
    aliases: [
      { alias: "브이코어 100", type: "community" },
      { alias: "브코100", type: "abbreviation" },
    ],
  },
  {
    model: "VCORE 100L 2023",
    aliases: [
      { alias: "브이코어 라이트", type: "community" },
      { alias: "브코100L", type: "abbreviation" },
    ],
  },
  {
    model: "Ezone 98 2022",
    aliases: [
      { alias: "이존 98", type: "community" },
      { alias: "이존98", type: "abbreviation" },
    ],
  },
  {
    model: "Ezone 100 2022",
    aliases: [
      { alias: "이존 100", type: "community" },
      { alias: "이존100", type: "abbreviation" },
    ],
  },
  {
    model: "Percept 97 2023",
    aliases: [
      { alias: "퍼셉트 97", type: "community" },
      { alias: "퍼셉트", type: "community" },
    ],
  },
  {
    model: "Percept 100 2023",
    aliases: [
      { alias: "퍼셉트 100", type: "community" },
    ],
  },
  {
    model: "VCORE Pro 100 2021",
    aliases: [
      { alias: "브코프 100", type: "abbreviation" },
      { alias: "브이코어 프로 100", type: "community" },
    ],
  },
  {
    model: "SV 95i",
    aliases: [
      { alias: "SV95", type: "abbreviation" },
    ],
  },
  {
    model: "VCORE 110 2023",
    aliases: [
      { alias: "브이코어 110", type: "community" },
      { alias: "브코110", type: "abbreviation" },
    ],
  },
  {
    model: "Ezone 98L 2022",
    aliases: [
      { alias: "이존 라이트", type: "community" },
      { alias: "이존98L", type: "abbreviation" },
    ],
  },
  {
    model: "Percept 97D 2023",
    aliases: [
      { alias: "퍼셉트 97D", type: "community" },
    ],
  },
  {
    model: "VCORE Ace 2023",
    aliases: [
      { alias: "브이코어 에이스", type: "community" },
      { alias: "브코에이스", type: "abbreviation" },
    ],
  },
  {
    model: "Ezone 100SL 2022",
    aliases: [
      { alias: "이존 SL", type: "community" },
      { alias: "이존100SL", type: "abbreviation" },
    ],
  },

  // =========================================================================
  // DUNLOP (10)
  // =========================================================================
  {
    model: "CX 200 2021",
    aliases: [
      { alias: "CX200", type: "abbreviation" },
      { alias: "던롭 CX", type: "community" },
    ],
  },
  {
    model: "CX 200 Tour 18x20 2021",
    aliases: [
      { alias: "CX투어", type: "abbreviation" },
      { alias: "CX200투어", type: "abbreviation" },
    ],
  },
  {
    model: "CX 400 Tour 2021",
    aliases: [
      { alias: "CX400", type: "abbreviation" },
      { alias: "CX400투어", type: "abbreviation" },
    ],
  },
  {
    model: "SX 300 2022",
    aliases: [
      { alias: "SX300", type: "abbreviation" },
      { alias: "던롭 SX", type: "community" },
    ],
  },
  {
    model: "SX 300 Lite 2022",
    aliases: [
      { alias: "SX라이트", type: "abbreviation" },
      { alias: "SX300라이트", type: "abbreviation" },
    ],
  },
  {
    model: "FX 500 2023",
    aliases: [
      { alias: "FX500", type: "abbreviation" },
      { alias: "던롭 FX", type: "community" },
    ],
  },
  {
    model: "FX 500 Tour 2023",
    aliases: [
      { alias: "FX투어", type: "abbreviation" },
      { alias: "FX500투어", type: "abbreviation" },
    ],
  },
  {
    model: "CX Pro 255 2021",
    aliases: [
      { alias: "CX프로", type: "abbreviation" },
    ],
  },
  {
    model: "SX 300 Tour 2022",
    aliases: [
      { alias: "SX투어", type: "abbreviation" },
      { alias: "SX300투어", type: "abbreviation" },
    ],
  },
  {
    model: "Biomimetic 500",
    aliases: [
      { alias: "바이오미메틱", type: "community" },
    ],
  },

  // =========================================================================
  // PRINCE (7)
  // =========================================================================
  {
    model: "Textreme Tour 100P",
    aliases: [
      { alias: "텍스트림 100P", type: "community" },
      { alias: "텍스트림", type: "community" },
    ],
  },
  {
    model: "Textreme Tour 98",
    aliases: [
      { alias: "텍스트림 98", type: "community" },
    ],
  },
  {
    model: "Beast 100",
    aliases: [
      { alias: "비스트", type: "community" },
      { alias: "비스트100", type: "abbreviation" },
    ],
  },
  {
    model: "Phantom 100P 18x20",
    aliases: [
      { alias: "팬텀", type: "community" },
      { alias: "팬텀100P", type: "abbreviation" },
    ],
  },
  {
    model: "Spectrum 105",
    aliases: [
      { alias: "스펙트럼", type: "community" },
    ],
  },
  {
    model: "Ripcord 100",
    aliases: [
      { alias: "립코드", type: "community" },
    ],
  },
  {
    model: "Warrior 107",
    aliases: [
      { alias: "워리어", type: "community" },
    ],
  },

  // =========================================================================
  // TECNIFIBRE (7)
  // =========================================================================
  {
    model: "TF40 305 18x20",
    aliases: [
      { alias: "TF40", type: "abbreviation" },
      { alias: "테크니 TF40", type: "community" },
    ],
  },
  {
    model: "TF40 315 16x19",
    aliases: [
      { alias: "TF40 315", type: "abbreviation" },
    ],
  },
  {
    model: "TFight 300 Isoflex 2023",
    aliases: [
      { alias: "티파이트 300", type: "community" },
      { alias: "티파이트", type: "community" },
      { alias: "메드베데프 라켓", type: "community" },
    ],
  },
  {
    model: "TFight 295 Isoflex 2023",
    aliases: [
      { alias: "티파이트 295", type: "community" },
    ],
  },
  {
    model: "TFight 265 Isoflex 2023",
    aliases: [
      { alias: "티파이트 265", type: "community" },
    ],
  },
  {
    model: "Tempo 298 IGA",
    aliases: [
      { alias: "템포", type: "community" },
      { alias: "시비옹텍 라켓", type: "community" },
    ],
  },
  {
    model: "T-Rebound 298 IGA",
    aliases: [
      { alias: "티리바운드", type: "community" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seedAliases() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("Seeding racket aliases...");

  let inserted = 0;
  let skipped = 0;

  for (const entry of ALIAS_DATA) {
    // Find the racket model by name
    const [model] = await db
      .select({ id: racketModels.id })
      .from(racketModels)
      .where(eq(racketModels.name, entry.model))
      .limit(1);

    if (!model) {
      console.warn(`  SKIP: model "${entry.model}" not found in DB`);
      skipped += entry.aliases.length;
      continue;
    }

    for (const a of entry.aliases) {
      await db
        .insert(racketAliases)
        .values({
          racketModelId: model.id,
          alias: a.alias,
          aliasType: a.type,
        })
        .onConflictDoNothing();
      inserted++;
    }
  }

  console.log(`Alias seed complete: ${inserted} inserted, ${skipped} skipped.`);
  await client.end();
}

seedAliases().catch((err) => {
  console.error("Alias seed failed:", err);
  process.exit(1);
});
