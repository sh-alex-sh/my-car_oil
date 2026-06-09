import * as XLSX from 'xlsx';
import type { FuelRecord } from '../types';
import { formatDate } from '../utils/format';

export function useExport() {
  const exportToExcel = (records: FuelRecord[], filename?: string) => {
    const data = records.map((r) => ({
      日期: formatDate(r.date),
      '里程 (km)': r.mileage,
      '加油量 (L)': r.fuelAmount,
      '金额 (¥)': Math.round(r.fuelCost * 100) / 100,
      '单价 (¥/L)': r.fuelPrice,
      是否加满: r.isFullTank ? '是' : '否',
      备注: r.note,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '加油记录');
    XLSX.writeFile(wb, filename || `油耗记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return { exportToExcel };
}
