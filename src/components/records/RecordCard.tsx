import { useState, useRef } from 'react';
import type { FuelRecord } from '../../types';
import { formatDateShort, formatDayOfWeek, formatMoney, formatConsumption } from '../../utils/format';
import { calcFuelConsumption } from '../../utils/calculation';

interface RecordCardProps {
  record: FuelRecord;
  prevMileage?: number;
  prevIsFullTank?: boolean;
  onEdit: (record: FuelRecord) => void;
  onDelete: (record: FuelRecord) => void;
  readonly?: boolean;
}

export default function RecordCard({ record, prevMileage, prevIsFullTank, onEdit, onDelete, readonly }: RecordCardProps) {
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const consumption =
    record.isFullTank && prevMileage && prevIsFullTank
      ? calcFuelConsumption(record.fuelAmount, prevMileage, record.mileage)
      : null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setSwiped(dx < 0);
    }
  };

  return (
    <div className="relative">
      {/* 左滑露出操作按钮 */}
      <div className="absolute right-0 top-0 bottom-0 flex z-0">
        <button
          onClick={() => { onEdit(record); setSwiped(false); }}
          className="w-16 h-full bg-primary-500 text-white flex items-center justify-center active:bg-primary-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => { onDelete(record); setSwiped(false); }}
          className="w-16 h-full bg-red-500 text-white flex items-center justify-center active:bg-red-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      {/* 卡片主体 */}
      <div
        className={`relative bg-white border-b border-gray-50 px-3 py-2.5 transition-transform duration-200 z-10 ${
          swiped ? '-translate-x-32' : 'translate-x-0'
        }`}
        onTouchStart={!readonly ? onTouchStart : undefined}
        onTouchEnd={!readonly ? onTouchEnd : undefined}
        onClick={() => {
          if (readonly) return;
          swiped ? setSwiped(false) : onEdit(record);
        }}
      >
        <div className="flex justify-between items-start gap-1 flex-nowrap">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap shrink-0">
                {formatDateShort(record.date)}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formatDayOfWeek(record.date)}</span>
              {record.fuelGrade && (
                <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-[11px] leading-none shrink-0">{record.fuelGrade}</span>
              )}
              {record.isFullTank && (
                <span className="bg-green-50 text-green-600 px-1 py-0.5 rounded text-[11px] leading-none shrink-0">加满</span>
              )}
            </div>
            {record.note && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{record.note}</p>
            )}
          </div>
          <div className="text-right shrink-0 basis-auto">
            <div className="text-sm text-gray-900 font-medium whitespace-nowrap">
              {record.fuelAmount}L · {formatMoney(record.fuelCost)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
              {record.mileage.toLocaleString()} km
            </div>
          </div>
          {!readonly && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(record); }}
              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 active:bg-red-50 rounded-lg transition-colors shrink-0 self-start"
              title="删除"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
        {consumption !== null && (
          <div className="mt-1 text-xs text-primary-600 font-medium">
            油耗: {formatConsumption(consumption)}
          </div>
        )}
      </div>
    </div>
  );
}
