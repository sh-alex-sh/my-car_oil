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

    // 本月统计
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthByDate = [...thisMonth].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      avgConsumption: consumptionCount > 0 ? totalConsumption / consumptionCount : null,
      totalCostThisMonth: thisMonth.reduce((sum, r) => sum + r.fuelCost, 0),
      totalDistanceThisMonth:
        thisMonthByDate.length >= 2
          ? thisMonthByDate[0].mileage - thisMonthByDate[thisMonthByDate.length - 1].mileage
          : 0,
      // 累计统计
      totalCost: records.reduce((sum, r) => sum + r.fuelCost, 0),
      totalDistance:
        records.length >= 2
          ? fullTankRecords[0].mileage - fullTankRecords[fullTankRecords.length - 1].mileage
          : 0,
      recordCount: records.length,
    };
  },
}));
