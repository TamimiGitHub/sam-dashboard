import { Box, Typography, useTheme } from '@mui/material';
import { MESSAGE_COLORS } from '../constants';

export const Legend = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
        boxShadow: theme.shadows[1],
        zIndex: 1
      }}
    >
      <Typography variant="subtitle2" gutterBottom>Message Types</Typography>
      {Object.entries(MESSAGE_COLORS).map(([type, color]) => (
        <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: color,
            }}
          />
          <Typography variant="caption">{type}</Typography>
        </Box>
      ))}
    </Box>
  );
};