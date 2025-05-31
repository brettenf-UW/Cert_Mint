import React from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const VerifyFAB = ({ onNavigate, currentView }) => {
  // Don't show FAB on verify page itself
  if (currentView === 'verify') return null;

  return (
    <Zoom in={true}>
      <Tooltip title="Verify Certificate" placement="left">
        <Fab
          color="success"
          size="large"
          onClick={() => onNavigate('verify')}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default VerifyFAB;