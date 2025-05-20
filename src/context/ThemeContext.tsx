import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import type { ThemeMode } from '../types/todo';

interface ThemeContextType {
  theme: ThemeMode;
  colorTheme: string;
  toggleTheme: () => void;
  setColorTheme: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes = {
  blue: '#1976d2',
  green: '#2e7d32',
  purple: '#9c27b0',
  orange: '#f57c00',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeMode) || 'light';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColor = localStorage.getItem('colorTheme');
    return savedColor || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: colorThemes[colorTheme as keyof typeof colorThemes],
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 