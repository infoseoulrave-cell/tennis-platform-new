import {
  getActiveOffersForRacket,
  lowestPriceOfferId,
  offerVendorLabel,
  totalPrice,
} from "@/lib/offers";

function formatKrw(value: number): string {
  return `₩${value.toLocaleString()}`;
}

/**
 * 판매처별 가격 비교 위젯 (서버 컴포넌트).
 * 오퍼가 없거나 DB 오류 시 아무것도 렌더하지 않는다.
 */
export async function PriceComparison({ slug }: { slug: string }) {
  const offerList = await getActiveOffersForRacket(slug).catch(() => []);
  if (offerList.length === 0) return null;

  const lowestId = lowestPriceOfferId(offerList);

  return (
    <section className="border border-[var(--color-border)] rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-1">판매처별 가격 비교</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        일부 링크는 제휴 링크로, 구매 시 운영에 소정의 수수료가 지원됩니다.
        가격·재고는 수시로 변동되며 추천 점수에는 반영되지 않습니다.
      </p>
      <ul className="divide-y divide-[var(--color-border)]">
        {offerList.map((offer) => {
          const total = totalPrice(offer);
          const isLowest = offer.id === lowestId;
          return (
            <li key={offer.id} className="py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {offerVendorLabel(offer)}
                  </span>
                  {isLowest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      최저가
                    </span>
                  )}
                  {!offer.inStock && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      품절
                    </span>
                  )}
                </div>
                {offer.productName && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                    {offer.productName}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">
                  {total != null ? formatKrw(total) : "가격 확인"}
                </p>
                {offer.shippingFeeKrw != null && offer.priceKrw != null && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {offer.shippingFeeKrw === 0
                      ? "배송비 무료"
                      : `배송비 ${formatKrw(offer.shippingFeeKrw)} 포함`}
                  </p>
                )}
              </div>
              <a
                href={`/go/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-85 transition-opacity"
              >
                구매하기
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
