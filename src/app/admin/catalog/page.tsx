import { db } from "@/db";
import { brands, racketModels, racketSpecs } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function CatalogPage() {
  const rackets = await db
    .select({
      specId: racketSpecs.id,
      brandName: brands.name,
      brandNameKo: brands.nameKo,
      modelName: racketModels.name,
      modelNameKo: racketModels.nameKo,
      generation: racketModels.generation,
      segment: racketModels.segment,
      headSizeSqIn: racketSpecs.headSizeSqIn,
      weightG: racketSpecs.weightG,
      stiffnessRa: racketSpecs.stiffnessRa,
      stringPattern: racketSpecs.stringPattern,
      ingestionState: racketSpecs.ingestionState,
      publishedAt: racketSpecs.publishedAt,
    })
    .from(racketSpecs)
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .orderBy(brands.name, racketModels.name);

  const stateCounts = await db
    .select({
      state: racketSpecs.ingestionState,
      count: count(),
    })
    .from(racketSpecs)
    .groupBy(racketSpecs.ingestionState);

  const stateColors: Record<string, string> = {
    raw: "#6b7280",
    normalized: "#3b82f6",
    review: "#f59e0b",
    published: "#10b981",
    rejected: "#ef4444",
  };

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Racket Catalog</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/admin/catalog/import" style={{ padding: "8px 16px", background: "#2563eb", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>
            Import Rackets
          </Link>
          <Link href="/admin/catalog/review" style={{ padding: "8px 16px", background: "#f59e0b", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>
            Review Queue
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {stateCounts.map((sc) => (
          <div key={sc.state} style={{ padding: "8px 16px", borderRadius: "8px", background: "#f3f4f6", fontSize: "14px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: stateColors[sc.state] ?? "#999", marginRight: "6px" }} />
            {sc.state}: <strong>{sc.count}</strong>
          </div>
        ))}
        <div style={{ padding: "8px 16px", borderRadius: "8px", background: "#e0e7ff", fontSize: "14px" }}>
          Total: <strong>{rackets.length}</strong>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Brand</th>
            <th style={{ padding: "8px" }}>Model</th>
            <th style={{ padding: "8px" }}>Segment</th>
            <th style={{ padding: "8px" }}>Head</th>
            <th style={{ padding: "8px" }}>Weight</th>
            <th style={{ padding: "8px" }}>Stiffness</th>
            <th style={{ padding: "8px" }}>Pattern</th>
            <th style={{ padding: "8px" }}>State</th>
          </tr>
        </thead>
        <tbody>
          {rackets.map((r) => (
            <tr key={r.specId} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "8px" }}>
                <div>{r.brandName}</div>
                {r.brandNameKo && <div style={{ fontSize: "12px", color: "#6b7280" }}>{r.brandNameKo}</div>}
              </td>
              <td style={{ padding: "8px" }}>
                <div>{r.modelName}</div>
                {r.modelNameKo && <div style={{ fontSize: "12px", color: "#6b7280" }}>{r.modelNameKo}</div>}
                {r.generation && <div style={{ fontSize: "11px", color: "#9ca3af" }}>{r.generation}</div>}
              </td>
              <td style={{ padding: "8px" }}>{r.segment ?? "—"}</td>
              <td style={{ padding: "8px" }}>{r.headSizeSqIn ?? "—"}</td>
              <td style={{ padding: "8px" }}>{r.weightG ? `${r.weightG}g` : "—"}</td>
              <td style={{ padding: "8px" }}>{r.stiffnessRa ?? "—"}</td>
              <td style={{ padding: "8px" }}>{r.stringPattern ?? "—"}</td>
              <td style={{ padding: "8px" }}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                  background: stateColors[r.ingestionState] ?? "#999",
                }}>
                  {r.ingestionState}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rackets.length === 0 && (
        <p style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          No rackets in catalog yet. <Link href="/admin/catalog/import">Import some rackets</Link> to get started.
        </p>
      )}
    </main>
  );
}
