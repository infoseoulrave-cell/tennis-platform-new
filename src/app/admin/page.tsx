export default function AdminDashboard() {
  return (
    <main>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><a href="/admin/catalog">Catalog Management</a></li>
          <li><a href="/admin/scoring">Scoring QA</a></li>
          <li><a href="/admin/partners">Partner Offers</a></li>
        </ul>
      </nav>
    </main>
  );
}
