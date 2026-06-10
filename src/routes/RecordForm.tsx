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

  // 所有记录按日期降序排列（最新在前）
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [records]
  );

  const [date, setDate] = useState(todayStr());
  const [mileage, setMileage] = useState<number | ''>('');
  const [fuelAmount, setFuelAmount] = useState<number | ''>('');
  const [fuelCost, setFuelCost] = useState<number | ''>('');
  const [fuelGrade, setFuelGrade] = useState('92#');
  const [isFullTank, setIsFullTank] = useState(true);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (isEdit && id) {
      const record = records.find((r) => r.id === Number(id));
      if (record) {
        setDate(record.date);
        setMileage(record.mileage);
        setFuelAmount(record.fuelAmount);
        setFuelCost(record.fuelCost);
        setFuelGrade(record.fuelGrade || '92#');
        setIsFullTank(record.isFullTank);
        setNote(record.note);
      }
    }
  }, [isEdit, id, records]);

  // 自动填入建议里程（智能算法）
  const suggestionMileage = useMemo(() => {
    if (sortedRecords.length === 0) return undefined;

    if (isEdit && id) {
      // 编辑模式：不自动改里程
      return undefined;
    }

    // 新增模式：
    // - 往前补录（日期 < 最新记录）→ 取这条记录之前最近的那条里程
    // - 正常往后新增（日期 >= 最新记录）→ 取最新里程
    const latest = sortedRecords[0];
    if (date >= latest.date) {
      return latest.mileage;
    }
    // 补录：找日期 <= 所选日期的最近一条记录
    const beforeRecord = sortedRecords.find((r) => r.date <= date);
    return beforeRecord?.mileage ?? latest.mileage;
  }, [sortedRecords, date, isEdit, id]);

  // 新增模式：自动填入建议里程
  useEffect(() => {
    if (!isEdit && suggestionMileage !== undefined && mileage === '') {
      setMileage(suggestionMileage);
    }
  }, [isEdit, suggestionMileage]);

  // 选中日期对应的 nextMileage（校验用：补录时里程不能高于日期之后的记录）
  const nextMileage = useMemo(() => {
    // 找第一条日期 > 当前选中日期的记录
    const next = [...sortedRecords]
      .reverse() // 升序
      .find((r) => r.date > date);
    return next?.mileage;
  }, [sortedRecords, date]);

  // 自动计算单价
  const fuelPrice = useMemo(() => {
    if (fuelCost !== '' && fuelAmount !== '' && fuelAmount > 0) {
      return calcFuelPrice(Number(fuelCost), Number(fuelAmount));
    }
    return null;
  }, [fuelCost, fuelAmount]);

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  // 显示补录提示
  const isBackfill = !isEdit && sortedRecords.length > 0 && date < sortedRecords[0].date;

  const handleSave = useCallback(async () => {
    const data: FuelRecordInput = {
      vehicleId,
      date,
      mileage: mileage === '' ? 0 : mileage,
      fuelAmount: fuelAmount === '' ? 0 : fuelAmount,
      fuelCost: fuelCost === '' ? 0 : fuelCost,
      fuelGrade,
      isFullTank,
      note: note.trim(),
    };

    const validationErrors = validateRecord(data, nextMileage);
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
  }, [date, mileage, fuelAmount, fuelCost, fuelGrade, isFullTank, note, nextMileage, isEdit, id, add, update, navigate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* 日期 */}
        <DatePicker value={date} onChange={setDate} label="加油日期" />
        {isBackfill && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>补录模式：请填写加油时的实际里程表读数</span>
          </div>
        )}

        {/* 里程 */}
        <NumberInput
          value={mileage}
          onChange={setMileage}
          label="当前里程"
          suffix="km"
          placeholder="里程表读数"
          error={getFieldError('mileage')}
        />
        {suggestionMileage !== undefined && (
          <p className="text-xs text-gray-400 -mt-3">
            建议里程：{suggestionMileage.toLocaleString()} km（根据已有记录推算）
          </p>
        )}

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

        {/* 油品标号 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">油品标号</label>
          <div className="grid grid-cols-4 gap-2">
            {['92#', '95#', '98#', '0#'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setFuelGrade(grade)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  fuelGrade === grade
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 active:bg-gray-100'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

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
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                isFullTank ? 'translate-x-5' : 'translate-x-0'
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
