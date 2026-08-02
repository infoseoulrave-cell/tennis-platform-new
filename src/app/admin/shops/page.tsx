import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerOffers } from "@/db/schema";
import { createAdminSessionToken, isValidAdminToken } from "@/lib/admin-auth";
import { getRackets } from "@/lib/queries";
import { isUuid } from "@/lib/recommendation-access";

export const dynamic = "force-dynamic";

const cell: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  verticalAlign: "top",
};

async function requireAdminSession() {
  const adminSecret = process.env.ADMIN_SECRET;
  const adminToken = (await cookies()).get("admin_token")?.value;
  if (!adminSecret || !isValidAdminToken(adminToken, createAdminSessionToken(adminSecret))) {
    throw new Error("Unauthorized");
  }
}

export function shopAttributionTag(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `shop-${slug || "unnamed"}`;
}

export function parseCoordinate(
  value: FormDataEntryValue | null,
  min: number,
  max: number,
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return String(parsed);
}

function isSafeContactUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function createShop(formData: FormData) {
  "use server";
  await requireAdminSession();

  const name = String(formData.get("partnerName") ?? "").trim();
  if (!name) return;

  const contactUrl = String(formData.get("contactUrl") ?? "").trim();
  const racketModelId = String(formData.get("racketModelId") ?? "").trim();

  await db.insert(partnerOffers).values({
    partnerName: name,
    partnerType: "shop",
    partnerNameKo: String(formData.get("partnerNameKo") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    contactUrl: contactUrl && isSafeContactUrl(contactUrl) ? contactUrl : null,
    racketModelId: isUuid(racketModelId) ? racketModelId : null,
    offerDescription:
      String(formData.get("offerDescription") ?? "").trim() || null,
    attributionTag: shopAttributionTag(name),
    lat: parseCoordinate(formData.get("lat"), -90, 90),
    lng: parseCoordinate(formData.get("lng"), -180, 180),
    // 등록 직후엔 비활성 — 매장과 노출 내용 확인 후 활성으로 전환한다.
    active: false,
  });
  revalidatePath("/admin/shops");
  revalidatePath("/shops");
}

async function toggleShop(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await db
    .update(partnerOffers)
    .set({ active: !active, updatedAt: new Date() })
    .where(eq(partnerOffers.id, id));
  revalidatePath("/admin/shops");
  revalidatePath("/shops");
}

async function deleteShop(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  await db.delete(partnerOffers).where(eq(partnerOffers.id, id));
  revalidatePath("/admin/shops");
  revalidatePath("/shops");
}

export default async function AdminShopsPage() {
  const [shops, catalog] = await Promise.all([
    db
      .select()
      .from(partnerOffers)
      .where(eq(partnerOffers.partnerType, "shop"))
      .orderBy(desc(partnerOffers.createdAt))
      .catch(() => []),
    getRackets({ limit: 500 }).catch(() => ({ rackets: [], total: 0 })),
  ]);
  const racketById = new Map(
    catalog.rackets.map((r) => [r.id, `${r.brand} ${r.model}`]),
  );

  return (
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>← Admin</Link>
      <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "12px 0 4px" }}>Shops · 매장 소개</h1>
      <p style={{ color: "#6b7280", fontSize: "14px", marginTop: 0 }}>
        마켓플레이스 0단계 — 매장 소개. 등록 직후엔 <strong>비활성</strong>이며, 활성으로 바꾼 매장만
        /shops 와 라켓 상세에 노출됩니다. 라켓을 지정하면 그 라켓 취급 매장으로, 비우면 일반 매장으로 표시됩니다.
      </p>

      <section style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", margin: "16px 0 24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px" }}>새 매장 추가</h2>
        <form action={createShop} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
          <input name="partnerName" placeholder="상호 (영문/공식) *" required style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="partnerNameKo" placeholder="표시명 (한글)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="location" placeholder="주소" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", gridColumn: "1 / -1" }} />
          <input name="contactUrl" type="url" placeholder="연락·지도 URL (네이버지도/카톡채널)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", gridColumn: "1 / -1" }} />
          <input name="racketModelId" list="racket-ids" placeholder="취급 라켓 (선택, 비우면 일반)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <datalist id="racket-ids">
            {catalog.rackets.map((r) => (
              <option key={r.id} value={r.id}>{`${r.brand} ${r.model}`}</option>
            ))}
          </datalist>
          <input name="lat" type="number" step="any" placeholder="위도 (선택)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="lng" type="number" step="any" placeholder="경도 (선택)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="offerDescription" placeholder="한 줄 소개 (선택)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", gridColumn: "1 / -1" }} />
          <button type="submit" style={{ padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>추가 (비활성으로)</button>
        </form>
      </section>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#6b7280", fontSize: "12px" }}>
            <th style={cell}>매장</th>
            <th style={cell}>주소</th>
            <th style={cell}>취급 라켓</th>
            <th style={cell}>연락 URL</th>
            <th style={cell}>상태</th>
            <th style={cell}></th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop.id} style={{ opacity: shop.active ? 1 : 0.45 }}>
              <td style={cell}>
                <div style={{ fontWeight: 500 }}>{shop.partnerNameKo ?? shop.partnerName}</div>
                {shop.partnerNameKo && <div style={{ color: "#9ca3af", fontSize: "12px" }}>{shop.partnerName}</div>}
              </td>
              <td style={{ ...cell, maxWidth: "220px" }}>{shop.location ?? "—"}</td>
              <td style={cell}>
                {shop.racketModelId
                  ? racketById.get(shop.racketModelId) ?? shop.racketModelId
                  : "일반"}
              </td>
              <td style={{ ...cell, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shop.contactUrl ?? "—"}
              </td>
              <td style={cell}>{shop.active ? "노출중" : "비활성"}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>
                <form action={toggleShop} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={shop.id} />
                  <input type="hidden" name="active" value={String(shop.active)} />
                  <button type="submit" style={{ fontSize: "12px", marginRight: "6px", cursor: "pointer" }}>
                    {shop.active ? "비활성" : "활성"}
                  </button>
                </form>
                <form action={deleteShop} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={shop.id} />
                  <button type="submit" style={{ fontSize: "12px", color: "#dc2626", cursor: "pointer" }}>삭제</button>
                </form>
              </td>
            </tr>
          ))}
          {shops.length === 0 && (
            <tr><td colSpan={6} style={{ ...cell, color: "#9ca3af" }}>등록된 매장이 없습니다. 위 폼에서 추가하세요.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
