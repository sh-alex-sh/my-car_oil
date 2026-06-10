import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { vehicles, add, update } = useVehicles();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (isEdit && id) {
      const vehicle = vehicles.find((v) => v.id === Number(id));
      if (vehicle) {
        setName(vehicle.name);
        setBrand(vehicle.brand);
        setModel(vehicle.model);
        setPlateNumber(vehicle.plateNumber);
      }
    }
  }, [isEdit, id, vehicles]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim(),
      };
      if (isEdit && id) {
        await update(Number(id), data);
      } else {
        await add(data);
      }
      navigate('/vehicles', { replace: true });
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setSaving(false);
    }
  }, [name, brand, model, plateNumber, isEdit, id, add, update, navigate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* 车辆名称 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">车辆名称 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：我的卡罗拉、家里的SUV"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       active:bg-gray-100 transition-colors"
          />
        </div>

        {/* 品牌 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">品牌</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="如：丰田、大众、比亚迪"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       active:bg-gray-100 transition-colors"
          />
        </div>

        {/* 型号 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">型号</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="如：卡罗拉 2023款、Model Y"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       active:bg-gray-100 transition-colors"
          />
        </div>

        {/* 车牌号 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">车牌号</label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="如：京A·12345"
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
          disabled={saving || !name.trim()}
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
