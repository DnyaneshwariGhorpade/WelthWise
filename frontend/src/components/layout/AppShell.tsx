import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  Gauge,
  Activity,
  Target,
  MessagesSquare,
  Settings,
  LogOut,
  PanelRight,
} from 'lucide-react';

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/finances', label: 'Finances', icon: Wallet },
  { to: '/app/wealth-score', label: 'Wealth Score', icon: Gauge },
  { to: '/app/stress-test', label: 'Stress Test', icon: Activity },
  { to: '/app/goals', label: 'Goals & Conflicts', icon: Target },
  { to: '/app/advisor', label: 'AI Advisor', icon: MessagesSquare },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Log out of your WealthWise private session?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#121212] flex selection:bg-[#121212] selection:text-white">
      {/* Desktop Sidebar (Passero Luxury Boutique Noir) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#141210] text-[#B5AEA4] fixed inset-y-0 left-0 border-r border-[#26221E] z-30">
        
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#26221E]">
          <div className="w-8 h-8 rounded-full bg-white text-[#121212] flex items-center justify-center font-editorial text-base italic font-bold">
            W
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight leading-none">WealthWise</div>
            <div className="text-[10px] uppercase tracking-widest text-[#7A746B] mt-1">Private Client</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-xs border border-white/10'
                    : 'text-[#9E978E] hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <div className="pt-5 mt-2 border-t border-[#26221E]/60">
              <div className="px-3.5 pb-2 text-[10px] uppercase tracking-widest text-[#666056] font-semibold">
                Governance
              </div>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold border border-white/10'
                      : 'text-[#9E978E] hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                <PanelRight className="h-4 w-4 shrink-0 text-[#C59B55]" />
                <span className="text-[#C59B55]">Admin Console</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#26221E] bg-[#100E0C]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-[#26221E] text-white flex items-center justify-center text-xs font-bold border border-white/10">
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[11px] text-[#7A746B] truncate font-mono-nums">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#9E978E] hover:bg-white/[0.05] hover:text-[#E06C60] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-[#141210] text-white h-16 flex items-center justify-between px-5 sticky top-0 z-40 border-b border-[#26221E]">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white text-[#121212] flex items-center justify-center font-editorial text-sm italic font-bold">
              W
            </div>
            <span className="font-bold text-sm">WealthWise</span>
          </Link>
          <button onClick={handleLogout} className="text-[#9E978E] hover:text-white" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Mobile Sub-Navigation Bar */}
        <nav className="md:hidden bg-white border-b border-[#EAE6DF] overflow-x-auto sticky top-16 z-40 px-3 py-2">
          <div className="flex gap-1.5 min-w-max">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-[#121212] text-white' : 'text-[#5A554E] hover:bg-[#F5F2EB]'
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Routed Sub-pages */}
        <main className="flex-1 p-5 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;