import { create } from 'zustand';
import { db } from '../db';
import type { Vehicle } from '../types';

interface VehicleStore {
  vehicles: Vehicle[];
  isLoading: boolean;

  fetchVehicles: () => Promise<void>;
  addVehicle: (data: Omit<Vehicle, 'id' | 'isActive'>) => Promise<number>;
  updateVehicle: (id: number, data: Omit<Vehicle, 'id' | 'isActive'>) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
  setActive: (id: number) => Promise<void>;
  getActiveVehicle: () => Vehicle | undefined;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  isLoading: false,

  fetchVehicles: async () => {
    set({ isLoading: true });
    const vehicles = await db.vehicles.toArray();
    set({ vehicles, isLoading: false });
  },

  addVehicle: async (data) => {
    const vehicle: Vehicle = {
      ...data,
      isActive: get().vehicles.length === 0, // 第一辆车默认活跃
    };
    const id = await db.vehicles.add(vehicle);
    await get().fetchVehicles();
    return id as number;
  },

  updateVehicle: async (id, data) => {
    const existing = await db.vehicles.get(id);
    if (!existing) throw new Error('车辆不存在');
    await db.vehicles.update(id, { ...data, isActive: existing.isActive });
    await get().fetchVehicles();
  },

  deleteVehicle: async (id) => {
    // 删除车辆时，同时删除该车所有加油记录
    await db.fuelRecords.where('vehicleId').equals(id).delete();
    await db.vehicles.delete(id);
    // 如果删除的是活跃车辆，激活第一辆
    const state = get();
    if (state.vehicles.find((v) => v.id === id)?.isActive) {
      const remaining = state.vehicles.filter((v) => v.id !== id);
      if (remaining.length > 0 && remaining[0].id) {
        await db.vehicles.update(remaining[0].id, { isActive: true });
      }
    }
    await get().fetchVehicles();
  },

  setActive: async (id) => {
    const state = get();
    // 先把所有车设为非活跃
    for (const v of state.vehicles) {
      if (v.id) await db.vehicles.update(v.id, { isActive: false });
    }
    // 激活目标车辆
    await db.vehicles.update(id, { isActive: true });
    await get().fetchVehicles();
  },

  getActiveVehicle: () => {
    return get().vehicles.find((v) => v.isActive) ?? get().vehicles[0];
  },
}));
