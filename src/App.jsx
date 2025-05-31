import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { theme } from './theme/theme';
import Header from './components/Header';
import Hero from './views/Hero';
import IssueCertificate from './views/IssueCertificate';
import VerifyCertificate from './views/VerifyCertificate';
import IssuerDashboard from './views/IssuerDashboard';
import { useWeb3 } from './hooks/useWeb3';

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
              {renderView()}
            </Container>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
