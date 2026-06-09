import { useCallback, useEffect } from 'react';
import { useFuelStore } from '../stores/fuelStore';
import type { FuelRecordInput } from '../types';

export function useFuelRecords(vehicleId = 1) {
  const records = useFuelStore((s) => s.records);
  const isLoading = useFuelStore((s) => s.isLoading);
  const fetchRecords = useFuelStore((s) => s.fetchRecords);
  const addRecord = useFuelStore((s) => s.addRecord);
  const updateRecord = useFuelStore((s) => s.updateRecord);
  const deleteRecord = useFuelStore((s) => s.deleteRecord);
  const getStats = useFuelStore((s) => s.getStats);

  useEffect(() => {
    fetchRecords(vehicleId);
  }, [vehicleId, fetchRecords]);

  const refresh = useCallback(() => {
    return fetchRecords(vehicleId);
  }, [fetchRecords, vehicleId]);

  const add = useCallback(
    async (data: FuelRecordInput) => {
      return addRecord({ ...data, vehicleId });
    },
    [addRecord, vehicleId]
  );

  const update = useCallback(
    async (id: number, data: FuelRecordInput) => {
      return updateRecord(id, { ...data, vehicleId });
    },
    [updateRecord, vehicleId]
  );

  const stats = getStats(vehicleId);

  return {
    records,
    isLoading,
    stats,
    refresh,
    add,
    update,
    remove: deleteRecord,
  };
}
