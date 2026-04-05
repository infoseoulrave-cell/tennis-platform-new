"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Conflict = {
  field: string;
  values: Array<{ sourceId: string; sourceType: string; value: unknown; confidence: string | null }>;
};

type ReviewItem = {
  specId: string;
  modelId: string;
  brandName: string;
  modelName: string;
  generation: string | null;
  ingestionState: string;
  sourceCount: number;
  conflictCount: number;
  conflicts: Conflict[];
  resolvedCount: number;
};

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/catalog/review")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.data);
        setLoading(false);
      });
  }, []);

  async function handleTransition(specId: string, targetState: string, comment?: string) {
    const res = await fetch(`/api/admin/catalog/specs/${specId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetState, comment }),
    });

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.specId !== specId));
    }
  }

  async function handleResolve(specId: string, field: string, resolvedValue: string, reason: string) {
    setResolving(true);
    await fetch(`/api/admin/catalog/specs/${specId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, resolvedValue, reason, reviewedBy: "admin" }),
    });

    // Refresh
    const res = await fetch("/api/admin/catalog/review");
    const data = await res.json();
    setItems(data.data);
    setResolving(false);
  }

  if (loading) {
    return <main style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>Loading review queue...</main>;
  }

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Review Queue ({items.length})</h1>
        <Link href="/admin/catalog" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Catalog
        </Link>
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          No specs awaiting review. Specs must be transitioned to &quot;review&quot; state first.
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.specId}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            background: selectedSpec === item.specId ? "#fefce8" : "white",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                {item.brandName} {item.modelName}
                {item.generation && <span style={{ color: "#6b7280", fontWeight: 400 }}> ({item.generation})</span>}
              </h3>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                {item.sourceCount} source(s) · {item.conflictCount} conflict(s) · {item.resolvedCount} resolved
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleTransition(item.specId, "published", "Approved after review")}
                disabled={item.conflictCount > item.resolvedCount}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  background: item.conflictCount > item.resolvedCount ? "#d1d5db" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: item.conflictCount > item.resolvedCount ? "not-allowed" : "pointer",
                }}
              >
                Publish
              </button>
              <button
                onClick={() => handleTransition(item.specId, "rejected", "Rejected during review")}
                style={{ padding: "6px 14px", fontSize: "13px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedSpec(selectedSpec === item.specId ? null : item.specId)}
                style={{ padding: "6px 14px", fontSize: "13px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
              >
                {selectedSpec === item.specId ? "Hide Details" : "Details"}
              </button>
            </div>
          </div>

          {selectedSpec === item.specId && item.conflicts.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Spec Conflicts</h4>
              {item.conflicts.map((conflict) => (
                <div key={conflict.field} style={{ padding: "12px", background: "#fff7ed", borderRadius: "6px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    Field: <code>{conflict.field}</code>
                  </div>
                  {conflict.values.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "13px" }}>
                      <span style={{ color: "#6b7280" }}>{v.sourceType}:</span>
                      <strong>{String(v.value)}</strong>
                      {v.confidence && <span style={{ color: "#9ca3af" }}>(conf: {v.confidence})</span>}
                      <button
                        onClick={() => handleResolve(item.specId, conflict.field, String(v.value), `Selected from ${v.sourceType} source`)}
                        disabled={resolving}
                        style={{ padding: "2px 8px", fontSize: "11px", background: "#2563eb", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Use this
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {selectedSpec === item.specId && item.conflicts.length === 0 && (
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#16a34a" }}>
              No conflicts detected. Ready to publish.
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
