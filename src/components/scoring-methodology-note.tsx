export function ScoringMethodologyNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-relaxed text-sky-950">
      <p className="font-semibold">스펙 기반 비교 추정치</p>
      <p className="mt-1">
        공개 점수는 10~15 범위입니다. 제조사 공개 비스트링(unstrung) 정적
        스펙을 기준으로, 가능한 경우 제조사와 별개의 리테일러가 공개한
        스트링 장착(strung) 스윙웨이트(SW)·강성(RA) 측정을 보완합니다.
      </p>
      {!compact && (
        <p className="mt-2 text-sky-900/75">
          선수의 스윙, 스트링 종류·장력, 제조 품질 관리(QC)와 개체 편차에
          따라 실제 느낌은 달라질 수 있습니다. 절대적인 품질 등급이나
          의료·부상 안전 지표가 아닙니다.{" "}
          <a
            href="https://twu.tennis-warehouse.com/learning_center/racquetanalyzerTWU.php?brand=Wilson"
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
