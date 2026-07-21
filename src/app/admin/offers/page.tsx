import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { offers } from "@/db/schema";
import {
  getAffiliateClickStats,
  getAllOffers,
  offerVendorLabel,
  totalPrice,
  VENDOR_LABELS,
} from "@/lib/offers";
import { createAdminSessionToken, isValidAdminToken } from "@/lib/admin-auth";
import { isSafeOfferUrl } from "@/lib/offer-url";
import { getRackets } from "@/lib/queries";
import { isStringOfferKey, stringProducts } from "@/data/strings";

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

export function parseOptionalShippingFee(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : null;
}

export function isAllowedOfferProductKey(value: string): boolean {
  return Boolean(value) && (!value.startsWith("string:") || isStringOfferKey(value));
}

async function createOffer(formData: FormData) {
  "use server";
  await requireAdminSession();
  const url = String(formData.get("url") ?? "").trim();
  const racketSlug = String(formData.get("racketSlug") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "other");
  if (!isSafeOfferUrl(url) || !isAllowedOfferProductKey(racketSlug)) return;

  const price = Number(formData.get("priceKrw"));

  await db.insert(offers).values({
    racketSlug,
    vendor: vendor as "coupang" | "naver" | "brand" | "shop" | "other",
    vendorLabel: String(formData.get("vendorLabel") ?? "").trim() || null,
    productName: String(formData.get("productName") ?? "").trim() || null,
    url,
    priceKrw: Number.isFinite(price) && price > 0 ? Math.round(price) : null,
    shippingFeeKrw: parseOptionalShippingFee(formData.get("shippingFeeKrw")),
    sortOrder: Number(formData.get("sortOrder")) || 0,
    lastCheckedAt: new Date(),
  });
  revalidatePath("/admin/offers");
  revalidatePath("/strings");
}

async function toggleOffer(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await db.update(offers).set({ active: !active, updatedAt: new Date() }).where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/strings");
}

async function deleteOffer(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  await db.delete(offers).where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/strings");
}

export default async function AdminOffersPage() {
  const [offerList, clickStats, catalog] = await Promise.all([
    getAllOffers().catch(() => []),
    getAffiliateClickStats().catch(() => []),
    getRackets({ limit: 500 }).catch(() => ({ rackets: [], total: 0 })),
  ]);
  const racketList = catalog.rackets;

  const clicksByOffer = new Map(clickStats.map((s) => [s.offerId, s]));
  const total7d = clickStats.reduce((a, s) => a + s.clicks7d, 0);
  const total30d = clickStats.reduce((a, s) => a + s.clicks30d, 0);

  return (
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>← Admin</Link>
      <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "12px 0 4px" }}>Offers · 수익화</h1>
      <p style={{ color: "#6b7280", fontSize: "14px", marginTop: 0 }}>
        아웃바운드 클릭 — 최근 7일 <strong>{total7d}</strong>건 / 30일 <strong>{total30d}</strong>건
      </p>

      <section style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px" }}>새 오퍼 추가</h2>
        <form action={createOffer} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
          <input name="racketSlug" list="product-keys" aria-label="상품 키" placeholder="라켓 slug 또는 스트링 상품 키 *" required style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <datalist id="product-keys">
            {racketList.map((r) => (
              <option key={r.id} value={r.slug}>{`${r.brand} ${r.model}`}</option>
            ))}
            {stringProducts.map((product) => (
              <option key={product.offerKey} value={product.offerKey}>{`${product.brand} ${product.name}`}</option>
            ))}
          </datalist>
          <select name="vendor" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
            {Object.entries(VENDOR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input name="vendorLabel" placeholder="판매처 표시명 (선택)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="productName" placeholder="상품명 (선택)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="url" type="url" placeholder="어필리에이트 URL *" required style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", gridColumn: "1 / -1" }} />
          <input name="priceKrw" type="number" min="0" placeholder="가격 (원)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="shippingFeeKrw" type="number" min="0" placeholder="배송비 (원)" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <input name="sortOrder" type="number" placeholder="정렬 우선순위" style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
          <button type="submit" style={{ padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>추가</button>
        </form>
      </section>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#6b7280", fontSize: "12px" }}>
            <th style={cell}>상품 키</th>
            <th style={cell}>판매처</th>
            <th style={cell}>총액</th>
            <th style={cell}>클릭 7d/30d</th>
            <th style={cell}>상태</th>
            <th style={cell}></th>
          </tr>
        </thead>
        <tbody>
          {offerList.map((offer) => {
            const clicks = clicksByOffer.get(offer.id);
            const total = totalPrice(offer);
            return (
              <tr key={offer.id} style={{ opacity: offer.active ? 1 : 0.45 }}>
                <td style={cell}>
                  <div style={{ fontWeight: 500 }}>{offer.racketSlug}</div>
                  {offer.productName && <div style={{ color: "#9ca3af", fontSize: "12px" }}>{offer.productName}</div>}
                </td>
                <td style={cell}>{offerVendorLabel(offer)}</td>
                <td style={cell}>{total != null ? `₩${total.toLocaleString()}` : "—"}</td>
                <td style={cell}>{clicks ? `${clicks.clicks7d} / ${clicks.clicks30d}` : "0 / 0"}</td>
                <td style={cell}>{offer.active ? (offer.inStock ? "판매중" : "품절") : "비활성"}</td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>
                  <form action={toggleOffer} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={offer.id} />
                    <input type="hidden" name="active" value={String(offer.active)} />
                    <button type="submit" style={{ fontSize: "12px", marginRight: "6px", cursor: "pointer" }}>
                      {offer.active ? "비활성" : "활성"}
                    </button>
                  </form>
                  <form action={deleteOffer} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={offer.id} />
                    <button type="submit" style={{ fontSize: "12px", color: "#dc2626", cursor: "pointer" }}>삭제</button>
                  </form>
                </td>
              </tr>
            );
          })}
          {offerList.length === 0 && (
            <tr><td colSpan={6} style={{ ...cell, color: "#9ca3af" }}>등록된 오퍼가 없습니다. 위 폼에서 추가하세요.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
