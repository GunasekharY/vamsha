import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Gender, PERSON_FIELD_KEYS } from '@vamsha/shared-types';
import type { PersonFieldKey } from '@vamsha/shared-types';
import type { PersonFieldsForm as PersonFieldsFormState } from '../hooks/usePersonFieldsForm';

const FIELD_LABELS: Record<PersonFieldKey, string> = {
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  gender: 'Gender',
  dateOfBirth: 'Date of birth',
  dateOfDeath: 'Date of death',
  photoUrl: 'Photo',
  biography: 'Biography',
  occupation: 'Occupation',
  village: 'Village',
  city: 'City',
  country: 'Country',
  phone: 'Phone',
  email: 'Email',
  notes: 'Notes',
};

export function PersonFieldsForm({
  form,
  showExtendedFields,
  showVisibilityPicker = true,
  autoFocus = true,
}: {
  form: PersonFieldsFormState;
  showExtendedFields: boolean;
  showVisibilityPicker?: boolean;
  autoFocus?: boolean;
}): JSX.Element {
  return (
    <Stack spacing={2}>
      <TextField
        label="Display name"
        value={form.displayName}
        onChange={(e) => form.setDisplayName(e.target.value)}
        required
        fullWidth
        autoFocus={autoFocus}
      />
      <TextField label="First name" value={form.firstName} onChange={(e) => form.setFirstName(e.target.value)} fullWidth />
      <TextField label="Middle name" value={form.middleName} onChange={(e) => form.setMiddleName(e.target.value)} fullWidth />
      <TextField label="Last name" value={form.lastName} onChange={(e) => form.setLastName(e.target.value)} fullWidth />
      <TextField
        select
        label="Gender"
        value={form.gender}
        onChange={(e) => form.setGender(e.target.value as Gender | '')}
        fullWidth
      >
        <MenuItem value="">Unspecified</MenuItem>
        <MenuItem value={Gender.MALE}>Male</MenuItem>
        <MenuItem value={Gender.FEMALE}>Female</MenuItem>
        <MenuItem value={Gender.OTHER}>Other</MenuItem>
        <MenuItem value={Gender.UNKNOWN}>Unknown</MenuItem>
      </TextField>
      <TextField
        label="Date of birth"
        type="date"
        value={form.dateOfBirth}
        onChange={(e) => form.setDateOfBirth(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="Date of death"
        type="date"
        value={form.dateOfDeath}
        onChange={(e) => form.setDateOfDeath(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField label="Village" value={form.village} onChange={(e) => form.setVillage(e.target.value)} fullWidth />
      <TextField label="City" value={form.city} onChange={(e) => form.setCity(e.target.value)} fullWidth />
      <TextField label="Country" value={form.country} onChange={(e) => form.setCountry(e.target.value)} fullWidth />

      {showExtendedFields && (
        <>
          <TextField label="Occupation" value={form.occupation} onChange={(e) => form.setOccupation(e.target.value)} fullWidth />
          <TextField label="Phone" value={form.phone} onChange={(e) => form.setPhone(e.target.value)} fullWidth />
          <TextField label="Email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} fullWidth />
          <TextField
            label="Biography"
            value={form.biography}
            onChange={(e) => form.setBiography(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </>
      )}

      {showVisibilityPicker && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Visible on profile / cards
          </Typography>
          <FormGroup row>
            {PERSON_FIELD_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                control={<Checkbox checked={form.visibleFields.has(key)} onChange={() => form.toggleVisibleField(key)} />}
                label={FIELD_LABELS[key]}
              />
            ))}
          </FormGroup>
        </Box>
      )}
    </Stack>
  );
}
