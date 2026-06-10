import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface GradeData {
  name: string;
  count: number;
}

interface FuelGradePieChartProps {
  data: GradeData[];
}

const COLORS: Record<string, string> = {
  '92#': '#10b981',
  '95#': '#3b82f6',
  '98#': '#f59e0b',
  '0#': '#6b7280',
};

function fallbackColor(name: string): string {
  return COLORS[name] || '#9ca3af';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const { name, count } = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <span className="text-gray-500">{name}</span>
      <span className="text-gray-700 font-medium ml-2">{count} 次</span>
    </div>
  );
};

const legendFormatter = (value: string, entry: any) => (
  <span className="text-xs text-gray-500">{value} ({entry.payload.count}次)</span>
);

export default function FuelGradePieChart({ data }: FuelGradePieChartProps) {
  // 只有 1 种油品时不显示（无意义饼图）
  if (data.length < 2) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">⛽ 油品分布</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="count"
            nameKey="name"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={fallbackColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={legendFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
