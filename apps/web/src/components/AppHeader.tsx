import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

export function AppHeader({
  backTo,
  backLabel,
}: {
  backTo?: string;
  backLabel?: string;
}): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Diversity3Icon color="primary" />
            <Typography variant="h6">Vamsha</Typography>
          </Box>
          {backTo && (
            <Button size="small" startIcon={<ArrowBackIcon fontSize="small" />} component={RouterLink} to={backTo}>
              {backLabel ?? 'Back'}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && <Typography variant="body2">{user.name}</Typography>}
          <Button size="small" startIcon={<LogoutIcon fontSize="small" />} onClick={clearSession}>
            Sign out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
