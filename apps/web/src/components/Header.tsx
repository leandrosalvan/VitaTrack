import { Sun, Moon, LogOut } from 'lucide-react';
import { useThemeStore } from '../store/themeStore.js';
import { useAuthStore } from '../store/authStore.js';

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight text-primary-600 dark:text-primary-400">
          VitaTrack
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={logout}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-red-500"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
