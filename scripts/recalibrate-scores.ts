import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: allScores } = await supabase
    .from("racket_axis_scores")
    .select("id, racket_model_id, score, axis_definitions!inner(axis_key)");

  if (!allScores || allScores.length === 0) {
    console.log("No scores found");
    return;
  }

  const { data: activeModels } = await supabase
    .from("racket_models")
    .select("id")
    .eq("discontinued", false);

  const activeIds = new Set((activeModels ?? []).map(m => m.id));

  const byAxis: Record<string, { id: string; score: number; active: boolean }[]> = {};

  for (const s of allScores) {
    const key = (s.axis_definitions as unknown as { axis_key: string })?.axis_key;
    if (!key) continue;
    if (!byAxis[key]) byAxis[key] = [];
    byAxis[key].push({
      id: s.id,
      score: Number(s.score),
      active: activeIds.has(s.racket_model_id),
    });
  }

  console.log("=== 축별 현재 분포 (active 라켓만) ===\n");

  for (const [axis, entries] of Object.entries(byAxis)) {
    const activeEntries = entries.filter(e => e.active);
    const scores = activeEntries.map(e => e.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    console.log(`${axis}: mean=${mean.toFixed(1)}, min=${min.toFixed(1)}, max=${max.toFixed(1)}, count=${scores.length}`);

    const targetMean = 50;
    const shift = targetMean - mean;

    console.log(`  → shift by ${shift.toFixed(1)} to center at 50`);

    let updated = 0;
    for (const entry of entries) {
      const newScore = Math.max(0, Math.min(100, entry.score + shift));
      const { error } = await supabase
        .from("racket_axis_scores")
        .update({ score: newScore.toFixed(2) })
        .eq("id", entry.id);

      if (!error) updated++;
    }
    console.log(`  → ${updated} scores updated\n`);
  }

  console.log("=== 보정 후 검증 ===\n");

  const { data: verifyScores } = await supabase
    .from("racket_axis_scores")
    .select("score, axis_definitions!inner(axis_key), racket_model_id");

  if (verifyScores) {
    const verifyByAxis: Record<string, number[]> = {};
    for (const s of verifyScores) {
      const key = (s.axis_definitions as unknown as { axis_key: string })?.axis_key;
      if (!key) continue;
      if (!activeIds.has(s.racket_model_id)) continue;
      if (!verifyByAxis[key]) verifyByAxis[key] = [];
      verifyByAxis[key].push(Number(s.score));
    }

    for (const [axis, scores] of Object.entries(verifyByAxis)) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const toPublic = (v: number) => Math.round(((v / 100) * 10 - 5) * 10) / 10;
      const pubScores = scores.map(toPublic);
      const pubMean = pubScores.reduce((a, b) => a + b, 0) / pubScores.length;
      console.log(`${axis}: internal_mean=${mean.toFixed(1)}, public_mean=${pubMean.toFixed(2)}, public_range=[${Math.min(...pubScores)}, ${Math.max(...pubScores)}]`);
    }
  }
}

main();
