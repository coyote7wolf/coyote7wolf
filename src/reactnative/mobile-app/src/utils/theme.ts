import {Theme} from '../types'

export const lightTheme: Theme = {
  colors: {
    primary: '#2196F3',
    secondary: '#FF9800',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    disabled: '#BDBDBD',
    info: '#2196F3',
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 22,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 18,
    },
  },
}

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#2196F3',
    secondary: '#FF9800',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    disabled: '#666666',
    info: '#2196F3',
  },
}
