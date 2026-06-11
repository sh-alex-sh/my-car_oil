import { create } from 'zustand';
import { db } from '../db';
import type { FuelRecord, FuelRecordInput, FuelStats } from '../types';
import { calcFuelPrice, calcFuelConsumption } from '../utils/calculation';

interface FuelStore {
  records: FuelRecord[];
  isLoading: boolean;

  fetchRecords: (vehicleId?: number) => Promise<void>;
  addRecord: (data: FuelRecordInput) => Promise<number>;
  updateRecord: (id: number, data: FuelRecordInput) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getStats: (vehicleId?: number) => FuelStats;
}

export const useFuelStore = create<FuelStore>((set, get) => ({
  records: [],
  isLoading: false,

  fetchRecords: async (vehicleId = 1) => {
    set({ isLoading: true });
    const records = await db.fuelRecords
      .where('vehicleId')
      .equals(vehicleId)
      .reverse()
      .sortBy('date');
    set({ records, isLoading: false });
  },

  addRecord: async (data) => {
    const record: FuelRecord = {
      ...data,
      fuelPrice: calcFuelPrice(data.fuelCost, data.fuelAmount),
      createdAt: new Date().toISOString(),
    };
    const id = await db.fuelRecords.add(record);
    await get().fetchRecords(data.vehicleId);
    return id as number;
  },

  updateRecord: async (id, data) => {
    const existing = await db.fuelRecords.get(id);
    if (!existing) throw new Error('记录不存在');
    const record: FuelRecord = {
      ...data,
      fuelPrice: calcFuelPrice(data.fuelCost, data.fuelAmount),
      createdAt: existing.createdAt,
    };
    await db.fuelRecords.update(id, record);
    await get().fetchRecords(data.vehicleId);
  },

  deleteRecord: async (id) => {
    const record = await db.fuelRecords.get(id);
    await db.fuelRecords.delete(id);
    await get().fetchRecords(record?.vehicleId ?? 1);
  },

  getStats: (vehicleId = 1) => {
    const records = get().records.filter((r) => r.vehicleId === vehicleId);
    const fullTankRecords = records
      .filter((r) => r.isFullTank)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 计算平均油耗（加满法）
    let totalConsumption = 0;
    let consumptionCount = 0;
    for (let i = 0; i < fullTankRecords.length - 1; i++) {
      const newer = fullTankRecords[i];
      const older = fullTankRecords[i + 1];
      const consumption = calcFuelConsumption(newer.fuelAmount, older.mileage, newer.mileage);
      if (consumption !== null) {
        totalConsumption += consumption;
        consumptionCount++;
      }
    }

    // 本月统计：本月最大里程 - 上月最大里程（跨月结转）
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const allByMileage = [...records].sort((a, b) => b.mileage - a.mileage);
    const thisMonthMax = allByMileage.find((r) => r.date.startsWith(thisMonthStr))?.mileage;
    // 上月最大里程：优先从上月记录中找，没找到则取本月最小里程之前的最大里程
    let lastMonthMax = allByMileage.find((r) => r.date.startsWith(lastMonthStr))?.mileage;
    if (lastMonthMax === undefined && thisMonthMax !== undefined) {
      // 历史无上月记录时，取本月里程最小值（兼容初次使用及跨月无记录）
      lastMonthMax = Math.min(
        ...records
          .filter((r) => r.date.startsWith(thisMonthStr))
          .map((r) => r.mileage)
      );
    }
    const totalDistanceThisMonth =
      thisMonthMax !== undefined && lastMonthMax !== undefined && thisMonthMax > lastMonthMax
        ? thisMonthMax - lastMonthMax
        : 0;

    // 累计统计（基于全部记录）
    return {
      avgConsumption: consumptionCount > 0 ? totalConsumption / consumptionCount : null,
      avgCostPerKm:
        allByMileage.length >= 2 && allByMileage[0].mileage > allByMileage[allByMileage.length - 1].mileage
          ? records.reduce((sum, r) => sum + r.fuelCost, 0) /
            (allByMileage[0].mileage - allByMileage[allByMileage.length - 1].mileage)
          : null,
      totalDistanceThisMonth,
      totalCost: records.reduce((sum, r) => sum + r.fuelCost, 0),
      totalDistance:
        allByMileage.length >= 2
          ? allByMileage[0].mileage - allByMileage[allByMileage.length - 1].mileage
          : 0,
      recordCount: records.length,
    };
  },
}));
