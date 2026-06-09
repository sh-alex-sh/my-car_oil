import { db } from './index';

/** 首次启动时插入种子数据，方便开发验证 */
export async function seedIfEmpty() {
  const count = await db.fuelRecords.count();
  if (count > 0) return;

  const now = new Date();

  // 创建一辆默认车
  await db.vehicles.add({
    name: '我的爱车',
    brand: '',
    model: '',
    plateNumber: '',
    isActive: true,
  });

  // 创建约 2 个月的加油记录
  const records = [
    { daysAgo: 60, mileage: 10800, fuelAmount: 50, fuelCost: 410, note: '中石化·城北加油站 92#' },
    { daysAgo: 53, mileage: 11350, fuelAmount: 48, fuelCost: 393.6, note: '中石油·二环路站 92#' },
    { daysAgo: 45, mileage: 11820, fuelAmount: 46, fuelCost: 381.8, note: '中石化·城北加油站 92#' },
    { daysAgo: 37, mileage: 12300, fuelAmount: 49, fuelCost: 401.8, note: '壳牌·高新区站 95#' },
    { daysAgo: 30, mileage: 12750, fuelAmount: 47, fuelCost: 385.4, note: '中石化·城北加油站 92#' },
    { daysAgo: 22, mileage: 13180, fuelAmount: 51, fuelCost: 428.4, note: '中石油·二环路站 92#' },
    { daysAgo: 14, mileage: 13600, fuelAmount: 45, fuelCost: 382.5, note: '中石化·城南加油站 92#' },
    { daysAgo: 7,  mileage: 14050, fuelAmount: 48, fuelCost: 398.4, note: '壳牌·高新区站 95#' },
    { daysAgo: 2,  mileage: 14500, fuelAmount: 50, fuelCost: 420,   note: '中石化·城北加油站 92#' },
  ].map((r) => {
    const date = isoDate(now, r.daysAgo);
    return {
      vehicleId: 1,
      date,
      mileage: r.mileage,
      fuelAmount: r.fuelAmount,
      fuelCost: r.fuelCost,
      fuelPrice: Math.round((r.fuelCost / r.fuelAmount) * 100) / 100,
      isFullTank: true,
      note: r.note,
      createdAt: new Date(new Date(date).getTime() + 43200000).toISOString(),
    };
  });

  await db.fuelRecords.bulkAdd(records);
}

function isoDate(base: Date, daysAgo: number): string {
  const d = new Date(base.getTime() - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}
