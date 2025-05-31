import React, { useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress } from '@mui/material';
import { theme } from './theme/theme';
import Header from './components/Header';
import VerifyFAB from './components/VerifyFAB';
import Hero from './views/Hero';
import { useWeb3 } from './hooks/useWeb3';

// Lazy load heavy components
const IssueCertificate = lazy(() => import('./views/IssueCertificate'));
const VerifyCertificate = lazy(() => import('./views/VerifyCertificate'));
const IssuerDashboard = lazy(() => import('./views/IssuerDashboard'));

function App() {
  const [currentView, setCurrentView] = useState('home');
  const web3 = useWeb3();

  const renderView = () => {
    switch (currentView) {
      case 'issue':
        return <IssueCertificate web3={web3} />;
      case 'verify':
        return <VerifyCertificate />;
      case 'dashboard':
        return <IssuerDashboard web3={web3} onNavigate={setCurrentView} />;
      default:
        return <Hero onNavigate={setCurrentView} web3={web3} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          onNavigate={setCurrentView} 
          web3={web3}
          currentView={currentView}
        />
        <Box component="main" sx={{ flexGrow: 1, pt: '80px', mt: '-80px' }}>
          {currentView === 'home' ? (
            renderView()
          ) : (
            <Container maxWidth="lg" sx={{ py: 6 }}>
              <Suspense 
                fallback={
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                  </Box>
                }
              >
                {renderView()}
              </Suspense>
            </Container>
          )}
        </Box>
        <VerifyFAB onNavigate={setCurrentView} currentView={currentView} />
      </Box>
    </ThemeProvider>
  );
}

export default App
