import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import AppShell from './components/layout/AppShell';
import AdminShell from './components/layout/AdminShell';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/app/Dashboard';
import Finances from './pages/app/Finances';
import WealthScorePage from './pages/app/WealthScorePage';
import StressTestPage from './pages/app/StressTestPage';
import GoalsPage from './pages/app/GoalsPage';
import AdvisorPage from './pages/app/AdvisorPage';
import SettingsPage from './pages/app/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AIConfigPage from './pages/admin/AIConfigPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public / Auth screens */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected user app screens */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="finances" element={<Finances />} />
          <Route path="wealth-score" element={<WealthScorePage />} />
          <Route path="stress-test" element={<StressTestPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="advisor" element={<AdvisorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Protected admin screens */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminShell />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="ai-config" element={<AIConfigPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;