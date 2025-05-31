import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Hero = ({ onNavigate, web3 }) => {
  const { isConnected, connect, isMinter } = web3;

  const features = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 56 }} />,
      title: 'Tamper-Proof Certificates',
      description: 'NFT certificates stored on blockchain ensure authenticity and prevent forgery.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 56 }} />,
      title: 'Secure & Decentralized',
      description: 'Built on Ethereum blockchain with smart contract security and access control.',
    },
    {
      icon: <PublicIcon sx={{ fontSize: 56 }} />,
      title: 'Publicly Verifiable',
      description: 'Anyone can verify certificate authenticity using the token ID or wallet address.',
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: 'calc(100vh - 80px)' }}>
      {/* Hero Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: { xs: 4, md: 8 },
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            {/* Left Content */}
            <Box sx={{ flex: 1, maxWidth: { md: '500px' } }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Blockchain-Verified
              </Typography>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'text.primary',
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }
                }}
              >
                Course Certificates
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Issue and verify tamper-proof educational credentials as NFTs on Ethereum blockchain
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={connect}
                    sx={{ 
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                    }}
                  >
                    Connect Wallet to Get Started
                  </Button>
                ) : (
                  <>
                    {isMinter && (
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onNavigate('issue')}
                        sx={{ 
                          px: 4,
                          py: 2,
                          fontSize: '1.1rem',
                        }}
                      >
                        Issue Certificate
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => onNavigate('verify')}
                      sx={{ 
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'primary.dark',
                          backgroundColor: 'rgba(11, 102, 194, 0.04)',
                        }
                      }}
                    >
                      Verify Certificate
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Right Content - Blue Card */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: { xs: 'center', md: 'flex-end' },
              width: '100%'
            }}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0B66C2 0%, #378fe9 100%)',
                  color: 'white',
                  textAlign: 'center',
                  width: { xs: '100%', sm: '400px' },
                  maxWidth: '400px',
                  boxShadow: '0 20px 40px rgba(11, 102, 194, 0.3)',
                }}
              >
                <SchoolIcon sx={{ fontSize: 100, mb: 3 }} />
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  LinkedIn Proof
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9 }}>
                  The future of professional credentials on blockchain
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Why LinkedIn Proof?
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontWeight: 400, maxWidth: 600, mx: 'auto' }}
            >
              The future of credential verification is decentralized
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            How It Works
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 4 }}>
                For Issuers
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { num: 1, text: 'Connect your MetaMask wallet with issuer permissions' },
                  { num: 2, text: 'Fill in certificate details including student address and course information' },
                  { num: 3, text: 'Click "Issue Certificate" to mint the NFT credential' },
                  { num: 4, text: 'Certificate is permanently stored on the Ethereum blockchain' }
                ].map((step) => (
                  <Box key={step.num} sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      {step.num}
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                      {step.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 4 }}>
                For Verifiers
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { num: 1, text: 'Enter the certificate token ID or student\'s wallet address' },
                  { num: 2, text: 'Click "Verify" to retrieve certificate details from blockchain' },
                  { num: 3, text: 'View course name, issuer, completion date, and student information' },
                  { num: 4, text: 'Optionally verify on Etherscan for additional blockchain confirmation' }
                ].map((step) => (
                  <Box key={step.num} sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      {step.num}
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                      {step.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;