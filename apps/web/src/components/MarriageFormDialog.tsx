import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { Person } from '@vamsha/shared-types';
import { createMarriage, createPerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { usePersonFieldsForm } from '../hooks/usePersonFieldsForm';
import { PersonFieldsForm } from './PersonFieldsForm';

type SpouseMode = 'new' | 'existing';

function SpouseSlot({
  label,
  mode,
  onModeChange,
  form,
  existingValue,
  onExistingChange,
  existingOptions,
  disabled,
}: {
  label: string;
  mode: SpouseMode;
  onModeChange: (mode: SpouseMode) => void;
  form: ReturnType<typeof usePersonFieldsForm>;
  existingValue: Person | null;
  onExistingChange: (person: Person | null) => void;
  existingOptions: Person[];
  disabled?: boolean;
}): JSX.Element {
  if (disabled) {
    return (
      <TextField label={label} value={existingValue?.displayName ?? ''} disabled fullWidth />
    );
  }
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        size="small"
        onChange={(_, value) => value && onModeChange(value)}
        fullWidth
        sx={{ mb: 1, mt: 0.5 }}
      >
        <ToggleButton value="new">New person</ToggleButton>
        <ToggleButton value="existing">Existing person</ToggleButton>
      </ToggleButtonGroup>
      {mode === 'new' ? (
        <PersonFieldsForm form={form} showExtendedFields={false} showVisibilityPicker={false} autoFocus={false} />
      ) : (
        <Autocomplete
          options={existingOptions}
          getOptionLabel={(p) => p.displayName}
          value={existingValue}
          onChange={(_, value) => onExistingChange(value)}
          renderInput={(params) => <TextField {...params} label="Person" />}
        />
      )}
    </Box>
  );
}

export function MarriageFormDialog({
  familyId,
  persons,
  lockedSpouseId,
  onClose,
}: {
  familyId: string;
  persons: Person[];
  lockedSpouseId?: string;
  onClose: () => void;
}): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();

  const lockedSpouse = lockedSpouseId ? (persons.find((p) => p.id === lockedSpouseId) ?? null) : null;

  const [modeA, setModeA] = useState<SpouseMode>('existing');
  const [modeB, setModeB] = useState<SpouseMode>('new');
  const [existingA, setExistingA] = useState<Person | null>(lockedSpouse);
  const [existingB, setExistingB] = useState<Person | null>(null);
  const formA = usePersonFieldsForm();
  const formB = usePersonFieldsForm();

  const [marriageDate, setMarriageDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const excludeIdForB = lockedSpouseId ?? existingA?.id;
  const optionsForA = persons;
  const optionsForB = persons.filter((p) => p.id !== excludeIdForB);

  const readyA = Boolean(lockedSpouseId) || (modeA === 'existing' ? Boolean(existingA) : Boolean(formA.displayName.trim()));
  const readyB = modeB === 'existing' ? Boolean(existingB) : Boolean(formB.displayName.trim());

  async function resolveSpouseId(
    mode: SpouseMode,
    existing: Person | null,
    form: ReturnType<typeof usePersonFieldsForm>,
  ): Promise<string> {
    if (mode === 'existing') return existing!.id;
    const created = await createPerson(form.toCreateInput(familyId), accessToken);
    return created.id;
  }

  async function handleSubmit(): Promise<void> {
    if (!readyA || !readyB) return;
    setError(null);
    setSubmitting(true);

    let spouseAId: string;
    let spouseBId: string;
    try {
      spouseAId = lockedSpouseId ?? (await resolveSpouseId(modeA, existingA, formA));
    } catch {
      setError('Could not create the first spouse.');
      setSubmitting(false);
      return;
    }
    try {
      spouseBId = await resolveSpouseId(modeB, existingB, formB);
    } catch {
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      setError('The first spouse was created, but the second could not be. Try again with "Existing person".');
      setSubmitting(false);
      return;
    }

    try {
      await createMarriage(
        {
          familyId,
          spouseIds: [spouseAId, spouseBId],
          marriageDate: marriageDate || undefined,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        accessToken,
      );
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      onClose();
    } catch (err) {
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      setError(err instanceof Error ? err.message : 'Both people exist, but the marriage could not be recorded.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Record marriage</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <SpouseSlot
          label="Spouse"
          mode={modeA}
          onModeChange={setModeA}
          form={formA}
          existingValue={existingA}
          onExistingChange={setExistingA}
          existingOptions={optionsForA}
          disabled={Boolean(lockedSpouseId)}
        />

        <Divider />

        <SpouseSlot
          label="Spouse"
          mode={modeB}
          onModeChange={setModeB}
          form={formB}
          existingValue={existingB}
          onExistingChange={setExistingB}
          existingOptions={optionsForB}
        />

        <Divider />

        <TextField
          label="Marriage date"
          type="date"
          value={marriageDate}
          onChange={(e) => setMarriageDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!readyA || !readyB || submitting}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
