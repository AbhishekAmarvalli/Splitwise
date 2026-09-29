import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEME_COLORS = { light: '#f5f5f0', dark: '#0f0f0f' };

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    /* localStorage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  // The inline script in index.html already applied this to <html>, so reading
  // the same source here keeps React and the DOM in sync without a flash.
  const [theme, setTheme] = useState(getInitialTheme);
  // Whether the user has explicitly chosen a theme (vs. following the system).
  const [isExplicit, setIsExplicit] = useState(() => {
    try {
      return Boolean(localStorage.getItem('theme'));
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);

    if (isExplicit) {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        /* ignore */
      }
    }
  }, [theme, isExplicit]);

  // Until the user picks a theme, follow the OS setting live.
  useEffect(() => {
    if (isExplicit) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [isExplicit]);

  const toggleTheme = () => {
    setIsExplicit(true);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
