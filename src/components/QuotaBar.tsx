interface QuotaBarProps {
  current: number;
  max: number;
}

export function QuotaBar({ current, max }: QuotaBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  // Color thresholds: green (0-60%), orange (60-85%), red (85-100%)
  const getBarColor = () => {
    if (percentage >= 85) return "bg-error";
    if (percentage >= 60) return "bg-warning";
    return "bg-success";
  };

  const getTextColor = () => {
    if (percentage >= 85) return "text-error";
    if (percentage >= 60) return "text-warning";
    return "text-success";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-2 bg-bg-dark rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {current} / {max}
      </span>
    </div>
  );
}
