import { createContext } from 'react';
import type { ThemeMode } from '../ThemeProvider';

export const ThemeContext = createContext({
  theme: 'light' as ThemeMode,
  toggleTheme: () => {},
});
