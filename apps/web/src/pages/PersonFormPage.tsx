import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Box, Button, Container, Typography, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPerson, updatePerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { AppHeader } from '../components/AppHeader';
import { PersonFieldsForm } from '../components/PersonFieldsForm';
import { usePersonFieldsForm } from '../hooks/usePersonFieldsForm';

export function PersonFormPage(): JSX.Element {
  const { familyId, personId } = useParams<{ familyId: string; personId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = usePersonFieldsForm();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['person', familyId, personId, true],
    queryFn: () => fetchPerson(familyId!, personId!, true, accessToken),
  });

  useEffect(() => {
    if (existing) form.loadFrom(existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!form.displayName.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await updatePerson(form.toUpdateInput(familyId!, personId!), accessToken);
      await queryClient.invalidateQueries({ queryKey: ['person', familyId, personId] });
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      navigate(`/families/${familyId}/persons/${personId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save person.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Box>
        <AppHeader backTo={`/families/${familyId}`} backLabel="Back to family" />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Typography color="text.secondary">Loading…</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader backTo={`/families/${familyId}/persons/${personId}`} backLabel="Back to profile" />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Edit person
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <PersonFieldsForm form={form} showExtendedFields autoFocus={false} />
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting}>
              Save changes
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
