import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

// 占位组件 — 后续 Task 逐一实现
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
      <p className="text-lg font-medium text-gray-600">{title}</p>
      <p className="text-xs mt-1 opacity-60">即将实现</p>
    </div>
  );
}

function TabBarPlaceholder() {
  const location = useLocation();
  const tabBarRoutes = ['/', '/records', '/stats', '/settings'];
  if (!tabBarRoutes.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-14 bg-white border-t border-gray-200 pb-safe max-w-md mx-auto">
      {[
        ['/', '首页'],
        ['/records', '记录'],
        ['/stats', '统计'],
        ['/settings', '设置'],
      ].map(([path, label]) => {
        const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(String(path));
        return (
          <a
            key={path}
            href={`#${path}`}
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 no-underline ${
              active ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{label === '首页' ? '🏠' : label === '记录' ? '📝' : label === '统计' ? '📊' : '⚙️'}</span>
            <span className="text-xs">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

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

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-lg relative">
      {/* 简易导航栏 — Task 4 替换为 NavBar 组件 */}
      <nav className="sticky top-0 z-40 flex items-center justify-between h-12 px-4 bg-primary-600 text-white shrink-0">
        <div className="w-12">
          {nav.showBack && (
            <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}
               className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-primary-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </a>
          )}
        </div>
        <h1 className="text-lg font-semibold truncate">{nav.title}</h1>
        <div className="w-12" />
      </nav>

      <main className={`flex-1 overflow-y-auto ${showTabBar ? 'pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<PlaceholderPage title="首页 Dashboard" />} />
          <Route path="/records" element={<PlaceholderPage title="加油记录列表" />} />
          <Route path="/records/new" element={<PlaceholderPage title="新增记录" />} />
          <Route path="/records/:id" element={<PlaceholderPage title="编辑记录" />} />
          <Route path="/stats" element={<PlaceholderPage title="统计" />} />
          <Route path="/settings" element={<PlaceholderPage title="设置" />} />
        </Routes>
      </main>
      {showTabBar && <TabBarPlaceholder />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
