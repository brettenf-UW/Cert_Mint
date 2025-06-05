import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Link,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { web3Service } from '../services/web3Service';
import { ipfsService } from '../services/ipfsService';

const VerifyCertificate = () => {
  const [searchType, setSearchType] = useState('tokenId');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificates, setCertificates] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue) {
      setError('Please enter a value to search');
      return;
    }

    setIsLoading(true);
    setError('');
    setCertificates([]);

    try {
      // Ensure web3 service is connected
      if (!await web3Service.isConnected()) {
        await web3Service.connectWallet();
      }

      let results = [];

      if (searchType === 'tokenId') {
        // Search by token ID
        try {
          const details = await web3Service.getCertificateDetails(searchValue);
          const metadata = await ipfsService.fetchMetadata(details.tokenURI);
          
          results = [{
            tokenId: searchValue,
            owner: details.owner,
            metadata: metadata,
            tokenURI: details.tokenURI,
          }];
        } catch (err) {
          throw new Error('Certificate not found or invalid token ID');
        }
      } else {
        // Search by wallet address
        if (!searchValue.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid wallet address format');
        }

        const certs = await web3Service.getCertificatesByOwner(searchValue);
        
        if (certs.length === 0) {
          throw new Error('No certificates found for this address');
        }
        
        // Batch fetch metadata for better performance
        const metadataPromises = certs.map(cert => 
          ipfsService.fetchMetadata(cert.tokenURI)
            .then(metadata => ({
              tokenId: cert.tokenId,
              owner: searchValue,
              metadata: metadata,
              tokenURI: cert.tokenURI,
            }))
            .catch(err => {
              console.error(`Failed to fetch metadata for token ${cert.tokenId}:`, err);
              return null;
            })
        );
        
        const metadataResults = await Promise.all(metadataPromises);
        results = metadataResults.filter(result => result !== null);
      }

      setCertificates(results);
    } catch (err) {
      console.error('Error searching certificates:', err);
      setError(err.message || 'Failed to search certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAttributeValue = (attributes, traitType) => {
    const attr = attributes?.find(a => a.trait_type === traitType);
    return attr?.value || 'N/A';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Verify Certificate
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem' }}>
        Enter a token ID or wallet address to verify certificate authenticity
      </Typography>
      
      <Card elevation={0} sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box component="form" onSubmit={handleSearch}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Search by</FormLabel>
              <RadioGroup
                row
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <FormControlLabel 
                  value="tokenId" 
                  control={<Radio />} 
                  label="Token ID" 
                />
                <FormControlLabel 
                  value="address" 
                  control={<Radio />} 
                  label="Wallet Address" 
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label={searchType === 'tokenId' ? 'Enter Token ID' : 'Enter Wallet Address'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              margin="normal"
              disabled={isLoading}
              placeholder={searchType === 'tokenId' ? '1' : '0x...'}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ mt: 4, py: 2, fontSize: '1.1rem' }}
            >
              {isLoading ? 'Searching...' : 'Verify Certificate'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {certificates.map((cert) => (
        <Card key={cert.tokenId} elevation={0} sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {(() => {
                const expirationDate = getAttributeValue(cert.metadata?.attributes, 'Expiration Date');
                const isExpired = expirationDate !== 'N/A' && new Date(expirationDate * 1000) < new Date();
                
                return (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    backgroundColor: isExpired ? '#fee' : '#e7f3e7',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}>
                    <VerifiedIcon sx={{ color: isExpired ? '#d32f2f' : '#0f5132', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isExpired ? '#d32f2f' : '#0f5132' }}>
                      {isExpired ? 'Expired Certificate' : 'Verified Certificate'}
                    </Typography>
                  </Box>
                );
              })()}
              <Chip 
                label={`Token #${cert.tokenId}`} 
                size="small" 
                sx={{ ml: 'auto', fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Course Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {getAttributeValue(cert.metadata?.attributes, 'Course')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Issued By
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {getAttributeValue(cert.metadata?.attributes, 'Issuer')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Student Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {getAttributeValue(cert.metadata?.attributes, 'Student')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Completion Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {formatDate(getAttributeValue(cert.metadata?.attributes, 'Date'))}
                </Typography>
              </Box>

              {getAttributeValue(cert.metadata?.attributes, 'Expiration Date') !== 'N/A' && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Expiration Date
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500, 
                      mt: 0.5,
                      color: new Date(getAttributeValue(cert.metadata?.attributes, 'Expiration Date') * 1000) < new Date() ? 'error.main' : 'text.primary'
                    }}
                  >
                    {formatDate(getAttributeValue(cert.metadata?.attributes, 'Expiration Date'))}
                    {new Date(getAttributeValue(cert.metadata?.attributes, 'Expiration Date') * 1000) < new Date() && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'error.main' }}>
                        (Expired)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              )}

              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Owner Address
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mt: 0.5 }}>
                  {cert.owner}
                </Typography>
              </Box>

              {cert.metadata?.external_url && !cert.metadata.external_url.includes('linkedinproof.app') && (
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Verification Link
                  </Typography>
                  <Link
                    href={cert.metadata.external_url}
                    target="_blank"
                    rel="noopener"
                    sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                  >
                    {cert.metadata.external_url}
                    <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Link>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                href={`https://sepolia.etherscan.io/token/0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186?a=${cert.tokenId}`}
                target="_blank"
                startIcon={<OpenInNewIcon />}
              >
                View on Etherscan
              </Button>
              {cert.tokenURI && (
                <Button
                  variant="outlined"
                  size="small"
                  href={cert.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                  target="_blank"
                  startIcon={<OpenInNewIcon />}
                >
                  View Metadata
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {certificates.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Enter a token ID or wallet address to verify a certificate
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default VerifyCertificate;