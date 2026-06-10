import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Vehicle } from '../types';

export default function Vehicles() {
  const navigate = useNavigate();
  const { vehicles, remove, setActive } = useVehicles();
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  const handleSetActive = useCallback(
    async (vehicleId: number) => {
      await setActive(vehicleId);
    },
    [setActive]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-30">
              <path d="M5 17h14v-5H5v5zm11.5-8.5l1.5 3.5H6l1.5-3.5h9z" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
            </svg>
            <p className="text-sm">还没有添加车辆</p>
            <button
              onClick={() => navigate('/vehicles/new')}
              className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-full text-sm font-medium active:bg-primary-700 transition-colors"
            >
              添加第一辆车
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 space-y-2">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-colors ${
                  v.isActive ? 'border-primary-400 bg-primary-50/50' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{v.name}</h3>
                      {v.isActive && (
                        <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">当前</span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {(v.brand || v.model) && (
                        <p className="text-sm text-gray-600">
                          {[v.brand, v.model].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {v.plateNumber && (
                        <p className="text-xs text-gray-400 font-mono">{v.plateNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {!v.isActive && (
                      <button
                        onClick={() => v.id && handleSetActive(v.id)}
                        className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg active:bg-primary-100 transition-colors"
                      >
                        设为当前
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg active:bg-gray-100"
                      title="编辑"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(v)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg active:bg-gray-100"
                      title="删除"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="shrink-0 p-4 pb-20">
        <button
          onClick={() => navigate('/vehicles/new')}
          className="w-full py-3.5 bg-primary-600 text-white rounded-2xl font-medium text-lg
                     active:bg-primary-700 transition-colors shadow-lg shadow-primary-200
                     flex items-center justify-center gap-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加车辆
        </button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除车辆"
        message={`确定删除「${deleteTarget?.name}」吗？该车的所有加油记录也会一并删除，且无法恢复。`}
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
