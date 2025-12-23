import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TreeView } from './pages/TreeView';
import { cleanupDuplicateRecentTrees } from './utils/recentTrees';

function RootRoute() {
  const [searchParams] = useSearchParams();
  const treeId = searchParams.get('id');
  
  if (treeId) {
    return <TreeView />;
  }
  
  return <LandingPage />;
}

function App() {
  // 清理重复项（自愈功能）- 在应用启动时运行一次
  useEffect(() => {
    cleanupDuplicateRecentTrees();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
