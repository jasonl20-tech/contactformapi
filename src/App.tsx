import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import FormCreate from './pages/FormCreate';
import FormDetail from './pages/FormDetail';
import FormSettings from './pages/FormSettings';
import Billing from './pages/Billing';
import SettingsPage from './pages/SettingsPage';
import Members from './pages/Members';
import WorkspaceCreate from './pages/WorkspaceCreate';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/forms/new" element={<FormCreate />} />
              <Route path="/forms/:formId" element={<FormDetail />} />
              <Route path="/forms/:formId/settings" element={<FormSettings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/members" element={<Members />} />
              <Route path="/workspaces/new" element={<WorkspaceCreate />} />
            </Route>
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
