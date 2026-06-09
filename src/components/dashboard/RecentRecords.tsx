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
            // 在全部记录中找上一条（时间更早的），跨分组准确
            const prev = records[i + 1];
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
