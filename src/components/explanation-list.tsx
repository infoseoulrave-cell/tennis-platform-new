type ExplanationFragment = {
  type: "positive" | "tradeoff";
  textKo: string;
};

type ExplanationListProps = {
  fragments: ExplanationFragment[];
};

export function ExplanationList({ fragments }: ExplanationListProps) {
  if (fragments.length === 0) return null;

  return (
    <div className="space-y-2">
      {fragments.map((fragment, i) => (
        <div key={i} className="flex items-start gap-2 text-sm leading-relaxed">
          <span className="shrink-0 mt-0.5">
            {fragment.type === "positive" ? "✅" : "⚠️"}
          </span>
          <span
            className={
              fragment.type === "positive"
                ? "text-gray-900"
                : "text-amber-700"
            }
          >
            {fragment.textKo}
          </span>
        </div>
      ))}
    </div>
  );
}
