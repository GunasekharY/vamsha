import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deletePerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';

export function DeletePersonDialog({
  familyId,
  personId,
  displayName,
  onClose,
}: {
  familyId: string;
  personId: string;
  displayName: string;
  onClose: () => void;
}): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete(): Promise<void> {
    setError(null);
    setSubmitting(true);
    try {
      await deletePerson(familyId, personId, accessToken);
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      navigate(`/families/${familyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete person.');
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete {displayName}?</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <DialogContentText>This cannot be undone.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteOutlineIcon />} disabled={submitting}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
