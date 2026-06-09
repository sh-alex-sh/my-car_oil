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
