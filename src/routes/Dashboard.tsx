import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useVehicles } from '../hooks/useVehicles';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentRecords from '../components/dashboard/RecentRecords';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FuelRecord } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeVehicle } = useVehicles();
  const vehicleId = activeVehicle?.id ?? 1;
  const { records, stats, remove } = useFuelRecords(vehicleId);
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  return (
    <div className="py-4">
      {/* 当前车辆标识 */}
      {activeVehicle ? (
        <div className="px-4 mb-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-1.5 text-sm text-gray-500 active:text-primary-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h14v-5H5v5zm11.5-8.5l1.5 3.5H6l1.5-3.5h9z" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
            </svg>
            <span>{activeVehicle.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="px-4 mb-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="w-full py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium active:bg-amber-100 transition-colors"
          >
            ⚠️ 请先添加一辆车，才能记录加油数据
          </button>
        </div>
      )}

      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <SummaryCard
          title="平均油耗"
          value={stats.avgConsumption !== null ? stats.avgConsumption.toFixed(1) : '--'}
          unit="L/100km"
          color="emerald"
        />
        <SummaryCard
          title="平均油费"
          value={stats.avgCostPerKm !== null ? stats.avgCostPerKm.toFixed(2) : '--'}
          unit="元/km"
          color="blue"
        />
        <SummaryCard
          title="本月行驶"
          value={`${stats.totalDistanceThisMonth}`}
          unit="km"
          color="amber"
        />
        <SummaryCard
          title="累计油费"
          value={`¥${stats.totalCost.toFixed(0)}`}
          color="purple"
        />
        <SummaryCard
          title="累计里程"
          value={`${stats.totalDistance}`}
          unit="km"
          color="emerald"
        />
        <SummaryCard
          title="累计记录"
          value={`${stats.recordCount}`}
          unit="条"
          color="blue"
        />
      </div>

      {/* 最近记录 */}
      <RecentRecords
        records={records}
        onEdit={(r) => navigate(`/records/${r.id}`)}
        onDelete={setDeleteTarget}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除记录"
        message={`确定删除 ${deleteTarget?.date || ''} 的这条加油记录吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
