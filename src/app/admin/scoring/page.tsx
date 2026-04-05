import Link from "next/link";

export default function ScoringPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Scoring QA</h1>
      <p style={{ color: "#6b7280" }}>Coming soon — requires catalog schema to stabilize first.</p>
      <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>← Back to Admin</Link>
    </main>
  );
}
