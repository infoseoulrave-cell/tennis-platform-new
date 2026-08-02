const TWU_ANALYZER = "https://twu.tennis-warehouse.com/learning_center/racquetanalyzerTWU.php";

/**
 * TWU 분석기 주소. 브랜드를 알면 그 브랜드로 열고, 모르면 파라미터 없이 연다.
 *
 * 예전에는 `?brand=Wilson` 이 박혀 있어 Babolat 상세에서도 Wilson 목록으로
 * 갔다. 비교 화면처럼 여러 브랜드가 섞인 곳에서는 한쪽을 고르는 것이 오히려
 * 틀리므로 파라미터를 붙이지 않는다.
 */
export function twuAnalyzerUrl(brand?: string | null): string {
  const trimmed = brand?.trim();
  return trimmed
    ? `${TWU_ANALYZER}?brand=${encodeURIComponent(trimmed)}`
    : TWU_ANALYZER;
}

export function ScoringMethodologyNote({
  compact = false,
  brand,
}: {
  compact?: boolean;
  /** 라켓 상세처럼 브랜드가 하나로 정해지는 화면에서만 넘긴다. */
  brand?: string | null;
}) {
  return (
    <aside className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-relaxed text-sky-950">
      <p className="font-semibold">스펙 기반 비교 추정치</p>
      <p className="mt-1">
        공개 점수는 각 축 0~5의 정수이며, 다섯 축 합계는 정확히 10~15
        범위입니다. 제조사 공개 비스트링(unstrung) 정적 스펙을 기준으로,
        가능한 경우 제조사와 별개의 리테일러가 공개한 스트링 장착(strung)
        스윙웨이트(SW)·강성(RA) 측정을 보완합니다.
      </p>
      {!compact && (
        <p className="mt-2 text-sky-900/75">
          선수의 스윙, 스트링 종류·장력, 제조 품질 관리(QC)와 개체 편차에
          따라 실제 느낌은 달라질 수 있습니다. 절대적인 품질 등급이나
          의료·부상 안전 지표가 아닙니다.{" "}
          <a
            href={twuAnalyzerUrl(brand)}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            TWU 라켓 분석
          </a>
          {" · "}
          <a
            href="https://www.itftennis.com/media/2154/equipment-rackets.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            ITF 장비 자료
          </a>
        </p>
      )}
    </aside>
  );
}
