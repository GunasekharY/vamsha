import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { createPerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { usePersonFieldsForm } from '../hooks/usePersonFieldsForm';
import { PersonFieldsForm } from '../components/PersonFieldsForm';

export function CreatePersonDialog({
  familyId,
  onClose,
}: {
  familyId: string;
  onClose: () => void;
}): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();
  const form = usePersonFieldsForm();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (!form.displayName.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await createPerson(form.toCreateInput(familyId), accessToken);
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create person.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add the first person</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <PersonFieldsForm form={form} showExtendedFields={false} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!form.displayName.trim() || submitting}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
