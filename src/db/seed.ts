import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { brands, axisDefinitions } from "./schema";

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("Seeding brands...");
  await db
    .insert(brands)
    .values([
      { name: "Wilson", nameKo: "윌슨", country: "US" },
      { name: "Head", nameKo: "헤드", country: "AT" },
      { name: "Babolat", nameKo: "바볼랏", country: "FR" },
      { name: "Yonex", nameKo: "요넥스", country: "JP" },
      { name: "Dunlop", nameKo: "던롭", country: "GB" },
      { name: "Prince", nameKo: "프린스", country: "US" },
      { name: "Tecnifibre", nameKo: "테크니파이버", country: "FR" },
    ])
    .onConflictDoNothing();

  console.log("Seeding axis definitions v1...");
  await db
    .insert(axisDefinitions)
    .values([
      {
        version: "v1",
        axisKey: "power",
        axisName: "Power",
        axisNameKo: "파워",
        description:
          "How much inherent power the racket adds to shots. Derived from head size, swing weight, stiffness, and mass.",
        scoringFormula:
          "0.35 * norm(headSize) + 0.30 * norm(swingWeight) + 0.20 * norm(stiffness) + 0.15 * norm(weight)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "control",
        axisName: "Control",
        axisNameKo: "컨트롤",
        description:
          "Precision and placement ability. Smaller heads, denser string patterns, heavier mass, and lower stiffness contribute.",
        scoringFormula:
          "0.35 * inv_norm(headSize) + 0.30 * norm(stringDensity) + 0.20 * norm(weight) + 0.15 * inv_norm(stiffness)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "comfort",
        axisName: "Comfort",
        axisNameKo: "편안함",
        description:
          "Arm-friendliness and reduced fatigue. Lower stiffness, wider beam profiles, and lighter weight contribute.",
        scoringFormula:
          "0.45 * inv_norm(stiffness) + 0.35 * norm(beamWidth) + 0.20 * inv_norm(weight)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "spin",
        axisName: "Spin Potential",
        axisNameKo: "스핀",
        description:
          "Ability to generate topspin and slice. Open string patterns, larger heads, and head-heavy balance contribute.",
        scoringFormula:
          "0.45 * inv_norm(stringDensity) + 0.30 * norm(headSize) + 0.25 * norm(balance)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "stability",
        axisName: "Stability",
        axisNameKo: "안정성",
        description:
          "Resistance to twisting on off-center hits and solid plowthrough feel. Higher weight, swing weight, and head size contribute.",
        scoringFormula:
          "0.35 * norm(weight) + 0.35 * norm(swingWeight) + 0.30 * norm(headSize)",
        weightDefault: "0.20",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
