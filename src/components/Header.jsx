import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Header = ({ onNavigate, web3, currentView }) => {
  const { account, isConnected, connect, isMinter } = web3;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, height: 80 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            onClick={() => onNavigate('home')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '4px',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              LinkedIn Proof
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            startIcon={<VerifiedUserIcon />}
            onClick={() => onNavigate('verify')}
            sx={{
              color: currentView === 'verify' ? 'primary.main' : 'text.secondary',
              fontWeight: currentView === 'verify' ? 600 : 400,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
              borderRadius: '4px',
              px: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2">Verify</Typography>
            </Box>
          </Button>
          
          {isMinter && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => onNavigate('dashboard')}
                sx={{
                  color: currentView === 'dashboard' ? 'primary.main' : 'text.secondary',
                  fontWeight: currentView === 'dashboard' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  borderRadius: '4px',
                  px: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2">Dashboard</Typography>
                </Box>
              </Button>
              <Button
                startIcon={<AddCircleIcon />}
                onClick={() => onNavigate('issue')}
                sx={{
                  color: currentView === 'issue' ? 'primary.main' : 'text.secondary',
                  fontWeight: currentView === 'issue' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  borderRadius: '4px',
                  px: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2">Issue</Typography>
                </Box>
              </Button>
            </>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                }}
              >
                <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>
                  Connected
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {formatAddress(account)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={connect}
              sx={{ 
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;