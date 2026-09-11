import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Cpu, ScrollText, ArrowLeft, LogOut } from 'lucide-react';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/ai-config', label: 'AI Provider', icon: Cpu },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Log out of WealthWise?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-300 fixed inset-y-0 left-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-800">
          <Shield className="h-7 w-7 text-emerald-500" />
          <div>
            <div className="text-lg font-bold text-white leading-none">WealthWise</div>
            <div className="text-xs text-emerald-500 mt-0.5">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <div className="pt-4 pb-1 px-3 text-xs uppercase tracking-wider text-slate-600">App</div>
          <NavLink
            to="/app/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </NavLink>
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
              {(user?.fullName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <header className="md:hidden bg-slate-900 text-white h-14 flex items-center justify-between px-4 sticky top-0 z-40">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-500" />
            <span className="font-bold">Admin</span>
          </Link>
          <button onClick={handleLogout} className="text-slate-400" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <nav className="md:hidden bg-white border-b border-slate-200 overflow-x-auto sticky top-14 z-40">
          <div className="flex px-2 py-1.5 gap-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminShell;