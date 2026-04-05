type TrustBadgeProps = {
  variant: "neutrality" | "confidence-high" | "confidence-medium" | "confidence-exploratory";
};

const config = {
  neutrality: {
    label: "광고 없는 AI 진단",
    icon: "🛡️",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  "confidence-high": {
    label: "높은 신뢰도",
    icon: "✅",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "confidence-medium": {
    label: "보통 신뢰도",
    icon: "🔵",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  "confidence-exploratory": {
    label: "탐색적 추천",
    icon: "🔍",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

export function TrustBadge({ variant }: TrustBadgeProps) {
  const c = config[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${c.className}`}
    >
      {c.icon} {c.label}
    </span>
  );
}
