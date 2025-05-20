import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import type { ColorScheme } from '../types/todo';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorSchemes = {
  sunset: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#FFE66D',
    text: '#2C3E50',
    accent: '#FF8B94'
  },
  ocean: {
    primary: '#1A535C',
    secondary: '#4ECDC4',
    background: '#F7FFF7',
    text: '#2C3E50',
    accent: '#FF6B6B'
  },
  forest: {
    primary: '#2D6A4F',
    secondary: '#74C69D',
    background: '#D8F3DC',
    text: '#1B4332',
    accent: '#40916C'
  },
  lavender: {
    primary: '#6B4E71',
    secondary: '#C98BB9',
    background: '#F2E5F7',
    text: '#4A4453',
    accent: '#9B6B9E'
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const savedScheme = localStorage.getItem('colorScheme');
    return (savedScheme as ColorScheme) || 'ocean';
  });

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
  }, [colorScheme]);

  const muiTheme = createTheme({
    palette: {
      primary: {
        main: colorSchemes[colorScheme].primary,
      },
      secondary: {
        main: colorSchemes[colorScheme].secondary,
      },
      background: {
        default: colorSchemes[colorScheme].background,
        paper: '#FFFFFF',
      },
      text: {
        primary: colorSchemes[colorScheme].text,
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
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