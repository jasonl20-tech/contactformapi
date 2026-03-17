import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Users,
  Plus,
  Building2,
  ChevronRight,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const {
    workspaces,
    currentWorkspace,
    isPersonal,
    switchWorkspace,
    setPersonalMode,
    account,
    can,
  } = useWorkspace();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wsMenuOpen, setWsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', always: true },
    { to: '/forms', icon: FileText, label: 'Forms', always: true },
    { to: '/billing', icon: CreditCard, label: 'Billing', always: !isPersonal && can('manageBilling') },
    { to: '/members', icon: Users, label: 'Members', always: !isPersonal },
    { to: '/settings', icon: Settings, label: 'Settings', always: true },
  ].filter(item => item.always);

  const activeName = isPersonal
    ? 'Personal'
    : currentWorkspace?.teamName || 'Workspace';

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="font-bold text-gray-900">ContactFormAPI</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setWsMenuOpen(!wsMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition border border-gray-200"
            >
              <div className="h-7 w-7 bg-primary-100 rounded-md flex items-center justify-center shrink-0">
                {isPersonal ? (
                  <User className="h-3.5 w-3.5 text-primary-600" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-primary-600" />
                )}
              </div>
              <span className="flex-1 text-left font-medium text-gray-900 truncate">{activeName}</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition ${wsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {wsMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setWsMenuOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setPersonalMode(); setWsMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${isPersonal ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="flex-1 text-left">Personal</span>
                    {isPersonal && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  {workspaces.length > 0 && (
                    <div className="border-t border-gray-100">
                      <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Workspaces</p>
                      {workspaces.map((ws) => (
                        <button
                          key={ws.teamId}
                          onClick={() => { switchWorkspace(ws.teamId); setWsMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${account === ws.teamId ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="flex-1 text-left truncate">{ws.teamName}</span>
                          <span className="text-xs text-gray-400 capitalize">{ws.role}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100">
                    <Link
                      to="/workspaces/new"
                      onClick={() => setWsMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Workspace</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-600 mr-4">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{activeName}</span>
              {!isPersonal && currentWorkspace && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs capitalize">{currentWorkspace.role}</span>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
