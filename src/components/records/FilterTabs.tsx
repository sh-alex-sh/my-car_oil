export type FilterPeriod = 'all' | 'month' | '3months';

interface FilterTabsProps {
  active: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
}

const TABS: { key: FilterPeriod; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: '3months', label: '近3月' },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === key
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-500 active:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
