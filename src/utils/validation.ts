import type { FuelRecordInput } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/** 表单校验。lastMileage 是同日期或最近日期之前的里程，用于正向补录时校验 */
export function validateRecord(
  data: FuelRecordInput,
  nextMileage?: number   // 紧挨着本条之后的记录里程（时间上稍晚的）
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.date) {
    errors.push({ field: 'date', message: '请选择日期' });
  }

  if (!data.mileage || data.mileage <= 0) {
    errors.push({ field: 'mileage', message: '请输入有效里程数' });
  } else if (nextMileage !== undefined && data.mileage > nextMileage) {
    errors.push({
      field: 'mileage',
      message: `补录里程不能高于后续记录的 ${nextMileage} km`,
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
