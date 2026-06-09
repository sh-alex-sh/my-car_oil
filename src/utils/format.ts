/** 完整日期：2026-06-09 */
export function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 短日期：06-09 */
export function formatDateShort(isoStr: string): string {
  const d = new Date(isoStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 周几 */
export function formatDayOfWeek(isoStr: string): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[new Date(isoStr).getDay()];
}

/** 金额：¥420.00 */
export function formatMoney(yuan: number): string {
  return `¥${yuan.toFixed(2)}`;
}

/** 油耗：7.1 L/100km */
export function formatConsumption(lPer100km: number): string {
  return `${lPer100km.toFixed(1)} L/100km`;
}
