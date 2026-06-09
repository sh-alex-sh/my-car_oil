import type { FuelRecordInput } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRecord(
  data: FuelRecordInput,
  lastMileage?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.date) {
    errors.push({ field: 'date', message: '请选择日期' });
  }

  if (!data.mileage || data.mileage <= 0) {
    errors.push({ field: 'mileage', message: '请输入有效里程数' });
  } else if (lastMileage !== undefined && data.mileage <= lastMileage) {
    errors.push({
      field: 'mileage',
      message: `里程数不能低于上次的 ${lastMileage} km`,
    });
  }

  if (!data.fuelAmount || data.fuelAmount <= 0) {
    errors.push({ field: 'fuelAmount', message: '请输入加油量' });
  }

  if (!data.fuelCost || data.fuelCost <= 0) {
    errors.push({ field: 'fuelCost', message: '请输入加油金额' });
  }

  return errors;
}
