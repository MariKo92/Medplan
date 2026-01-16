/**
 * Material-UI theme configuration.
 * Uses MUI defaults with minimal customization for MVP.
 */

import { createTheme } from '@mui/material/styles';
import { nbNO } from '@mui/material/locale';

export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      error: {
        main: '#f44336',
      },
      warning: {
        main: '#ff9800',
      },
      success: {
        main: '#4caf50',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
        },
      },
    },
  },
  nbNO
);
