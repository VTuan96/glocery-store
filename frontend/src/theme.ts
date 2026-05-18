import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#00695C',      // Deep Teal
      light: '#4DB6AC',     // Teal 300
    },
    success: {
      main: '#2E7D32',      // Forest Green
    },
    warning: {
      main: '#F57C00',      // Amber — debt/pending
    },
    error: {
      main: '#C62828',      // Deep Red — errors only
    },
    background: {
      default: '#FAFAF8',   // Warm White
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#616161',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 18,
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { fontSize: '1rem', fontWeight: 700 },
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          overflow: 'hidden',
        },
        body: {
          height: '100%',
          overflow: 'hidden',
          margin: 0,
        },
        '#root': {
          height: '100%',
          overflow: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 8,
          textTransform: 'none',
        },
        sizeLarge: {
          minHeight: 64,
          fontSize: '1.125rem',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { minHeight: 48 },
      },
    },
  },
})
