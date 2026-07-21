export function ScoringMethodologyNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-relaxed text-sky-950">
      <p className="font-semibold">RacketLab 스펙 추정 v2 · 검수 2026-07-21</p>
      <p className="mt-1">
        -5~+5는 실험실 절대 성능이나 선수 실력을 뜻하지 않습니다. 헤드 크기, 무게, 스윙웨이트,
        강성, 빔과 스트링 패턴 중 확인된 입력만 가중 재정규화한 비교용 추정치입니다.
      </p>
      {!compact && (
        <p className="mt-2 text-sky-900/75">
          스트링 종류·장력, 실제 트위스트웨이트, 제조 편차와 커스텀은 포함되지 않습니다.
          특히 편안함은 부상 안전성을 보증하지 않습니다.{" "}
          <a
            href="https://www.itftennis.com/media/2154/equipment-rackets.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            ITF 장비 자료
          </a>
          {" · "}
          <a
            href="https://doi.org/10.1299/jsmemecj.2017.j2350102"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            스트링 패턴 연구
          </a>
        </p>
      )}
    </aside>
  );
}
