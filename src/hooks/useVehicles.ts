import { useCallback, useEffect } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import type { Vehicle } from '../types';

export function useVehicles() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const isLoading = useVehicleStore((s) => s.isLoading);
  const fetchVehicles = useVehicleStore((s) => s.fetchVehicles);
  const addVehicle = useVehicleStore((s) => s.addVehicle);
  const updateVehicle = useVehicleStore((s) => s.updateVehicle);
  const deleteVehicle = useVehicleStore((s) => s.deleteVehicle);
  const setActive = useVehicleStore((s) => s.setActive);
  const getActiveVehicle = useVehicleStore((s) => s.getActiveVehicle);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const refresh = useCallback(() => fetchVehicles(), [fetchVehicles]);
  const activeVehicle = getActiveVehicle();

  const add = useCallback(
    async (data: Omit<Vehicle, 'id' | 'isActive'>) => addVehicle(data),
    [addVehicle]
  );

  const update = useCallback(
    async (id: number, data: Omit<Vehicle, 'id' | 'isActive'>) => updateVehicle(id, data),
    [updateVehicle]
  );

  return {
    vehicles,
    isLoading,
    activeVehicle,
    refresh,
    add,
    update,
    remove: deleteVehicle,
    setActive,
  };
}
