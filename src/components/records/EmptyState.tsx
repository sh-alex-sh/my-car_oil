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
