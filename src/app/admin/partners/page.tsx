import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerInquiries } from "@/db/schema";
import { INQUIRY_TYPE_LABELS } from "@/lib/partner-inquiry";

export const dynamic = "force-dynamic";

const cell: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  verticalAlign: "top",
};

const STATUS_LABELS: Record<string, string> = {
  new: "신규",
  contacted: "연락함",
  closed: "종료",
};

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["new", "contacted", "closed"].includes(status)) return;
  await db.update(partnerInquiries).set({ status }).where(eq(partnerInquiries.id, id));
  revalidatePath("/admin/partners");
}

export default async function AdminPartnersPage() {
  const inquiries = await db
    .select()
    .from(partnerInquiries)
    .orderBy(desc(partnerInquiries.createdAt))
    .catch(() => []);

  return (
    <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>← Admin</Link>
      <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "12px 0 16px" }}>제휴 문의 리드</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#6b7280", fontSize: "12px" }}>
            <th style={cell}>접수일</th>
            <th style={cell}>유형</th>
            <th style={cell}>이름/상호</th>
            <th style={cell}>연락처</th>
            <th style={cell}>내용</th>
            <th style={cell}>상태</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>
                {inq.createdAt.toLocaleDateString("ko-KR")}
              </td>
              <td style={cell}>
                {INQUIRY_TYPE_LABELS[inq.inquiryType as keyof typeof INQUIRY_TYPE_LABELS] ?? inq.inquiryType}
              </td>
              <td style={cell}>{inq.name}</td>
              <td style={cell}>{inq.contact}</td>
              <td style={{ ...cell, maxWidth: "280px" }}>{inq.message ?? "—"}</td>
              <td style={cell}>
                <form action={setStatus}>
                  <input type="hidden" name="id" value={inq.id} />
                  <select
                    name="status"
                    defaultValue={inq.status}
                    onChange={undefined}
                    style={{ padding: "4px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px" }}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button type="submit" style={{ marginLeft: "6px", fontSize: "12px", cursor: "pointer" }}>저장</button>
                </form>
              </td>
            </tr>
          ))}
          {inquiries.length === 0 && (
            <tr><td colSpan={6} style={{ ...cell, color: "#9ca3af" }}>접수된 문의가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
