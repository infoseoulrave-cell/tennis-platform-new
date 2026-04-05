import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Admin Dashboard</h1>
      <nav>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px" }}>
          <li>
            <Link href="/admin/catalog" style={{ display: "block", padding: "16px", background: "#f3f4f6", borderRadius: "8px", textDecoration: "none", color: "#111827" }}>
              <strong>Catalog Management</strong>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Browse, import, and manage racket catalog</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/catalog/review" style={{ display: "block", padding: "16px", background: "#fef3c7", borderRadius: "8px", textDecoration: "none", color: "#111827" }}>
              <strong>Review Queue</strong>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Review spec conflicts, approve or reject catalog entries</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/catalog/import" style={{ display: "block", padding: "16px", background: "#dbeafe", borderRadius: "8px", textDecoration: "none", color: "#111827" }}>
              <strong>Import Rackets</strong>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Bulk import Korean-market racket data via JSON</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/scoring" style={{ display: "block", padding: "16px", background: "#f3f4f6", borderRadius: "8px", textDecoration: "none", color: "#111827" }}>
              <strong>Scoring QA</strong>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Review axis scores and recommendation quality</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/partners" style={{ display: "block", padding: "16px", background: "#f3f4f6", borderRadius: "8px", textDecoration: "none", color: "#111827" }}>
              <strong>Partner Offers</strong>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>Manage partner offers and attribution</p>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
