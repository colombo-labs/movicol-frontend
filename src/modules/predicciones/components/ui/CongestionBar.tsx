interface CongestionBarProps {
  value: number; // 0 to 1
}

/**
 * UI: Barra de congestión con color dinámico.
 */
export function CongestionBar({ value }: CongestionBarProps) {
  const color = value > 0.7 ? 'bg-red-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full h-2 rounded-full bg-white/10">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
}
