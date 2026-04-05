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
          "How much inherent power the racket adds to shots. Derived from head size, weight distribution, and stiffness.",
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
          "Precision and placement ability. Inversely related to power for most rackets. Tighter string patterns, smaller heads, and lower stiffness contribute.",
        scoringFormula:
          "0.30 * inv_norm(headSize) + 0.25 * norm(stringDensity) + 0.25 * inv_norm(stiffness) + 0.20 * norm(weight)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "comfort",
        axisName: "Comfort",
        axisNameKo: "편안함",
        description:
          "Vibration dampening and arm-friendliness. Lower stiffness, moderate weight, and wider beam profiles contribute.",
        scoringFormula:
          "0.40 * inv_norm(stiffness) + 0.30 * norm(weight) + 0.30 * norm(beamWidth)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "spin",
        axisName: "Spin Potential",
        axisNameKo: "스핀",
        description:
          "Ability to generate topspin and slice. Open string patterns, larger heads, and aerodynamic profiles contribute.",
        scoringFormula:
          "0.40 * inv_norm(stringDensity) + 0.30 * norm(headSize) + 0.30 * norm(swingWeight)",
        weightDefault: "0.20",
      },
      {
        version: "v1",
        axisKey: "maneuverability",
        axisName: "Maneuverability",
        axisNameKo: "조작성",
        description:
          "Ease of swinging and handling at the net. Lower swing weight, lighter mass, and head-light balance contribute.",
        scoringFormula:
          "0.40 * inv_norm(swingWeight) + 0.35 * inv_norm(weight) + 0.25 * inv_norm(balance)",
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
