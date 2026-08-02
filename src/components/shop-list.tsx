import { ShopContactLink } from "@/components/shop-contact-link";
import { getActiveShopsForRacket } from "@/lib/shops";

/**
 * 라켓 상세의 "취급 매장" 섹션 (서버 컴포넌트).
 * 등록된 매장이 없거나 DB 오류 시 아무것도 렌더하지 않는다 —
 * PriceComparison 과 같은 fail-closed 패턴이다.
 */
export async function ShopList({ racketModelId }: { racketModelId: string }) {
  const shops = await getActiveShopsForRacket(racketModelId).catch(() => []);
  if (shops.length === 0) return null;

  return (
    <section className="border border-[var(--color-border)] rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-1">취급 매장</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        매장 등록 여부는 라켓 점수와 추천 순위에 반영하지 않습니다. 재고와
        가격은 매장에 직접 확인하세요.
      </p>
      <ul className="divide-y divide-[var(--color-border)]">
        {shops.map((shop) => (
          <li key={shop.id} className="py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {shop.nameKo ?? shop.name}
                </span>
                {shop.forThisRacket && (
                  <span className="shrink-0 rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-[10px] font-semibold">
                    이 라켓 취급
                  </span>
                )}
              </div>
              {shop.location && (
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)] truncate">
                  {shop.location}
                </p>
              )}
              {shop.description && (
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                  {shop.description}
                </p>
              )}
            </div>
            {shop.contactUrl && (
              <ShopContactLink shopId={shop.id} href={shop.contactUrl}>
                연락·위치
              </ShopContactLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
