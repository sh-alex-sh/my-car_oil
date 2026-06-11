import { useMemo } from 'react';
import type { FuelRecord, TrendPoint, MonthlySummary } from '../types';
import { calcFuelConsumption } from '../utils/calculation';

export function useStatsData(records: FuelRecord[]) {
  /** 油耗趋势数据 — 按日期升序 */
  const trendData = useMemo<TrendPoint[]>(() => {
    const sorted = [...records]
      .filter((r) => r.isFullTank)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.map((record, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      const consumption =
        prev
          ? calcFuelConsumption(record.fuelAmount, prev.mileage, record.mileage)
          : null;

      return {
        date: record.date,
        label: `${new Date(record.date).getMonth() + 1}/${new Date(record.date).getDate()}`,
        mileage: record.mileage,
        consumption,
        isFullTank: record.isFullTank,
        fuelAmount: record.fuelAmount,
        fuelCost: record.fuelCost,
      };
    });
  }, [records]);

  /** 月度汇总数据 — 按 YYYY-MM 分组聚合，里程跨月结转 */
  const monthlyData = useMemo<MonthlySummary[]>(() => {
    const map = new Map<string, FuelRecord[]>();
    for (const r of records) {
      const month = r.date.slice(0, 7); // "2026-06"
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(r);
    }

    const months = Array.from(map.keys()).sort(); // 升序
    if (months.length === 0) return [];

    // 预计算每个月份的最大里程和最小里程
    const monthStats = new Map<string, { max: number; min: number }>();
    for (const month of months) {
      const items = map.get(month)!;
      monthStats.set(month, {
        max: Math.max(...items.map((r) => r.mileage)),
        min: Math.min(...items.map((r) => r.mileage)),
      });
    }

    return months.map((month, i) => {
      const items = map.get(month)!;
      const { max: endMileage } = monthStats.get(month)!;
      // 起始里程取上月最大里程（跨月结转），首个有数据的月份用当前月最小里程
      const startMileage =
        i > 0
          ? monthStats.get(months[i - 1])!.max
          : monthStats.get(month)!.min;
      const distance = endMileage > startMileage ? endMileage - startMileage : 0;

      const d = new Date(month + '-01');
      return {
        month,
        label: `${d.getFullYear()}/${d.getMonth() + 1}`,
        totalFuelCost: items.reduce((s, r) => s + r.fuelCost, 0),
        totalDistance: distance,
        recordCount: items.length,
      };
    });
  }, [records]);

  /** 油品分布 — 按 fuelGrade 分组计数 */
  const gradeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const grade = r.fuelGrade || '未知';
      map.set(grade, (map.get(grade) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  return { trendData, monthlyData, gradeDistribution };
}
