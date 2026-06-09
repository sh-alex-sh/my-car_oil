// 加油记录表
export interface FuelRecord {
  id?: number;
  vehicleId: number;
  date: string;        // ISO 8601, e.g. "2026-06-09"
  mileage: number;     // 里程表读数，公里
  fuelAmount: number;  // 加油量，升
  fuelCost: number;    // 加油金额，元
  fuelPrice: number;   // 单价 元/升，自动计算
  isFullTank: boolean; // 是否加满
  note: string;        // 备注
  createdAt?: string;  // 创建时间 ISO 8601
}

// 新增/编辑记录时的输入
export interface FuelRecordInput {
  vehicleId: number;
  date: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  isFullTank: boolean;
  note: string;
}

// 首页统计数据
export interface FuelStats {
  avgConsumption: number | null;   // 平均油耗 L/100km
  avgCostPerKm: number | null;     // 平均油费 元/km
  totalDistanceThisMonth: number;  // 本月行驶里程
  totalCost: number;               // 累计油费
  totalDistance: number;           // 累计行驶里程（最新里程 - 最早里程）
  recordCount: number;             // 累计记录
}

// 车辆信息（Phase 2 启用）
export interface Vehicle {
  id?: number;
  name: string;
  brand: string;
  model: string;
  plateNumber: string;
  isActive: boolean;
}
