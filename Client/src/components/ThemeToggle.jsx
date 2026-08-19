import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="relative"
    >
      <Sun
        className={`absolute transition-transform duration-200 ${
          isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
        }`}
      />
      <Moon
        className={`absolute transition-transform duration-200 ${
          isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
        }`}
      />
    </Button>
  );
};

export default ThemeToggle;
