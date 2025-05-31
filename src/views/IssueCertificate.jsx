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
  Link,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SendIcon from '@mui/icons-material/Send';
import { web3Service } from '../services/web3Service';
import { ipfsService } from '../services/ipfsService';

const IssueCertificate = ({ web3 }) => {
  const { isConnected, isMinter, account } = web3;
  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    courseName: '',
    issuerName: '',
    completionDate: new Date(),
    expirationDate: null,
    verificationUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, completionDate: date });
  };

  const handleExpirationDateChange = (date) => {
    setFormData({ ...formData, expirationDate: date });
  };

  const validateForm = () => {
    if (!formData.studentAddress) {
      setError('Student wallet address is required');
      return false;
    }
    if (!formData.studentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid wallet address format');
      return false;
    }
    if (!formData.courseName) {
      setError('Course name is required');
      return false;
    }
    if (!formData.issuerName) {
      setError('Issuer name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Upload metadata to IPFS
      const ipfsUrl = await ipfsService.uploadMetadata({
        courseName: formData.courseName,
        issuer: formData.issuerName,
        studentName: formData.studentName,
        completionDate: formData.completionDate,
        expirationDate: formData.expirationDate,
        verificationUrl: formData.verificationUrl || window.location.origin,
      });

      // Issue certificate on blockchain
      const result = await web3Service.issueCertificate(
        formData.studentAddress,
        ipfsUrl
      );

      setSuccess({
        tokenId: result.tokenId,
        txHash: result.transactionHash,
      });

      // Clear form
      setFormData({
        studentAddress: '',
        studentName: '',
        courseName: '',
        issuerName: '',
        completionDate: new Date(),
        expirationDate: null,
        verificationUrl: '',
      });
    } catch (err) {
      console.error('Error issuing certificate:', err);
      setError(err.message || 'Failed to issue certificate');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Please connect your wallet to issue certificates.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isMinter) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Your wallet address ({account}) does not have issuer permissions.
            Please contact an administrator to grant you the MINTER_ROLE.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Issue Certificate
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem' }}>
        Create a blockchain-verified certificate for course completion
      </Typography>
      
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Student Wallet Address"
                value={formData.studentAddress}
                onChange={handleChange('studentAddress')}
                required
                disabled={isLoading}
                helperText="The Ethereum address that will receive the certificate NFT"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Student Name (Optional)"
                value={formData.studentName}
                onChange={handleChange('studentName')}
                disabled={isLoading}
                helperText="Student's name for the certificate"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Course Name"
                value={formData.courseName}
                onChange={handleChange('courseName')}
                required
                disabled={isLoading}
                helperText="e.g., Blockchain 101, Smart Contract Development"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Issuer Name"
                value={formData.issuerName}
                onChange={handleChange('issuerName')}
                required
                disabled={isLoading}
                helperText="Your institution or organization name"
                variant="outlined"
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Completion Date"
                  value={formData.completionDate}
                  onChange={handleDateChange}
                  disabled={isLoading}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiration Date (Optional)"
                  value={formData.expirationDate}
                  onChange={handleExpirationDateChange}
                  disabled={isLoading}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  sx={{ width: '100%' }}
                  minDate={formData.completionDate}
                  helperText="Leave blank for certificates that don't expire"
                />
              </LocalizationProvider>

              <TextField
                fullWidth
                label="Verification URL (Optional)"
                value={formData.verificationUrl}
                onChange={handleChange('verificationUrl')}
                disabled={isLoading}
                helperText="External link for additional verification"
                variant="outlined"
              />
            </Box>

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
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 4, py: 2, fontSize: '1.1rem' }}
            >
              {isLoading ? 'Issuing Certificate...' : 'Issue Certificate'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!success}
        autoHideDuration={null}
        onClose={() => setSuccess(null)}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ width: '100%' }}
        >
          <Typography variant="body1" gutterBottom>
            Certificate issued successfully!
          </Typography>
          <Typography variant="body2">
            Token ID: {success?.tokenId}
          </Typography>
          <Link
            href={`https://sepolia.etherscan.io/tx/${success?.txHash}`}
            target="_blank"
            rel="noopener"
          >
            View on Etherscan
          </Link>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssueCertificate;