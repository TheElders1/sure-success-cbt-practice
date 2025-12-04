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
    <header className="bg-gradient-to-r from-brand-primary to-brand-hover text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
