import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { PhotoMimeType } from '@vamsha/shared-types';
import { confirmPhotoUpload, requestPhotoUpload, uploadPhotoFile } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';

const ALLOWED_MIMES = new Set<string>(Object.values(PhotoMimeType));
const MAX_BYTES = 5 * 1024 * 1024;

export function PhotoUploadDialog({
  familyId,
  personId,
  onClose,
}: {
  familyId: string;
  personId: string;
  onClose: () => void;
}): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(selected: File | null): void {
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_MIMES.has(selected.type)) {
      setError('Only JPEG, PNG, or WEBP images are allowed.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError('Photo must be 5MB or smaller.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleUpload(): Promise<void> {
    if (!file) return;
    setError(null);
    setSubmitting(true);
    try {
      const { uploadUrl, objectKey } = await requestPhotoUpload(
        {
          familyId,
          personId,
          contentType: file.type as PhotoMimeType,
          contentLength: file.size,
        },
        accessToken,
      );
      try {
        await uploadPhotoFile(uploadUrl, file);
      } catch {
        throw new Error('Could not upload the photo file to storage.');
      }
      try {
        await confirmPhotoUpload({ familyId, personId, objectKey }, accessToken);
      } catch {
        throw new Error('Photo uploaded but could not be confirmed.');
      }
      await queryClient.invalidateQueries({ queryKey: ['person', familyId, personId] });
      await queryClient.invalidateQueries({ queryKey: ['familyGraph', familyId] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Upload photo</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained" disabled={!file || submitting}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
