"use client";

import { useState } from "react";
import Link from "next/link";

type ImportResult = {
  batchId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: Array<{ row: number; error: string }>;
};

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const rows = JSON.parse(jsonInput);
      const res = await fetch("/api/admin/catalog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDescription: sourceDescription || undefined,
          rows: Array.isArray(rows) ? rows : [rows],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON");
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplate() {
    const res = await fetch("/api/admin/catalog/template");
    const data = await res.json();
    setJsonInput(JSON.stringify(data.examples, null, 2));
  }

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Import Rackets</h1>
        <Link href="/admin/catalog" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Catalog
        </Link>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
          Source Description (optional)
        </label>
        <input
          type="text"
          value={sourceDescription}
          onChange={(e) => setSourceDescription(e.target.value)}
          placeholder="e.g. Wilson Korea 2024 catalog spreadsheet"
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 600 }}>Racket Data (JSON array)</label>
          <button onClick={loadTemplate} style={{ padding: "4px 12px", fontSize: "12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}>
            Load Template
          </button>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={20}
          placeholder='[{"brand": "Wilson", "model": "Blade 98 v8", ...}]'
          style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", fontFamily: "monospace", fontSize: "13px", resize: "vertical" }}
        />
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !jsonInput.trim()}
        style={{
          padding: "10px 24px",
          background: loading ? "#9ca3af" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Importing..." : "Import"}
      </button>

      {error && (
        <div style={{ marginTop: "16px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#dc2626", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "16px", padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Import Complete</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "14px" }}>
            <div>Total: <strong>{result.totalRows}</strong></div>
            <div style={{ color: "#16a34a" }}>Success: <strong>{result.successCount}</strong></div>
            <div style={{ color: "#ca8a04" }}>Skipped: <strong>{result.skippedCount}</strong></div>
            <div style={{ color: "#dc2626" }}>Errors: <strong>{result.errorCount}</strong></div>
          </div>
          {result.errors.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Errors:</h4>
              {result.errors.map((e, i) => (
                <div key={i} style={{ fontSize: "12px", color: "#dc2626" }}>
                  Row {e.row}: {e.error}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
            Batch ID: {result.batchId}
          </div>
        </div>
      )}
    </main>
  );
}
