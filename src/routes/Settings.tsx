import { db } from '../db';
import { useExport } from '../hooks/useExport';
import { useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

export default function Settings() {
  const { exportToExcel } = useExport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const allRecords = await db.fuelRecords.toArray();
    if (allRecords.length === 0) {
      alert('暂无加油记录可导出');
      return;
    }
    exportToExcel(allRecords);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 读取文件
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        alert('未找到工作表');
        return;
      }
      const worksheet = workbook.Sheets[sheetName];
      // 先转成数组再预处理列名
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      if (rawRows.length < 2) {
        alert('文件内容为空或格式不正确');
        return;
      }

      // 第一行作为中文表头映射
      const headers = rawRows[0] as unknown as string[];
      // 中文 -> 英文字段映射
      const fieldMap: Record<string, string> = {
        '日期': 'date',
        '里程 (km)': 'mileage',
        '加油量 (L)': 'fuelAmount',
        '金额 (¥)': 'fuelCost',
        '单价 (¥/L)': 'fuelPrice',
        '油品标号': 'fuelGrade',
        '是否加满': 'isFullTank',
        '备注': 'note',
      };
      const colIndex: Record<string, number> = {};
      headers.forEach((h, idx) => {
        if (fieldMap[h]) {
          colIndex[fieldMap[h]] = idx;
        }
      });

      // 校验必填列
      if (!('date' in colIndex) || !('mileage' in colIndex) || !('fuelAmount' in colIndex) || !('fuelCost' in colIndex)) {
        alert('文件缺少必填列（日期、里程、加油量、金额）');
        return;
      }

      const dataRows = rawRows.slice(1);

      const records = dataRows
        .filter((row) => {
          // 跳过空行
          const dateVal = row[colIndex.date];
          return dateVal !== undefined && dateVal !== null && String(dateVal).trim() !== '';
        })
        .map((row) => {
          const rawDate = String(row[colIndex.date] ?? '');
          // 处理日期格式：Excel 可能返回数字（序列号）或字符串
          let dateStr: string;
          if (/^\d+$/.test(rawDate)) {
            // Excel 序列号转日期
            const excelEpoch = new Date(1899, 11, 30);
            const d = new Date(excelEpoch.getTime() + Number(rawDate) * 86400000);
            dateStr = d.toISOString().slice(0, 10);
          } else if (rawDate.includes('/')) {
            // 2025/1/1 格式
            const parts = rawDate.split('/');
            dateStr = `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
          } else if (rawDate.includes('-')) {
            dateStr = rawDate.slice(0, 10);
          } else {
            dateStr = rawDate;
          }

          const fuelCost = Number(row[colIndex.fuelCost]) || 0;
          const fuelAmount = Number(row[colIndex.fuelAmount]) || 0;
          const fuelPrice = colIndex.fuelPrice !== undefined
            ? (Number(row[colIndex.fuelPrice]) || 0)
            : (fuelAmount > 0 ? Math.round((fuelCost / fuelAmount) * 100) / 100 : 0);

          return {
            vehicleId: 1,
            date: dateStr,
            mileage: Number(row[colIndex.mileage]) || 0,
            fuelAmount,
            fuelCost,
            fuelPrice,
            fuelGrade: colIndex.fuelGrade !== undefined ? String(row[colIndex.fuelGrade] ?? '') : '',
            isFullTank: colIndex.isFullTank !== undefined
              ? (String(row[colIndex.isFullTank]).trim() === '是' || String(row[colIndex.isFullTank]).trim() === 'true')
              : true,
            note: colIndex.note !== undefined ? String(row[colIndex.note] ?? '') : '',
            createdAt: new Date().toISOString(),
          };
        });

      if (records.length === 0) {
        alert('没有可导入的有效记录');
        return;
      }

      const skipDuplicates = confirm(`检测到 ${records.length} 条记录，是否覆盖已存在的相同日期+里程的记录？（取消则跳过重复）`);

      let imported = 0;
      let skipped = 0;
      for (const record of records) {
        if (skipDuplicates) {
          // 先删除重复的再插入
          const existing = await db.fuelRecords
            .where('date').equals(record.date)
            .and((r) => r.mileage === record.mileage)
            .toArray();
          if (existing.length > 0) {
            await db.fuelRecords.bulkDelete(existing.map((r) => r.id!));
          }
          await db.fuelRecords.add(record);
          imported++;
        } else {
          const existing = await db.fuelRecords
            .where('date').equals(record.date)
            .and((r) => r.mileage === record.mileage)
            .count();
          if (existing === 0) {
            await db.fuelRecords.add(record);
            imported++;
          } else {
            skipped++;
          }
        }
      }

      alert(`导入完成：成功 ${imported} 条${skipped > 0 ? `，跳过重复 ${skipped} 条` : ''}。刷新页面可查看最新数据。`);
    } catch (err) {
      console.error('导入失败:', err);
      alert('导入失败，请检查文件格式是否正确');
    } finally {
      // 重置 input 以便重复导入同一文件
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="py-4 px-4 space-y-4">
      {/* 数据管理 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">数据管理</h3>
        </div>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors border-b border-gray-50"
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

        {/* 导入按钮 */}
        <button
          onClick={handleImportClick}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">导入数据</p>
              <p className="text-xs text-gray-400">从 Excel 文件导入 (.xlsx)</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
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
            支持导出/导入 Excel 备份数据。
          </p>
        </div>
      </div>
    </div>
  );
}
