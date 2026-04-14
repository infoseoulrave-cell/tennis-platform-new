import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: models } = await supabase
    .from("racket_models")
    .select(`
      id, name, release_year, segment,
      brands!inner(name),
      racket_specs(weight_g, head_size_sq_in, string_pattern, stiffness_ra, swing_weight_kg_cm2, balance_mm, beam_width_mm),
      racket_variants(retail_price_krw)
    `)
    .eq("discontinued", false)
    .order("name");

  if (!models) return;

  const { data: scores } = await supabase
    .from("racket_axis_scores")
    .select("racket_model_id, score, axis_definitions!inner(axis_key)");

  const scoreMap: Record<string, Record<string, number>> = {};
  if (scores) {
    for (const s of scores) {
      const key = (s.axis_definitions as any)?.axis_key;
      if (!scoreMap[s.racket_model_id]) scoreMap[s.racket_model_id] = {};
      scoreMap[s.racket_model_id][key] = Number(s.score);
    }
  }

  console.log("=== 현행 라켓 능력치 감사 ===\n");
  console.log("브랜드 | 모델 | 무게 | 헤드 | 패턴 | RA | SW | power | control | spin | comfort | stability");
  console.log("-".repeat(130));

  for (const m of models) {
    const brand = (m.brands as any)?.name;
    const specs = m.racket_specs as any;
    const sc = scoreMap[m.id] ?? {};
    const toPublic = (v: number) => {
      const pub = Math.round(((v / 100) * 10 - 5) * 10) / 10;
      const sign = pub > 0 ? "+" : "";
      return `${sign}${pub}`;
    };

    console.log(
      `${brand} | ${m.name} | ${specs?.weight_g ?? "?"}g | ${specs?.head_size_sq_in ?? "?"}" | ${specs?.string_pattern ?? "?"} | ${specs?.stiffness_ra ?? "?"} | ${specs?.swing_weight_kg_cm2 ?? "?"} | ` +
      `${sc.power != null ? toPublic(sc.power) : "?"} | ${sc.control != null ? toPublic(sc.control) : "?"} | ${sc.spin != null ? toPublic(sc.spin) : "?"} | ${sc.comfort != null ? toPublic(sc.comfort) : "?"} | ${sc.stability != null ? toPublic(sc.stability) : "?"}`
    );
  }
}

main();
