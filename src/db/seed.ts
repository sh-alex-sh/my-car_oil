import { db } from './index';

/** 首次启动时初始化默认车辆（数据为空） */
export async function seedIfEmpty() {
  const vehicleCount = await db.vehicles.count();
  if (vehicleCount > 0) return;

  // 创建一辆默认车
  await db.vehicles.add({
    name: '我的爱车',
    brand: '',
    model: '',
    plateNumber: '',
    isActive: true,
  });
}
