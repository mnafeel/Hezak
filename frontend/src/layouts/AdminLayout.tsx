import { useLayoutEffect, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuth';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';
import { applyTheme } from '../store/theme';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { email, clearAuth } = useAdminAuthStore();
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const basePath = `/${adminSlug ?? 'admin'}`;

  // Ensure admin pages always use dark theme - apply synchronously and continuously
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      applyTheme('dark');
    }
  }, []);

  // Also apply on every render to prevent theme changes from affecting admin
  useEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      applyTheme('dark');
    }
  });

  // Listen for theme changes and immediately revert to dark for admin
  useEffect(() => {
    const handleThemeChange = () => {
      if (typeof window !== 'undefined' && document.documentElement) {
        applyTheme('dark');
      }
    };
    
    // Check periodically to ensure dark theme is maintained
    const interval = setInterval(handleThemeChange, 100);
    
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: `${basePath}/dashboard`, label: 'Dashboard' },
    { to: `${basePath}/products`, label: 'Products' },
    { to: `${basePath}/categories`, label: 'Categories' },
    { to: `${basePath}/banners`, label: 'Banners' },
    { to: `${basePath}/users`, label: 'Users' },
    { to: `${basePath}/orders`, label: 'Orders' },
    { to: `${basePath}/reports`, label: 'Reports' },
    { to: `${basePath}/settings`, label: 'Settings' }
  ];

  const handleLogout = () => {
    clearAuth();
    navigate(`${basePath}/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-8 px-6 py-10 md:px-10">
        <aside className="glass-panel hidden w-72 flex-shrink-0 flex-col gap-10 p-6 md:flex">
          <div>
            <p className="font-display text-2xl font-semibold text-white">Hezak Admin</p>
            <p className="text-sm text-slate-300">Manage the boutique experience</p>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10',
                    isActive && 'bg-white/10 text-white'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-3 text-sm text-slate-300">
            <p>Signed in as</p>
            <p className="font-semibold text-white">{email}</p>
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </aside>
        <div className="flex flex-1 flex-col gap-8">
          <header className="glass-panel flex items-center justify-between rounded-3xl p-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-brand-200">Admin Console</p>
              <h1 className="text-3xl font-semibold text-white">Manage Hezak Boutique</h1>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              {email}
            </div>
          </header>
          <main className="flex-1 pb-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

