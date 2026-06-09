# 车辆油耗统计 App — Phase 1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个可用的车辆油耗统计 Web MVP — 加油记录 CRUD + 首页摘要 + 数据导出 Excel。

**Architecture:** React 18 + Vite + Tailwind CSS 纯前端 SPA，Zustand 管理状态，Dexie.js 封装 IndexedDB 本地存储，PWA 离线可用。Hash 路由，5 个页面，移动端优先的响应式布局。

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand 4, Dexie.js 4, React Router 6, SheetJS (xlsx), vite-plugin-pwa

---

## 文件结构总览

```
my-car_oil/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── public/
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/index.ts
    ├── db/index.ts
    ├── db/seed.ts
    ├── utils/calculation.ts
    ├── utils/format.ts
    ├── utils/validation.ts
    ├── stores/fuelStore.ts
    ├── hooks/useFuelRecords.ts
    ├── hooks/useExport.ts
    ├── components/layout/NavBar.tsx
    ├── components/layout/TabBar.tsx
    ├── components/common/ConfirmDialog.tsx
    ├── components/common/DatePicker.tsx
    ├── components/common/NumberInput.tsx
    ├── components/dashboard/SummaryCard.tsx
    ├── components/dashboard/RecentRecords.tsx
    ├── components/records/RecordCard.tsx
    ├── components/records/FilterTabs.tsx
    ├── components/records/EmptyState.tsx
    ├── routes/Dashboard.tsx
    ├── routes/RecordList.tsx
    ├── routes/RecordForm.tsx
    ├── routes/Stats.tsx
    └── routes/Settings.tsx
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `public/icon-192.png`, `public/icon-512.png`（占位 SVG）

- [ ] **Step 1: 初始化 git 仓库**

Run: `cd "D:/ai-project/my-car_oil" && git init`
Expected: `Initialized empty Git repository in D:/ai-project/my-car_oil/.git/`

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "car-oil-tracker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: 安装依赖**

Run: `cd "D:/ai-project/my-car_oil" && npm install react@^18 react-dom@^18 react-router-dom@^6 zustand@^4 dexie@^4 xlsx@^0.18`
Expected: packages installed

- [ ] **Step 4: 安装开发依赖**

Run: `cd "D:/ai-project/my-car_oil" && npm install -D typescript@^5 @types/react@^18 @types/react-dom@^18 @vitejs/plugin-react@^4 vite@^5 tailwindcss@^3 postcss autoprefixer vite-plugin-pwa@^0`
Expected: dev packages installed

- [ ] **Step 5: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: '我的油耗',
        short_name: '油耗',
        description: '个人车辆油耗统计应用',
        theme_color: '#059669',
        background_color: '#f0fdf4',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 6: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 7: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 8: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 9: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#059669" />
    <link rel="icon" type="image/svg+xml" href="/icon-192.png" />
    <title>我的油耗</title>
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: 创建 src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 11: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 移动端触摸优化 */
* {
  -webkit-tap-highlight-color: transparent;
}

html, body, #root {
  height: 100%;
  margin: 0;
}

/* 安全区域适配（iPhone 刘海屏） */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 12: 创建占位图标（SVG 转 PNG 占位）**

Run: `cd "D:/ai-project/my-car_oil/public" && echo '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#059669"/><text x="96" y="120" text-anchor="middle" font-size="80" fill="white">⛽</text></svg>' > icon-192.svg && echo '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#059669"/><text x="256" y="320" text-anchor="middle" font-size="200" fill="white">⛽</text></svg>' > icon-512.svg`
Expected: 两个 SVG 图标文件创建成功（Vite PWA 可使用 SVG）

- [ ] **Step 13: 创建 src/App.tsx（骨架）**

```tsx
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/layout/NavBar';
import TabBar from './components/layout/TabBar';
import Dashboard from './routes/Dashboard';
import RecordList from './routes/RecordList';
import RecordForm from './routes/RecordForm';
import Stats from './routes/Stats';
import Settings from './routes/Settings';
import { seedIfEmpty } from './db/seed';

function AppLayout() {
  const location = useLocation();
  const tabBarRoutes = ['/', '/records', '/stats', '/settings'];
  const showTabBar = tabBarRoutes.includes(location.pathname);

  function getNavConfig(pathname: string) {
    if (pathname === '/') return { title: '我的油耗', showBack: false };
    if (pathname === '/records') return { title: '加油记录', showBack: false };
    if (pathname === '/records/new') return { title: '新增记录', showBack: true };
    if (pathname.startsWith('/records/') && pathname !== '/records/new')
      return { title: '编辑记录', showBack: true };
    if (pathname === '/stats') return { title: '统计', showBack: false };
    if (pathname === '/settings') return { title: '设置', showBack: false };
    return { title: '我的油耗', showBack: false };
  }

  const nav = getNavConfig(location.pathname);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-lg relative">
      <NavBar title={nav.title} showBack={nav.showBack} />
      <main className={`flex-1 overflow-y-auto ${showTabBar ? 'pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/records/new" element={<RecordForm />} />
          <Route path="/records/:id" element={<RecordForm />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {showTabBar && <TabBar />}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
```

- [ ] **Step 14: 验证 Vite 启动成功**

Run: `cd "D:/ai-project/my-car_oil" && npx vite --host 0.0.0.0 --port 5173`
Expected: Vite dev server starts on port 5173，浏览器打开可看到空白页（组件尚未创建，预期报 import 错误）

Run after verification: Ctrl+C 停止服务器

- [ ] **Step 15: 首次提交**

```bash
cd "D:/ai-project/my-car_oil"
git add -A
git commit -m "chore: project scaffold with Vite + React + Tailwind + PWA"
```

---

### Task 2: 数据层 — 类型定义 + Dexie.js + 种子数据

**Files:**
- Create: `src/types/index.ts`
- Create: `src/db/index.ts`
- Create: `src/db/seed.ts`

- [ ] **Step 1: 创建 TypeScript 类型定义**

```typescript
// src/types/index.ts

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

export interface FuelRecordInput {
  vehicleId: number;
  date: string;
  mileage: number;
  fuelAmount: number;
  fuelCost: number;
  isFullTank: boolean;
  note: string;
}

export interface FuelStats {
  avgConsumption: number | null; // 平均油耗 L/100km，无数据时为 null
  totalCostThisMonth: number;
  totalDistanceThisMonth: number;
  recordCount: number;
}

export interface Vehicle {
  id?: number;
  name: string;
  brand: string;
  model: string;
  plateNumber: string;
  isActive: boolean;
}
```

- [ ] **Step 2: 创建 Dexie.js 数据库初始化**

```typescript
// src/db/index.ts
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
  }
}

export const db = new CarOilDB();
```

- [ ] **Step 3: 创建种子数据**

```typescript
// src/db/seed.ts
import { db } from './index';

export async function seedIfEmpty() {
  const count = await db.fuelRecords.count();
  if (count > 0) return;

  const now = new Date();
  const day = 86400000;

  // 创建一辆默认车
  await db.vehicles.add({
    name: '我的爱车',
    brand: '',
    model: '',
    plateNumber: '',
    isActive: true,
  });

  // 创建约 2 个月的加油记录，模拟真实数据
  const records = [
    { vehicleId: 1, date: isoDate(now, 60), mileage: 10800, fuelAmount: 50, fuelCost: 410, isFullTank: true, note: '中石化·城北加油站 92#' },
    { vehicleId: 1, date: isoDate(now, 53), mileage: 11350, fuelAmount: 48, fuelCost: 393.6, isFullTank: true, note: '中石油·二环路站 92#' },
    { vehicleId: 1, date: isoDate(now, 45), mileage: 11820, fuelAmount: 46, fuelCost: 381.8, isFullTank: true, note: '中石化·城北加油站 92#' },
    { vehicleId: 1, date: isoDate(now, 37), mileage: 12300, fuelAmount: 49, fuelCost: 401.8, isFullTank: true, note: '壳牌·高新区站 95#' },
    { vehicleId: 1, date: isoDate(now, 30), mileage: 12750, fuelAmount: 47, fuelCost: 385.4, isFullTank: true, note: '中石化·城北加油站 92#' },
    { vehicleId: 1, date: isoDate(now, 22), mileage: 13180, fuelAmount: 51, fuelCost: 428.4, isFullTank: true, note: '中石油·二环路站 92#' },
    { vehicleId: 1, date: isoDate(now, 14), mileage: 13600, fuelAmount: 45, fuelCost: 382.5, isFullTank: true, note: '中石化·城南加油站 92#' },
    { vehicleId: 1, date: isoDate(now, 7),  mileage: 14050, fuelAmount: 48, fuelCost: 398.4, isFullTank: true, note: '壳牌·高新区站 95#' },
    { vehicleId: 1, date: isoDate(now, 2),  mileage: 14500, fuelAmount: 50, fuelCost: 420, isFullTank: true, note: '中石化·城北加油站 92#' },
  ].map((r) => ({
    ...r,
    fuelPrice: Math.round((r.fuelCost / r.fuelAmount) * 100) / 100,
    createdAt: new Date(new Date(r.date).getTime() + 43200000).toISOString(),
  }));

  await db.fuelRecords.bulkAdd(records);
}

function isoDate(base: Date, daysAgo: number): string {
  const d = new Date(base.getTime() - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}
```

- [ ] **Step 4: 验证数据库初始化**

Run: `cd "D:/ai-project/my-car_oil" && npx vite build`
Expected: Build 成功，无 TypeScript 错误。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add types, Dexie.js database, and seed data"
```

---

### Task 3: 纯函数工具 + Zustand Store + Hooks

**Files:**
- Create: `src/utils/calculation.ts`, `src/utils/format.ts`, `src/utils/validation.ts`
- Create: `src/stores/fuelStore.ts`
- Create: `src/hooks/useFuelRecords.ts`, `src/hooks/useExport.ts`

- [ ] **Step 1: 创建计算工具函数**

```typescript
// src/utils/calculation.ts

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
```

- [ ] **Step 2: 创建格式化工具函数**

```typescript
// src/utils/format.ts

/** 完整日期：2026-06-09 */
export function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 短日期：06-09 */
export function formatDateShort(isoStr: string): string {
  const d = new Date(isoStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 周几 */
export function formatDayOfWeek(isoStr: string): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[new Date(isoStr).getDay()];
}

/** 金额：¥420.00 */
export function formatMoney(yuan: number): string {
  return `¥${yuan.toFixed(2)}`;
}

/** 油耗：7.1 L/100km */
export function formatConsumption(lPer100km: number): string {
  return `${lPer100km.toFixed(1)} L/100km`;
}
```

- [ ] **Step 3: 创建表单校验函数**

```typescript
// src/utils/validation.ts
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
```

- [ ] **Step 4: 创建 Zustand Store**

```typescript
// src/stores/fuelStore.ts
import { create } from 'zustand';
import { db } from '../db';
import type { FuelRecord, FuelRecordInput, FuelStats } from '../types';
import { calcFuelPrice, calcFuelConsumption } from '../utils/calculation';

interface FuelStore {
  records: FuelRecord[];
  isLoading: boolean;

  fetchRecords: (vehicleId?: number) => Promise<void>;
  addRecord: (data: FuelRecordInput) => Promise<number>;
  updateRecord: (id: number, data: FuelRecordInput) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getStats: (vehicleId?: number) => FuelStats;
}

export const useFuelStore = create<FuelStore>((set, get) => ({
  records: [],
  isLoading: false,

  fetchRecords: async (vehicleId = 1) => {
    set({ isLoading: true });
    const records = await db.fuelRecords
      .where('vehicleId')
      .equals(vehicleId)
      .reverse()
      .sortBy('date');
    set({ records, isLoading: false });
  },

  addRecord: async (data) => {
    const record: FuelRecord = {
      ...data,
      fuelPrice: calcFuelPrice(data.fuelCost, data.fuelAmount),
      createdAt: new Date().toISOString(),
    };
    const id = await db.fuelRecords.add(record);
    await get().fetchRecords(data.vehicleId);
    return id as number;
  },

  updateRecord: async (id, data) => {
    const existing = await db.fuelRecords.get(id);
    if (!existing) throw new Error('记录不存在');
    const record: FuelRecord = {
      ...data,
      fuelPrice: calcFuelPrice(data.fuelCost, data.fuelAmount),
      createdAt: existing.createdAt,
    };
    await db.fuelRecords.update(id, record);
    await get().fetchRecords(data.vehicleId);
  },

  deleteRecord: async (id) => {
    const record = await db.fuelRecords.get(id);
    await db.fuelRecords.delete(id);
    await get().fetchRecords(record?.vehicleId ?? 1);
  },

  getStats: (vehicleId = 1) => {
    const records = get().records.filter((r) => r.vehicleId === vehicleId);
    const fullTankRecords = records
      .filter((r) => r.isFullTank)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 计算平均油耗
    let totalConsumption = 0;
    let consumptionCount = 0;
    for (let i = 0; i < fullTankRecords.length - 1; i++) {
      const newer = fullTankRecords[i];
      const older = fullTankRecords[i + 1];
      const consumption = calcFuelConsumption(newer.fuelAmount, older.mileage, newer.mileage);
      if (consumption !== null) {
        totalConsumption += consumption;
        consumptionCount++;
      }
    }

    // 本月统计
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthByDate = [...thisMonth].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      avgConsumption: consumptionCount > 0 ? totalConsumption / consumptionCount : null,
      totalCostThisMonth: thisMonth.reduce((sum, r) => sum + r.fuelCost, 0),
      totalDistanceThisMonth:
        thisMonthByDate.length >= 2
          ? thisMonthByDate[0].mileage - thisMonthByDate[thisMonthByDate.length - 1].mileage
          : 0,
      recordCount: records.length,
    };
  },
}));
```

- [ ] **Step 5: 创建 useFuelRecords hook**

```typescript
// src/hooks/useFuelRecords.ts
import { useCallback, useEffect } from 'react';
import { useFuelStore } from '../stores/fuelStore';
import type { FuelRecordInput } from '../types';

export function useFuelRecords(vehicleId = 1) {
  const store = useFuelStore();

  useEffect(() => {
    store.fetchRecords(vehicleId);
  }, [vehicleId]);

  const refresh = useCallback(() => {
    return store.fetchRecords(vehicleId);
  }, [store, vehicleId]);

  const add = useCallback(
    async (data: FuelRecordInput) => {
      return store.addRecord({ ...data, vehicleId });
    },
    [store, vehicleId]
  );

  const update = useCallback(
    async (id: number, data: FuelRecordInput) => {
      return store.updateRecord(id, { ...data, vehicleId });
    },
    [store, vehicleId]
  );

  const remove = useCallback(
    async (id: number) => {
      return store.deleteRecord(id);
    },
    [store]
  );

  return {
    records: store.records,
    isLoading: store.isLoading,
    stats: store.getStats(vehicleId),
    refresh,
    add,
    update,
    remove,
  };
}
```

- [ ] **Step 6: 创建 useExport hook**

```typescript
// src/hooks/useExport.ts
import * as XLSX from 'xlsx';
import type { FuelRecord } from '../types';
import { formatDate } from '../utils/format';

export function useExport() {
  const exportToExcel = (records: FuelRecord[]) => {
    const data = records.map((r) => ({
      日期: formatDate(r.date),
      '里程 (km)': r.mileage,
      '加油量 (L)': r.fuelAmount,
      '金额 (¥)': Math.round(r.fuelCost * 100) / 100,
      '单价 (¥/L)': r.fuelPrice,
      是否加满: r.isFullTank ? '是' : '否',
      备注: r.note,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    // 设置列宽
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 24 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '加油记录');
    XLSX.writeFile(wb, `油耗记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return { exportToExcel };
}
```

- [ ] **Step 7: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: add calculation utils, Zustand store, and hooks"
```

---

### Task 4: 公共布局组件

**Files:**
- Create: `src/components/layout/NavBar.tsx`, `src/components/layout/TabBar.tsx`
- Create: `src/components/common/ConfirmDialog.tsx`, `src/components/common/DatePicker.tsx`, `src/components/common/NumberInput.tsx`

- [ ] **Step 1: 创建 NavBar 组件**

```tsx
// src/components/layout/NavBar.tsx
import { useNavigate } from 'react-router-dom';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function NavBar({ title, showBack, rightAction }: NavBarProps) {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between h-12 px-4 bg-primary-600 text-white shrink-0">
      <div className="w-12">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-primary-700 active:bg-primary-800 transition-colors"
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
        )}
      </div>
      <h1 className="text-lg font-semibold truncate">{title}</h1>
      <div className="w-12 flex justify-end">
        {rightAction}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 创建 TabBar 组件**

```tsx
// src/components/layout/TabBar.tsx
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/', label: '首页', icon: HomeIcon },
  { path: '/records', label: '记录', icon: ListIcon },
  { path: '/stats', label: '统计', icon: ChartIcon },
  { path: '/settings', label: '设置', icon: SettingsIcon },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-14 bg-white border-t border-gray-200 pb-safe max-w-md mx-auto">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
              active ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <Icon active={active} />
            <span className="text-xs">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---- 图标组件 ---- */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {active ? (
        <>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </>
      ) : (
        <>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </>
      )}
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
```

- [ ] **Step 3: 创建 ConfirmDialog 组件**

```tsx
// src/components/common/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl mx-4 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-gray-600 font-medium border-r border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-bl-2xl"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 font-medium hover:opacity-90 active:opacity-80 transition-opacity rounded-br-2xl ${
              danger ? 'text-red-600' : 'text-primary-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 DatePicker 组件**

```tsx
// src/components/common/DatePicker.tsx
interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label }: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-500">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   active:bg-gray-100 transition-colors"
      />
    </div>
  );
}
```

- [ ] **Step 5: 创建 NumberInput 组件**

```tsx
// src/components/common/NumberInput.tsx
interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  label?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  step?: string;
  error?: string;
}

export default function NumberInput({
  value,
  onChange,
  label,
  suffix,
  placeholder,
  min,
  step = 'any',
  error,
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-500">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? '' : Number(v));
          }}
          placeholder={placeholder}
          min={min}
          step={step}
          inputMode="decimal"
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 text-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     active:bg-gray-100 transition-colors
                     ${suffix ? 'pr-12' : ''}
                     ${error ? 'border-red-400' : 'border-gray-200'}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 6: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: add layout components (NavBar, TabBar) and common UI components"
```

---

### Task 5: 首页 Dashboard

**Files:**
- Create: `src/components/dashboard/SummaryCard.tsx`, `src/components/dashboard/RecentRecords.tsx`
- Create: `src/components/records/RecordCard.tsx`
- Create: `src/routes/Dashboard.tsx`

- [ ] **Step 1: 创建 SummaryCard 组件**

```tsx
// src/components/dashboard/SummaryCard.tsx
interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'purple';
}

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  purple: 'bg-purple-50 text-purple-700',
};

export default function SummaryCard({ title, value, unit, color = 'emerald' }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl p-4 ${colorMap[color]} flex flex-col gap-1`}>
      <span className="text-xs opacity-70">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 RecordCard 组件**

```tsx
// src/components/records/RecordCard.tsx
import { useState, useRef } from 'react';
import type { FuelRecord } from '../../types';
import { formatDateShort, formatDayOfWeek, formatMoney, formatConsumption } from '../../utils/format';
import { calcFuelConsumption } from '../../utils/calculation';

interface RecordCardProps {
  record: FuelRecord;
  prevMileage?: number;       // 上一条记录的里程，用于算油耗
  prevIsFullTank?: boolean;
  onEdit: (record: FuelRecord) => void;
  onDelete: (record: FuelRecord) => void;
}

export default function RecordCard({ record, prevMileage, prevIsFullTank, onEdit, onDelete }: RecordCardProps) {
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // 计算本条记录油耗
  const consumption =
    record.isFullTank && prevMileage && prevIsFullTank
      ? calcFuelConsumption(record.fuelAmount, prevMileage, record.mileage)
      : null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // 水平滑动超过 40px 且大于垂直滑动
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setSwiped(dx < 0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* 左滑露出的操作按钮 */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        <button
          onClick={() => { onEdit(record); setSwiped(false); }}
          className="w-16 bg-primary-500 text-white flex items-center justify-center active:bg-primary-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => { onDelete(record); setSwiped(false); }}
          className="w-16 bg-red-500 text-white flex items-center justify-center active:bg-red-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      {/* 卡片主体 */}
      <div
        className={`relative bg-white border-b border-gray-50 px-4 py-3 transition-transform duration-200 ${
          swiped ? '-translate-x-32' : 'translate-x-0'
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => swiped && setSwiped(false)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {formatDateShort(record.date)}
              </span>
              <span className="text-xs text-gray-400">{formatDayOfWeek(record.date)}</span>
              {record.isFullTank && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">加满</span>
              )}
            </div>
            {record.note && (
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{record.note}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-900 font-medium">
              {record.fuelAmount}L · {formatMoney(record.fuelCost)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {record.mileage.toLocaleString()} km
            </div>
          </div>
        </div>
        {consumption !== null && (
          <div className="mt-1 text-xs text-primary-600 font-medium">
            油耗: {formatConsumption(consumption)}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 RecentRecords 组件**

```tsx
// src/components/dashboard/RecentRecords.tsx
import { useNavigate } from 'react-router-dom';
import type { FuelRecord } from '../../types';
import RecordCard from '../records/RecordCard';

interface RecentRecordsProps {
  records: FuelRecord[];
  onEdit: (record: FuelRecord) => void;
  onDelete: (record: FuelRecord) => void;
}

export default function RecentRecords({ records, onEdit, onDelete }: RecentRecordsProps) {
  const navigate = useNavigate();
  const recent = records.slice(0, 5);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-500">最近记录</h2>
        <button
          onClick={() => navigate('/records')}
          className="text-xs text-primary-600 active:text-primary-700"
        >
          查看全部 →
        </button>
      </div>
      <div className="bg-white rounded-2xl mx-4 overflow-hidden shadow-sm border border-gray-100">
        {recent.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">暂无加油记录</p>
        ) : (
          recent.map((record, i) => {
            const prev = recent[i + 1]; // 下一条 = 时间上更早的
            return (
              <RecordCard
                key={record.id}
                record={record}
                prevMileage={prev?.mileage}
                prevIsFullTank={prev?.isFullTank}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 Dashboard 页面**

```tsx
// src/routes/Dashboard.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentRecords from '../components/dashboard/RecentRecords';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FuelRecord } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { records, stats, remove } = useFuelRecords(1);
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  return (
    <div className="py-4">
      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <SummaryCard
          title="平均油耗"
          value={stats.avgConsumption !== null ? stats.avgConsumption.toFixed(1) : '--'}
          unit="L/100km"
          color="emerald"
        />
        <SummaryCard
          title="本月油费"
          value={`¥${stats.totalCostThisMonth.toFixed(0)}`}
          color="blue"
        />
        <SummaryCard
          title="本月行驶"
          value={`${stats.totalDistanceThisMonth}`}
          unit="km"
          color="amber"
        />
        <SummaryCard
          title="累计记录"
          value={`${stats.recordCount}`}
          unit="条"
          color="purple"
        />
      </div>

      {/* 最近记录 */}
      <RecentRecords
        records={records}
        onEdit={(r) => navigate(`/records/${r.id}`)}
        onDelete={setDeleteTarget}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除记录"
        message={`确定删除 ${deleteTarget?.date || ''} 的这条加油记录吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
```

- [ ] **Step 5: 创建 Stats 占位页面**

```tsx
// src/routes/Stats.tsx
export default function Stats() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <p className="text-sm">统计功能即将上线</p>
      <p className="text-xs mt-1 opacity-60">Phase 2 开发中</p>
    </div>
  );
}
```

- [ ] **Step 6: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: add Dashboard page with summary cards and recent records"
```

---

### Task 6: 记录列表页

**Files:**
- Create: `src/components/records/FilterTabs.tsx`, `src/components/records/EmptyState.tsx`
- Create: `src/routes/RecordList.tsx`

- [ ] **Step 1: 创建 FilterTabs 组件**

```tsx
// src/components/records/FilterTabs.tsx
export type FilterPeriod = 'all' | 'month' | '3months';

interface FilterTabsProps {
  active: FilterPeriod;
  onChange: (period: FilterPeriod) => void;
}

const TABS: { key: FilterPeriod; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: '3months', label: '近3月' },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === key
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-500 active:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建 EmptyState 组件**

```tsx
// src/components/records/EmptyState.tsx
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  message?: string;
  showAction?: boolean;
}

export default function EmptyState({ message = '还没有加油记录', showAction = true }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-30">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      <p className="text-sm">{message}</p>
      {showAction && (
        <button
          onClick={() => navigate('/records/new')}
          className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-full text-sm font-medium active:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          记录第一笔加油
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建 RecordList 页面**

```tsx
// src/routes/RecordList.tsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import RecordCard from '../components/records/RecordCard';
import FilterTabs from '../components/records/FilterTabs';
import EmptyState from '../components/records/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FilterPeriod } from '../components/records/FilterTabs';
import type { FuelRecord } from '../types';

export default function RecordList() {
  const navigate = useNavigate();
  const { records, remove } = useFuelRecords(1);
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);

  // 筛选
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((r) => {
      const d = new Date(r.date);
      if (filter === 'month')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === '3months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return d >= threeMonthsAgo;
      }
      return true;
    });
  }, [records, filter]);

  // 按日期分组
  const groupedRecords = useMemo(() => {
    const groups: { date: string; records: FuelRecord[] }[] = [];
    for (const r of filteredRecords) {
      const last = groups[groups.length - 1];
      if (last && last.date === r.date) {
        last.records.push(r);
      } else {
        groups.push({ date: r.date, records: [r] });
      }
    }
    return groups;
  }, [filteredRecords]);

  const handleDelete = useCallback(async () => {
    if (deleteTarget?.id) {
      await remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, remove]);

  const formatGroupDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`;
  };

  if (records.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <FilterTabs active={filter} onChange={setFilter} />

      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <EmptyState message="该时间段内没有记录" showAction={false} />
        ) : (
          groupedRecords.map((group) => (
            <div key={group.date}>
              <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50/95 backdrop-blur-sm text-xs text-gray-500 font-medium">
                {formatGroupDate(group.date)}
              </div>
              <div className="bg-white mx-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3">
                {group.records.map((record, i) => {
                  // 在同组内找上一条（更早的）记录
                  const prev = group.records[i + 1];
                  return (
                    <RecordCard
                      key={record.id}
                      record={record}
                      prevMileage={prev?.mileage}
                      prevIsFullTank={prev?.isFullTank}
                      onEdit={(r) => navigate(`/records/${r.id}`)}
                      onDelete={setDeleteTarget}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 新增按钮 */}
      <div className="shrink-0 p-4 pb-20">
        <button
          onClick={() => navigate('/records/new')}
          className="w-full py-3.5 bg-primary-600 text-white rounded-2xl font-medium text-lg
                     active:bg-primary-700 transition-colors shadow-lg shadow-primary-200
                     flex items-center justify-center gap-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新增记录
        </button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除记录"
        message={`确定删除 ${deleteTarget?.date || ''} 的这条加油记录吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
```

- [ ] **Step 4: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add RecordList page with filter tabs and swipe actions"
```

---

### Task 7: 记录表单页（新增/编辑）

**Files:**
- Create: `src/routes/RecordForm.tsx`

- [ ] **Step 1: 创建 RecordForm 页面**

```tsx
// src/routes/RecordForm.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import DatePicker from '../components/common/DatePicker';
import NumberInput from '../components/common/NumberInput';
import { validateRecord } from '../utils/validation';
import { calcFuelPrice } from '../utils/calculation';
import type { ValidationError } from '../utils/validation';
import type { FuelRecordInput } from '../types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { records, add, update } = useFuelRecords(1);

  const [date, setDate] = useState(todayStr());
  const [mileage, setMileage] = useState<number | ''>('');
  const [fuelAmount, setFuelAmount] = useState<number | ''>('');
  const [fuelCost, setFuelCost] = useState<number | ''>('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);

  // 获取上一条记录的里程，用于自动填入和校验
  const lastMileage = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.mileage;
  }, [records]);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (isEdit && id) {
      const record = records.find((r) => r.id === Number(id));
      if (record) {
        setDate(record.date);
        setMileage(record.mileage);
        setFuelAmount(record.fuelAmount);
        setFuelCost(record.fuelCost);
        setIsFullTank(record.isFullTank);
        setNote(record.note);
      }
    }
  }, [isEdit, id, records]);

  // 新增模式：自动填入上次里程
  useEffect(() => {
    if (!isEdit && lastMileage && mileage === '') {
      setMileage(lastMileage);
    }
  }, [isEdit, lastMileage]);

  // 自动计算单价
  const fuelPrice = useMemo(() => {
    if (fuelCost !== '' && fuelAmount !== '' && fuelAmount > 0) {
      return calcFuelPrice(Number(fuelCost), Number(fuelAmount));
    }
    return null;
  }, [fuelCost, fuelAmount]);

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleSave = useCallback(async () => {
    const data: FuelRecordInput = {
      vehicleId: 1,
      date,
      mileage: mileage === '' ? 0 : mileage,
      fuelAmount: fuelAmount === '' ? 0 : fuelAmount,
      fuelCost: fuelCost === '' ? 0 : fuelCost,
      isFullTank,
      note: note.trim(),
    };

    const validationErrors = validateRecord(data, lastMileage);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await update(Number(id), data);
      } else {
        await add(data);
      }
      navigate('/records', { replace: true });
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setSaving(false);
    }
  }, [date, mileage, fuelAmount, fuelCost, isFullTank, note, lastMileage, isEdit, id, add, update, navigate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* 日期 */}
        <DatePicker value={date} onChange={setDate} label="加油日期" />

        {/* 里程 */}
        <NumberInput
          value={mileage}
          onChange={setMileage}
          label="当前里程"
          suffix="km"
          placeholder="里程表读数"
          error={getFieldError('mileage')}
        />

        {/* 加油量 + 金额并排 */}
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            value={fuelAmount}
            onChange={setFuelAmount}
            label="加油量"
            suffix="L"
            placeholder="升数"
            error={getFieldError('fuelAmount')}
          />
          <NumberInput
            value={fuelCost}
            onChange={setFuelCost}
            label="加油金额"
            suffix="¥"
            placeholder="金额"
            error={getFieldError('fuelCost')}
          />
        </div>

        {/* 自动计算单价 */}
        {fuelPrice !== null && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-sm text-gray-400">单价</span>
            <span className="text-lg font-semibold text-gray-700">¥{fuelPrice.toFixed(2)}/L</span>
            <span className="text-xs text-gray-400">自动计算</span>
          </div>
        )}

        {/* 加满开关 */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-500">本次加满</span>
          <button
            onClick={() => setIsFullTank(!isFullTank)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              isFullTank ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={isFullTank}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                isFullTank ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-400 -mt-3">
          加满后才能准确计算油耗。如果没加满，本次记录不参与油耗计算。
        </p>

        {/* 备注 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">备注（可选）</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="加油站名、油品等..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       active:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="shrink-0 p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-primary-600 text-white rounded-2xl font-medium text-lg
                     active:bg-primary-700 transition-colors shadow-lg shadow-primary-200
                     disabled:opacity-50 disabled:active:bg-primary-600"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add RecordForm with validation, auto-calculate, and toggle switch"
```

---

### Task 8: 设置页 + 数据导出

**Files:**
- Create: `src/routes/Settings.tsx`

- [ ] **Step 1: 创建 Settings 页面**

```tsx
// src/routes/Settings.tsx
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useExport } from '../hooks/useExport';

export default function Settings() {
  const { records } = useFuelRecords(1);
  const { exportToExcel } = useExport();

  const handleExport = () => {
    if (records.length === 0) {
      alert('暂无加油记录可导出');
      return;
    }
    exportToExcel(records);
  };

  return (
    <div className="py-4 px-4 space-y-4">
      {/* 数据导出 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">数据管理</h3>
        </div>
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">导出数据</p>
              <p className="text-xs text-gray-400">导出为 Excel 文件 (.xlsx)</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Phase 2 / Phase 3 功能入口（灰显占位） */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 opacity-50 pointer-events-none">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">更多功能</h3>
        </div>
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">保养提醒</p>
            <p className="text-xs text-gray-400">Phase 3 即将上线</p>
          </div>
        </div>
        <div className="px-4 py-4 flex items-center gap-3 border-t border-gray-50">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">统计图表</p>
            <p className="text-xs text-gray-400">Phase 2 即将上线</p>
          </div>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">关于</h3>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-900 font-medium">我的油耗</p>
          <p className="text-xs text-gray-400 mt-1">版本 0.1.0</p>
          <p className="text-xs text-gray-400 mt-2">
            纯本地存储，数据不上传服务器。<br />
            支持导出 Excel 备份数据。
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

Run: `cd "D:/ai-project/my-car_oil" && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add Settings page with Excel export and Phase 2/3 placeholders"
```

---

### Task 9: PWA 测试与验证

- [ ] **Step 1: 生产构建**

Run: `cd "D:/ai-project/my-car_oil" && npm run build`
Expected: Build 成功，输出到 `dist/` 目录，包含 `sw.js`（Service Worker）

- [ ] **Step 2: 预览构建产物**

Run: `cd "D:/ai-project/my-car_oil" && npx vite preview --port 4173`
Expected: 预览服务器启动在 4173 端口

然后手动打开 `http://localhost:4173` 验证：
- 首页显示摘要卡片和种子数据
- 可以新增一条加油记录
- 可以编辑已有记录
- 可以删除记录（弹出确认弹窗）
- 设置页可以导出 Excel
- Tab Bar 切换正常
- 返回按钮正常工作

- [ ] **Step 3: 验证 PWA manifest**

Run: 浏览器 DevTools → Application → Manifest，检查：
- `name`: "我的油耗"
- `theme_color`: "#059669"
- `display`: "standalone"
Expected: 所有字段正确

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "feat: Phase 1 complete - PWA verified"
```

---

## 计划自检

- ✅ Spec 覆盖率：9 个 Task 覆盖 spec 中所有 Phase 1 需求（Dashboard、RecordList、RecordForm、Settings/Export、PWA）
- ✅ 无占位符：每一步都包含完整代码或确切命令
- ✅ 类型一致性：FuelRecord / FuelRecordInput / FuelStats 在各组件中使用一致
- ✅ 函数名一致性：calcFuelPrice / calcFuelConsumption / formatDate 等工具函数名各处一致
- ✅ RecordCard 复用在 Dashboard 和 RecordList 中
