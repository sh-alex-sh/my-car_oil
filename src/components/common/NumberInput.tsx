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
