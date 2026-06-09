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
