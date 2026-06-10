import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { MonthlySummary } from '../../types';

interface MonthlySummaryChartProps {
  data: MonthlySummary[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload as MonthlySummary;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-gray-700">
        油费: <span className="font-semibold text-emerald-600">¥{p.totalFuelCost.toFixed(0)}</span>
      </p>
      <p className="text-gray-700">
        里程: <span className="font-semibold text-blue-600">{p.totalDistance} km</span>
      </p>
      <p className="text-gray-400 mt-0.5">{p.recordCount} 条记录</p>
    </div>
  );
};

const legendFormatter = (value: string) => (
  <span className="text-xs text-gray-500">{value === 'totalFuelCost' ? '油费' : '里程'}</span>
);

export default function MonthlySummaryChart({ data }: MonthlySummaryChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">📊 月度汇总</h3>
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          暂无月度汇总数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">📊 月度汇总</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Legend formatter={legendFormatter} />
          <Bar
            yAxisId="left"
            dataKey="totalFuelCost"
            name="totalFuelCost"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            yAxisId="right"
            dataKey="totalDistance"
            name="totalDistance"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
