import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Skeleton,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ContentCopy,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  Person,
  CalendarToday,
  School,
} from '@mui/icons-material';
import { ipfsService } from '../services/ipfsService';

const CertificateCard = React.memo(({ certificate, onReissue, showRecipient = true, compact = false }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      if (!certificate.tokenURI) {
        setLoading(false);
        return;
      }

      try {
        const data = await ipfsService.fetchMetadata(certificate.tokenURI);
        setMetadata(data);
      } catch (error) {
        console.error('Error loading metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [certificate.tokenURI]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAttributeValue = (traitType) => {
    if (!metadata?.attributes) return null;
    const attr = metadata.attributes.find(a => a.trait_type === traitType);
    return attr?.value;
  };

  if (loading) {
    return (
      <Card elevation={0}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card elevation={0}>
        <CardContent>
          <Typography color="error">Failed to load certificate metadata</Typography>
        </CardContent>
      </Card>
    );
  }

  const courseName = getAttributeValue('Course');
  const issuerName = getAttributeValue('Issuer');
  const studentName = getAttributeValue('Student');
  const completionDate = getAttributeValue('Date');

  return (
    <Card elevation={0} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="h3" fontWeight={600}>
                {courseName || 'Certificate'}
              </Typography>
              <Chip
                size="small"
                icon={certificate.isActive ? <CheckCircle /> : <Cancel />}
                label={certificate.isActive ? 'Active' : 'Inactive'}
                color={certificate.isActive ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>

            {!compact && (
              <>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <School fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {issuerName || 'Unknown Issuer'}
                  </Typography>
                </Box>

                {completionDate && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(completionDate)}
                    </Typography>
                  </Box>
                )}

                {showRecipient && (studentName || certificate.recipient) && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {studentName || 'No name'} • 
                    </Typography>
                    <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleCopy(certificate.recipient)}
                      >
                        {certificate.recipient.slice(0, 6)}...{certificate.recipient.slice(-4)}
                      </Typography>
                    </Tooltip>
                  </Box>
                )}
              </>
            )}

            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip 
                size="small" 
                label={`Token #${certificate.tokenId}`}
                variant="outlined"
              />
              
              {onReissue && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onReissue(metadata, certificate)}
                  startIcon={<ContentCopy />}
                >
                  Reissue
                </Button>
              )}

              <IconButton
                size="small"
                href={`https://sepolia.etherscan.io/token/${certificate.contractAddress || '0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186'}?a=${certificate.tokenId}`}
                target="_blank"
                rel="noopener"
              >
                <OpenInNew fontSize="small" />
              </IconButton>

              {!compact && (
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {!compact && (
          <Collapse in={expanded}>
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Certificate Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Current Owner:</strong> {certificate.currentOwner || certificate.recipient}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Token URI:</strong> {certificate.tokenURI}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Transaction:</strong>{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${certificate.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit' }}
                >
                  {certificate.transactionHash.slice(0, 10)}...
                </a>
              </Typography>
            </Box>
          </Collapse>
        )}
      </CardContent>
    </Card>
  );
});

CertificateCard.displayName = 'CertificateCard';

export default CertificateCard;