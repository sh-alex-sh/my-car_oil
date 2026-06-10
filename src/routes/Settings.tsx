import { db } from '../db';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useExport } from '../hooks/useExport';

export default function Settings() {
  const { exportToExcel } = useExport();

  const handleExport = async () => {
    const allRecords = await db.fuelRecords.toArray();
    if (allRecords.length === 0) {
      alert('暂无加油记录可导出');
      return;
    }
    exportToExcel(allRecords);
  };

  return (
    <div className="py-4 px-4 space-y-4">
      {/* 数据导出 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">数据管理</h3>
        </div>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">导出数据</p>
              <p className="text-xs text-gray-400">导出为 Excel 文件 (.xlsx)</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Phase 2 / 3 占位 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 opacity-50 pointer-events-none">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">更多功能</h3>
        </div>
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">保养提醒</p>
            <p className="text-xs text-gray-400">Phase 3 即将上线</p>
          </div>
        </div>
        <div className="px-4 py-4 flex items-center gap-3 border-t border-gray-50">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">统计图表</p>
            <p className="text-xs text-gray-400">Phase 2 即将上线</p>
          </div>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">关于</h3>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-900 font-medium">油耗记录</p>
          <p className="text-xs text-gray-400 mt-1">版本 0.1.0</p>
          <p className="text-xs text-gray-400 mt-2">
            纯本地存储，数据不上传服务器。<br />
            支持导出 Excel 备份数据。
          </p>
        </div>
      </div>
    </div>
  );
}
