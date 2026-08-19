import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './theme-context';

const STORAGE_KEY = 'driveshare-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Suppress transitions across the swap, committing each step so the new
    // colours are painted directly instead of being animated (see index.css).
    root.classList.add('theme-switching');
    void root.offsetHeight;

    root.classList.toggle('dark', theme === 'dark');
    void root.offsetHeight;

    window.localStorage.setItem(STORAGE_KEY, theme);

    // setTimeout rather than rAF: rAF never fires in a backgrounded tab, which
    // would leave transitions disabled until the tab is looked at again.
    const timer = window.setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 0);

    return () => window.clearTimeout(timer);
  }, [theme]);

  // Follow the OS only while the user hasn't picked a theme themselves.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (event) => {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
      setTheme(event.matches ? 'light' : 'dark');
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
