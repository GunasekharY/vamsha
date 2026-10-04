import { useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { Person } from '@vamsha/shared-types';
import { addParentChild, createPerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { usePersonFieldsForm } from '../hooks/usePersonFieldsForm';
import { PersonFieldsForm } from './PersonFieldsForm';

export function ParentChildDialog({
  familyId,
  personId,
  relation,
  persons,
  onClose,
}: {
  familyId: string;
  personId: string;
  relation: 'parent' | 'child';
  persons: Person[];
  onClose: () => void;
}): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();
  const newPersonForm = usePersonFieldsForm();

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [other, setOther] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const options = persons.filter((p) => p.id !== personId);

  async function link(otherId: string): Promise<void> {
    const parentId = relation === 'parent' ? otherId : personId;
    const childId = relation === 'parent' ? personId : otherId;
    await addParentChild({ familyId, parentId, childId }, accessToken);
  }

  async function handleSubmitExisting(): Promise<void> {
    if (!other) return;
    setError(null);
    setSubmitting(true);
    try {
      await link(other.id);
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not add ${relation}.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitNew(): Promise<void> {
    if (!newPersonForm.displayName.trim()) return;
    setError(null);
    setSubmitting(true);
    let createdId: string | null = null;
    try {
      const created = await createPerson(newPersonForm.toCreateInput(familyId), accessToken);
      createdId = created.id;
    } catch {
      setError('Could not create the new person.');
      setSubmitting(false);
      return;
    }
    try {
      await link(createdId);
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      onClose();
    } catch {
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      setError(
        `${newPersonForm.displayName} was created, but could not be linked as their ${relation}. You can link them via "Existing person" below.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add {relation}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_, value) => value && setMode(value)}
          fullWidth
        >
          <ToggleButton value="new">New person</ToggleButton>
          <ToggleButton value="existing">Existing person</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'new' ? (
          <PersonFieldsForm form={newPersonForm} showExtendedFields={false} showVisibilityPicker={false} />
        ) : (
          <Autocomplete
            options={options}
            getOptionLabel={(p) => p.displayName}
            value={other}
            onChange={(_, value) => setOther(value)}
            renderInput={(params) => <TextField {...params} label="Person" autoFocus />}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'new' ? (
          <Button
            onClick={handleSubmitNew}
            variant="contained"
            disabled={!newPersonForm.displayName.trim() || submitting}
          >
            Add
          </Button>
        ) : (
          <Button onClick={handleSubmitExisting} variant="contained" disabled={!other || submitting}>
            Add
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
