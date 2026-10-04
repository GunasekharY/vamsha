import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchMyFamilies, createFamily } from '../api/family-api';
import { useAuthStore } from '../store/auth-store';
import { AppHeader } from '../components/AppHeader';

export function FamiliesPage(): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [newFamilyName, setNewFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: families, isLoading } = useQuery({
    queryKey: ['myFamilies'],
    queryFn: () => fetchMyFamilies(accessToken),
  });

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!newFamilyName.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await createFamily({ name: newFamilyName.trim() }, accessToken);
      setNewFamilyName('');
      await queryClient.invalidateQueries({ queryKey: ['myFamilies'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create family.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <AppHeader />

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your family workspaces
        </Typography>

        {isLoading && (
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={56} />
          </Box>
        )}

        {!isLoading && families?.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 4, mb: 2 }}>
            <Diversity3Icon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary">You don't have any family workspaces yet.</Typography>
          </Box>
        )}

        <List>
          {families?.map((family) => (
            <ListItemButton
              key={family.id}
              onClick={() => navigate(`/families/${family.id}`)}
              sx={{
                borderRadius: 2,
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'box-shadow .15s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Diversity3Icon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={family.name} secondary={`Created ${new Date(family.createdAt).toLocaleDateString()}`} />
              <Chip label={family.myRole} size="small" />
            </ListItemButton>
          ))}
        </List>

        <Box component="form" onSubmit={handleCreate} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="New family name"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              fullWidth
              size="small"
            />
            <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={submitting}>
              Create
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
