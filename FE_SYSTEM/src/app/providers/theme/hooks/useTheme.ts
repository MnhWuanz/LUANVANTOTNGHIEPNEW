import { useContext } from 'react';
import { ThemeContext } from '@/app/providers/theme/context/theme-context';

export const useTheme = () => useContext(ThemeContext);
