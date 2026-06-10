import Dexie, { type Table } from 'dexie';
import type { FuelRecord, Vehicle } from '../types';

export class CarOilDB extends Dexie {
  fuelRecords!: Table<FuelRecord, number>;
  vehicles!: Table<Vehicle, number>;

  constructor() {
    super('CarOilDB');
    this.version(1).stores({
      // ++id = 自增主键，vehicleId/date/mileage = 查询索引
      fuelRecords: '++id, vehicleId, date, mileage',
      vehicles: '++id',
    });
    // v2: 添加 fuelGrade 字段
    this.version(2).stores({
      fuelRecords: '++id, vehicleId, date, mileage, fuelGrade',
      vehicles: '++id',
    });
  }
}

export const db = new CarOilDB();
