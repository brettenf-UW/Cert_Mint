import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  Button,
  Pagination,
} from '@mui/material';
import {
  Search,
  ViewList,
  ViewModule,
  TrendingUp,
  People,
  School,
  Assignment,
  Refresh,
} from '@mui/icons-material';
import { web3Service } from '../services/web3Service';
import { ipfsService } from '../services/ipfsService';
import CertificateCard from '../components/CertificateCard';

const IssuerDashboard = ({ web3, onNavigate }) => {
  const { isConnected, isMinter, account } = web3;
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [filteredCerts, setFilteredCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [tabValue, setTabValue] = useState(0);
  const [courseMetadata, setCourseMetadata] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (isConnected && isMinter && account) {
      loadIssuedCertificates();
    }
  }, [isConnected, isMinter, account]);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, tabValue]);

  const loadIssuedCertificates = async () => {
    setLoading(true);
    try {
      const { certificates: certs, courseStats: stats } = await web3Service.getCertificatesIssuedBy(account);
      setCertificates(certs);
      setCourseStats(stats);

      // Load metadata for unique courses
      const uniqueURIs = [...new Set(certs.map(c => c.tokenURI).filter(Boolean))];
      const metadataMap = {};
      
      for (const uri of uniqueURIs) {
        try {
          const metadata = await ipfsService.fetchMetadata(uri);
          metadataMap[uri] = metadata;
        } catch (error) {
          console.error('Error loading metadata for', uri, error);
        }
      }
      
      setCourseMetadata(metadataMap);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert => {
        const metadata = courseMetadata[cert.tokenURI];
        if (!metadata) return false;
        
        const courseName = metadata.attributes?.find(a => a.trait_type === 'Course')?.value || '';
        const studentName = metadata.attributes?.find(a => a.trait_type === 'Student')?.value || '';
        
        return (
          courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.tokenId.includes(searchTerm)
        );
      });
    }

    // Filter by tab
    if (tabValue === 1) {
      // Active certificates only
      filtered = filtered.filter(cert => cert.isActive);
    } else if (tabValue === 2) {
      // Inactive certificates only
      filtered = filtered.filter(cert => !cert.isActive);
    }

    setFilteredCerts(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleReissue = (metadata, originalCert) => {
    // Navigate to issue page with pre-filled data
    const courseData = {
      courseName: metadata.attributes?.find(a => a.trait_type === 'Course')?.value || '',
      issuerName: metadata.attributes?.find(a => a.trait_type === 'Issuer')?.value || '',
      externalUrl: metadata.external_url || '',
    };
    
    // Store in sessionStorage to pre-fill the form
    sessionStorage.setItem('reissueTemplate', JSON.stringify(courseData));
    onNavigate('issue');
  };

  const getUniqueCoursesCount = () => {
    return Object.keys(courseStats).length;
  };

  const getTotalActiveCount = () => {
    return Object.values(courseStats).reduce((sum, stat) => sum + stat.count, 0);
  };

  const getMostPopularCourse = () => {
    let maxCount = 0;
    let popularCourse = null;
    
    Object.entries(courseStats).forEach(([uri, stat]) => {
      if (stat.count > maxCount) {
        maxCount = stat.count;
        const metadata = courseMetadata[uri];
        popularCourse = metadata?.attributes?.find(a => a.trait_type === 'Course')?.value || 'Unknown';
      }
    });
    
    return { name: popularCourse, count: maxCount };
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Please connect your wallet to view your issued certificates.
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
            Your wallet address does not have issuer permissions.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  const popularCourse = getMostPopularCourse();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h2" component="h1" fontWeight={700}>
          Issuer Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadIssuedCertificates}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Assignment color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Issued
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {certificates.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <People color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Active Certificates
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {getTotalActiveCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <School color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Unique Courses
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {getUniqueCoursesCount()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Most Popular
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600} noWrap>
                {popularCourse.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {popularCourse.count} certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Course Statistics */}
      <Card elevation={0} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Course Statistics
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(courseStats).map(([uri, stat]) => {
              const metadata = courseMetadata[uri];
              const courseName = metadata?.attributes?.find(a => a.trait_type === 'Course')?.value || 'Unknown';
              
              return (
                <Chip
                  key={uri}
                  label={`${courseName} (${stat.count})`}
                  variant="outlined"
                  onClick={() => setSearchTerm(courseName)}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={`All (${certificates.length})`} />
            <Tab label={`Active (${certificates.filter(c => c.isActive).length})`} />
            <Tab label={`Inactive (${certificates.filter(c => !c.isActive).length})`} />
          </Tabs>
          
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {filteredCerts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              {searchTerm 
                ? 'No certificates match your search' 
                : certificates.length === 0 
                  ? 'No certificates issued yet'
                  : tabValue === 2 
                    ? 'No inactive certificates'
                    : 'No active certificates'}
            </Typography>
            {!searchTerm && certificates.length === 0 && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => onNavigate('issue')}
              >
                Issue Your First Certificate
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Grid container spacing={viewMode === 'grid' ? 3 : 0}>
              {filteredCerts
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(cert => (
                  <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={cert.tokenId}>
                    <CertificateCard
                      certificate={cert}
                      onReissue={handleReissue}
                      showRecipient={true}
                      compact={viewMode === 'grid'}
                    />
                  </Grid>
                ))}
            </Grid>
            {filteredCerts.length > itemsPerPage && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={Math.ceil(filteredCerts.length / itemsPerPage)}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default IssuerDashboard;