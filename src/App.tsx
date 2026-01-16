/**
 * Main App component with routing and layout.
 */

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { Medication, CalendarMonth, Settings as SettingsIcon } from '@mui/icons-material';
import { theme } from './theme/theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DrugLibrary } from './pages/DrugLibrary';
import { TaperingPlanner } from './pages/TaperingPlanner';
import { Settings } from './pages/Settings';
import { TEXT } from './constants/text';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {TEXT.app.title}
          </Typography>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ backgroundColor: 'primary.dark' }}
        >
          <Tab
            icon={<Medication />}
            label={TEXT.navigation.drugLibrary}
            component={Link}
            to="/drugs"
            aria-label={TEXT.navigation.drugLibrary}
          />
          <Tab
            icon={<CalendarMonth />}
            label={TEXT.navigation.taperingPlanner}
            component={Link}
            to="/tapering"
            aria-label={TEXT.navigation.taperingPlanner}
          />
          <Tab
            icon={<SettingsIcon />}
            label={TEXT.navigation.settings}
            component={Link}
            to="/settings"
            aria-label={TEXT.navigation.settings}
          />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Alert severity="warning" sx={{ mb: 3 }} role="alert">
          <strong>{TEXT.app.disclaimer}</strong>
        </Alert>

        <Routes>
          <Route path="/drugs" element={<DrugLibrary />} />
          <Route path="/tapering" element={<TaperingPlanner />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/drugs" replace />} />
        </Routes>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          {TEXT.app.disclaimerFull}
        </Typography>
      </Box>
    </Box>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
