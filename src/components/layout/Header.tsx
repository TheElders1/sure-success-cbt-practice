import { Link } from 'react-router-dom';
import { Moon, Sun, LogOut, User, Shield } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '../ui/Button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = 'Sure Success CBT', subtitle }: HeaderProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="relative bg-gradient-to-r from-brand-primary to-brand-hover text-white shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to={user ? '/home' : '/'} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/ELD.png"
              alt="Logo"
              className="h-12 w-12 object-cover rounded-full"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-white hover:bg-white/10"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {user && (
              <>
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Shield size={16} />}
                    className="text-white hover:bg-white/10"
                  >
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  <User size={16} />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut size={16} />}
                  className="text-white hover:bg-white/10"
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
