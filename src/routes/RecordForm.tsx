import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { useVehicles } from '../hooks/useVehicles';
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
  const { activeVehicle } = useVehicles();
  const vehicleId = activeVehicle?.id ?? 1;
  const { records, add, update } = useFuelRecords(vehicleId);

  const [date, setDate] = useState(todayStr());
  const [mileage, setMileage] = useState<number | ''>('');
  const [fuelAmount, setFuelAmount] = useState<number | ''>('');
  const [fuelCost, setFuelCost] = useState<number | ''>('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);

  // 获取上一条记录的里程（用于自动填入和校验）
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
      vehicleId,
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
