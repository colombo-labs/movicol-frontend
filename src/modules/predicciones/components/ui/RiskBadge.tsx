const colors: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

interface RiskBadgeProps {
  level: string;
}

/**
 * UI: Badge de nivel de riesgo con color.
 */
export function RiskBadge({ level }: RiskBadgeProps) {
  return <span className={`text-xs font-bold uppercase ${colors[level] || 'text-default-400'}`}>{level}</span>;
}
