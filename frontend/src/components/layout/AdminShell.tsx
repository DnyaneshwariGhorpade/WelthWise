import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, Cpu, ScrollText, ArrowLeft, LogOut, Sun, Moon } from 'lucide-react';

const adminNav = [
  { to: '/admin/dashboard', label: 'Platform Metrics', icon: LayoutDashboard },
  { to: '/admin/ai-config', label: 'AI Provider Config', icon: Cpu },
  { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ScrollText },
];

function AdminShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Log out of WealthWise Admin Console?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#EAE6DF] flex selection:bg-[#121212] selection:text-white dark:selection:bg-white dark:selection:text-[#121212] transition-colors">
      {/* Desktop Sidebar (Passero Admin Luxury Noir) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#141210] text-[#B5AEA4] fixed inset-y-0 left-0 border-r border-[#26221E] z-30">
        
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#26221E]">
          <div className="w-8 h-8 rounded-full bg-[#C59B55] text-[#141210] flex items-center justify-center font-editorial text-base italic font-bold">
            W
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight leading-none">WealthWise</div>
            <div className="text-[10px] uppercase tracking-widest text-[#C59B55] mt-1 font-semibold">Admin Console</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {adminNav.map((item) => (
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

          <div className="pt-5 mt-2 border-t border-[#26221E]/60">
            <div className="px-3.5 pb-2 text-[10px] uppercase tracking-widest text-[#666056] font-semibold">
              Client Experience
            </div>
            <NavLink
              to="/app/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#9E978E] hover:bg-white/[0.04] hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span>Back to App Portal</span>
            </NavLink>
          </div>
        </nav>

        {/* Admin Card & Actions */}
        <div className="p-4 border-t border-[#26221E] bg-[#100E0C]">
          <div className="flex items-center justify-between mb-3 px-2">
             <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-xs font-medium text-[#9E978E] hover:text-white transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
             >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
             </button>
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-[#C59B55] text-[#141210] flex items-center justify-center text-xs font-bold">
              {(user?.fullName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[11px] text-[#C59B55] truncate font-mono-nums">ADMINISTRATOR</div>
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
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#C59B55] text-[#141210] flex items-center justify-center font-editorial text-sm italic font-bold">
              W
            </div>
            <span className="font-bold text-sm">Admin Console</span>
          </Link>
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="text-[#9E978E] hover:text-white">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
             </button>
             <button onClick={handleLogout} className="text-[#9E978E] hover:text-white" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
             </button>
          </div>
        </header>

        {/* Mobile Sub-Navigation Bar */}
        <nav className="md:hidden bg-white dark:bg-[#1A1A1A] border-b border-[#EAE6DF] dark:border-[#333] overflow-x-auto sticky top-16 z-40 px-3 py-2 transition-colors">
          <div className="flex gap-1.5 min-w-max">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212]' : 'text-[#5A554E] dark:text-[#9E978E] hover:bg-[#F5F2EB] dark:hover:bg-[#2A2A2A]'
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

export default AdminShell;