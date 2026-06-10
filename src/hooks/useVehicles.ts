import { useCallback, useEffect, useRef } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import type { Vehicle } from '../types';

const VEHICLE_ID_KEY = 'activeVehicleId';

/** 从 localStorage 读取最后活跃的车辆 ID */
function getSavedVehicleId(): number | null {
  try {
    const raw = localStorage.getItem(VEHICLE_ID_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveVehicleId(id: number) {
  try {
    localStorage.setItem(VEHICLE_ID_KEY, String(id));
  } catch { /* ignore */ }
}

export function useVehicles() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const isLoading = useVehicleStore((s) => s.isLoading);
  const fetchVehicles = useVehicleStore((s) => s.fetchVehicles);
  const addVehicle = useVehicleStore((s) => s.addVehicle);
  const updateVehicle = useVehicleStore((s) => s.updateVehicle);
  const deleteVehicle = useVehicleStore((s) => s.deleteVehicle);
  const setActive = useVehicleStore((s) => s.setActive);
  const getActiveVehicle = useVehicleStore((s) => s.getActiveVehicle);
  const isInitialized = useRef(false);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // vehicles 加载完成后，恢复用户上次选择的活跃车辆
  useEffect(() => {
    if (isInitialized.current || vehicles.length === 0) return;
    isInitialized.current = true;

    const savedId = getSavedVehicleId();
    if (savedId && vehicles.some((v) => v.id === savedId)) {
      setActive(savedId);
    }
  }, [vehicles, setActive]);

  // 活跃车辆变化时持久化
  const activeVehicle = getActiveVehicle();
  useEffect(() => {
    if (activeVehicle?.id) {
      saveVehicleId(activeVehicle.id);
    }
  }, [activeVehicle?.id]);

  const refresh = useCallback(() => fetchVehicles(), [fetchVehicles]);

  const add = useCallback(
    async (data: Omit<Vehicle, 'id' | 'isActive'>) => {
      const id = await addVehicle(data);
      // 新车直接设为活跃
      await setActive(id);
      return id;
    },
    [addVehicle, setActive]
  );

  const update = useCallback(
    async (id: number, data: Omit<Vehicle, 'id' | 'isActive'>) => updateVehicle(id, data),
    [updateVehicle]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteVehicle(id);
      // 如果删除后还有车，激活第一辆
      const remaining = useVehicleStore.getState().vehicles.filter((v) => v.id !== id);
      if (remaining.length > 0 && remaining[0].id) {
        await setActive(remaining[0].id);
        saveVehicleId(remaining[0].id);
      }
    },
    [deleteVehicle, setActive]
  );

  const switchActive = useCallback(
    async (id: number) => {
      await setActive(id);
      saveVehicleId(id);
    },
    [setActive]
  );

  return {
    vehicles,
    isLoading,
    activeVehicle,
    refresh,
    add,
    update,
    remove,
    setActive: switchActive,
  };
}
