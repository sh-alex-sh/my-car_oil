import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentRecords from '../components/dashboard/RecentRecords';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FuelRecord } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { records, stats, remove } = useFuelRecords(1);
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  return (
    <div className="py-4">
      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <SummaryCard
          title="平均油耗"
          value={stats.avgConsumption !== null ? stats.avgConsumption.toFixed(1) : '--'}
          unit="L/100km"
          color="emerald"
        />
        <SummaryCard
          title="本月油费"
          value={`¥${stats.totalCostThisMonth.toFixed(0)}`}
          color="blue"
        />
        <SummaryCard
          title="本月行驶"
          value={`${stats.totalDistanceThisMonth}`}
          unit="km"
          color="amber"
        />
        <SummaryCard
          title="累计记录"
          value={`${stats.recordCount}`}
          unit="条"
          color="purple"
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
