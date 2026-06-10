import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TrendPoint } from '../../types';
import { formatDateShort } from '../../utils/format';

interface FuelTrendChartProps {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const p = payload[0].payload as TrendPoint;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="text-gray-500">{p.label}</p>
      <p className="text-gray-700 mt-0.5">
        里程: <span className="font-medium">{p.mileage.toLocaleString()} km</span>
      </p>
      {p.consumption !== null ? (
        <p className="text-primary-600 font-semibold mt-0.5">
          油耗: {p.consumption.toFixed(1)} L/100km
        </p>
      ) : (
        <p className="text-gray-400 mt-0.5">需两条加满记录</p>
      )}
    </div>
  );
};

export default function FuelTrendChart({ data }: FuelTrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">📈 油耗趋势 (L/100km)</h3>
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          至少需要 2 条加满记录才能绘制趋势图
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">📈 油耗趋势 (L/100km)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            unit=" L"
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="consumption"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#059669', strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
