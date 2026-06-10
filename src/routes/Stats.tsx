import { useState, useMemo } from 'react';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useVehicles } from '../hooks/useVehicles';
import { useStatsData } from '../hooks/useStatsData';
import FuelTrendChart from '../components/stats/FuelTrendChart';
import MonthlySummaryChart from '../components/stats/MonthlySummaryChart';
import FuelGradePieChart from '../components/stats/FuelGradePieChart';
import EmptyState from '../components/records/EmptyState';

export default function Stats() {
  const { activeVehicle } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const vehicleId = selectedVehicleId ?? activeVehicle?.id ?? 1;

  const { records } = useFuelRecords(vehicleId);
  const { activeVehicle: currentActive, vehicles } = useVehicles();
  const { trendData, monthlyData, gradeDistribution } = useStatsData(records);

  // 列表显示的车辆：当前活跃车放第一个
  const displayVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    const active = vehicles.find((v) => v.isActive);
    const rest = vehicles.filter((v) => !v.isActive);
    return active ? [active, ...rest] : vehicles;
  }, [vehicles]);

  // 确认当前选中的 vehicleId 有效
  const currentVehicleName =
    vehicles.find((v) => v.id === vehicleId)?.name || '车辆';

  if (records.length === 0) {
    return (
      <div className="h-full">
        <EmptyState message="还没有加油数据，开始记录吧" showAction />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-16">
        {/* 车辆选择器 */}
        {vehicles.length >= 2 && (
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {displayVehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id!)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  vehicleId === v.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* 单车辆：显示名称 */}
        {vehicles.length < 2 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h14v-5H5v5zm11.5-8.5l1.5 3.5H6l1.5-3.5h9z" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
            </svg>
            <span className="font-medium">{currentVehicleName}</span>
          </div>
        )}

        {/* 油耗趋势折线图 */}
        <FuelTrendChart data={trendData} />

        {/* 月度汇总柱状图 */}
        <MonthlySummaryChart data={monthlyData} />

        {/* 油品分布饼图 */}
        <FuelGradePieChart data={gradeDistribution} />
      </div>
    </div>
  );
}
