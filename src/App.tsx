import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/layout/NavBar';
import TabBar from './components/layout/TabBar';
import Dashboard from './routes/Dashboard';
import RecordList from './routes/RecordList';
import RecordForm from './routes/RecordForm';
import Vehicles from './routes/Vehicles';
import Stats from './routes/Stats';
import Settings from './routes/Settings';
import { seedIfEmpty } from './db/seed';

function AppLayout() {
  const location = useLocation();
  // 底部 TabBar 显示的页面
  const tabBarRoutes = ['/', '/records', '/vehicles', '/stats', '/settings'];
  const showTabBar = tabBarRoutes.includes(location.pathname);

  function getNavConfig(pathname: string) {
    if (pathname === '/') return { title: '我的油耗', showBack: false };
    if (pathname === '/records') return { title: '加油记录', showBack: false };
    if (pathname === '/records/new') return { title: '新增记录', showBack: true };
    if (pathname.startsWith('/records/') && pathname !== '/records/new')
      return { title: '编辑记录', showBack: true };
    if (pathname === '/vehicles') return { title: '车辆管理', showBack: false };
    if (pathname === '/vehicles/new') return { title: '添加车辆', showBack: true };
    if (pathname.startsWith('/vehicles/') && pathname !== '/vehicles/new')
      return { title: '编辑车辆', showBack: true };
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
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/new" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<Vehicles />} />
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
