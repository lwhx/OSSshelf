import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Files from './pages/Files';
import Shares from './pages/Shares';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/files" replace />} />
        <Route path="/files" element={<Files />} />
        <Route path="/files/:folderId" element={<Files />} />
        <Route path="/shares" element={<Shares />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}

export default App;
