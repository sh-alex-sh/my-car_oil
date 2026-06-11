import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { FuelRecord } from '../types';
import { formatDate } from '../utils/format';

export function useExport() {
  const exportToExcel = async (records: FuelRecord[], filename?: string) => {
    const data = records.map((r) => ({
      日期: formatDate(r.date),
      '里程 (km)': r.mileage,
      '加油量 (L)': r.fuelAmount,
      '金额 (¥)': Math.round(r.fuelCost * 100) / 100,
      '单价 (¥/L)': r.fuelPrice,
      油品标号: r.fuelGrade || '',
      是否加满: r.isFullTank ? '是' : '否',
      备注: r.note,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '加油记录');

    const outputFilename = filename || `油耗记录_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // 检测 Capacitor 原生环境（Capacitor 8 用 isNativePlatform）
    const cap = (window as any).Capacitor;
    const isNative = cap?.isNativePlatform?.() ?? false;

    if (isNative) {
      try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: false });
        const base64 = arrayBufferToBase64(wbout);
        const writeResult = await Filesystem.writeFile({
          path: outputFilename,
          data: base64,
          directory: Directory.Cache,
          recursive: true,
        });
        await Share.share({
          title: '油耗记录',
          text: '油耗记录 Excel',
          files: [writeResult.uri],
          dialogTitle: '导出',
        });
        return;
      } catch (e) {
        alert('导出失败: ' + String(e));
        return;
      }
    }

    // 浏览器环境回退
    XLSX.writeFile(wb, outputFilename);
  };

  return { exportToExcel };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
