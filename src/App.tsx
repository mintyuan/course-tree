import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TreeView } from './pages/TreeView';

function RootRoute() {
  const [searchParams] = useSearchParams();
  const treeId = searchParams.get('id');
  
  if (treeId) {
    return <TreeView />;
  }
  
  return <LandingPage />;
}

function App() {
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
