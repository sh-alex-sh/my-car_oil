import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useVehicles } from '../hooks/useVehicles';
import RecordCard from '../components/records/RecordCard';
import FilterTabs from '../components/records/FilterTabs';
import EmptyState from '../components/records/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FilterPeriod } from '../components/records/FilterTabs';
import type { FuelRecord } from '../types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordList() {
  const navigate = useNavigate();
  const { activeVehicle } = useVehicles();
  const vehicleId = activeVehicle?.id ?? 1;
  const { records, remove } = useFuelRecords(vehicleId);
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);

  // 按时间筛选
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((r) => {
      const d = new Date(r.date);

      // 预设筛选
      if (filter === 'month')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === '3months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return d >= threeMonthsAgo;
      }

      // 自定义日期筛选
      if (filter === 'custom') {
        if (customStart && r.date < customStart) return false;
        if (customEnd && r.date > customEnd) return false;
      }

      return true;
    });
  }, [records, filter, customStart, customEnd]);

  // 按日期分组（同一天合并为一组）
  const groupedRecords = useMemo(() => {
    const groups: { date: string; records: FuelRecord[] }[] = [];
    for (const r of filteredRecords) {
      const last = groups[groups.length - 1];
      if (last && last.date === r.date) {
        last.records.push(r);
      } else {
        groups.push({ date: r.date, records: [r] });
      }
    }
    return groups;
  }, [filteredRecords]);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  const formatGroupDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`;
  };

  if (records.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <FilterTabs active={filter} onChange={(f) => {
        setFilter(f);
        if (f !== 'custom') { setCustomStart(''); setCustomEnd(''); }
      }} />

      {/* 自定义日期范围 */}
      {filter === 'custom' && (
        <div className="flex items-center gap-2 px-4 py-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            max={customEnd || todayStr()}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="开始日期"
          />
          <span className="text-gray-400 text-sm">至</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            min={customStart}
            max={todayStr()}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="结束日期"
          />
          {(customStart || customEnd) && (
            <button
              onClick={() => { setCustomStart(''); setCustomEnd(''); }}
              className="text-xs text-gray-400 active:text-gray-600 px-2 py-1"
            >
              清除
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <EmptyState message="该时间段内没有记录" showAction={false} />
        ) : (
          groupedRecords.map((group) => (
            <div key={group.date}>
              <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50/95 backdrop-blur-sm text-xs text-gray-500 font-medium">
                {formatGroupDate(group.date)}
              </div>
              <div className="bg-white mx-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3">
                {group.records.map((record) => {
                  const recordIndex = filteredRecords.indexOf(record);
                  const prev = filteredRecords[recordIndex + 1];
                  return (
                    <RecordCard
                      key={record.id}
                      record={record}
                      prevMileage={prev?.mileage}
                      prevIsFullTank={prev?.isFullTank}
                      onEdit={(r) => navigate(`/records/${r.id}`)}
                      onDelete={setDeleteTarget}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 p-4 pb-20">
        <button
          onClick={() => navigate('/records/new')}
          className="w-full py-3.5 bg-primary-600 text-white rounded-2xl font-medium text-lg
                     active:bg-primary-700 transition-colors shadow-lg shadow-primary-200
                     flex items-center justify-center gap-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新增记录
        </button>
      </div>

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
