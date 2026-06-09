/** 计算油价单价 元/L，保留两位小数 */
export function calcFuelPrice(cost: number, amount: number): number {
  if (amount <= 0) return 0;
  return Math.round((cost / amount) * 100) / 100;
}

/** 计算油耗 L/100km，返回 null 表示无法计算 */
export function calcFuelConsumption(
  fuelAmount: number,
  prevMileage: number,
  currMileage: number
): number | null {
  const distance = currMileage - prevMileage;
  if (distance <= 0) return null;
  // 保留一位小数
  return Math.round((fuelAmount / distance) * 100 * 10) / 10;
}
