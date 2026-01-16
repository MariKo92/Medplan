/**
 * Error Boundary component for graceful error handling.
 */

import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { TEXT } from '../constants/text';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              {TEXT.common.error}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              En uventet feil oppstod. Vennligst prøv igjen.
            </Typography>
            {this.state.error && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 3,
                  fontFamily: 'monospace',
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
            <Button onClick={this.handleReset} variant="contained">
              Prøv igjen
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
