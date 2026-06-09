interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'purple';
}

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  purple: 'bg-purple-50 text-purple-700',
};

export default function SummaryCard({ title, value, unit, color = 'emerald' }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${colorMap[color]} flex flex-col gap-1`}>
      <span className="text-xs opacity-70">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
