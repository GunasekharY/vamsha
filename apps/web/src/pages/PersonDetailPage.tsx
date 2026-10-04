import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { FamilyRole } from '@vamsha/shared-types';
import { fetchFamilyGraph, fetchPerson } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { useCurrentFamily } from '../hooks/useCurrentFamily';
import { hasAtLeastRole } from '../utils/roles';
import { AppHeader } from '../components/AppHeader';
import { ParentChildDialog } from '../components/ParentChildDialog';
import { MarriageFormDialog } from '../components/MarriageFormDialog';
import { DeletePersonDialog } from '../components/DeletePersonDialog';
import { PhotoUploadDialog } from '../components/PhotoUploadDialog';

type DialogState =
  | { kind: 'none' }
  | { kind: 'add-parent' }
  | { kind: 'add-child' }
  | { kind: 'add-spouse' }
  | { kind: 'delete' }
  | { kind: 'upload-photo' };

function Field({ label, value }: { label: string; value?: string }): JSX.Element | null {
  if (!value) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export function PersonDetailPage(): JSX.Element {
  const { familyId, personId } = useParams<{ familyId: string; personId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const navigate = useNavigate();
  const { myRole } = useCurrentFamily(familyId!);

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', familyId, personId, false],
    queryFn: () => fetchPerson(familyId!, personId!, false, accessToken),
  });

  const { data: graph } = useQuery({
    queryKey: ['familyGraph', familyId],
    queryFn: () => fetchFamilyGraph(familyId!, accessToken),
  });

  const canEdit = hasAtLeastRole(myRole, FamilyRole.EDITOR);
  const canDelete = hasAtLeastRole(myRole, FamilyRole.ADMIN);

  const personsById = new Map((graph?.persons ?? []).map((p) => [p.id, p]));

  const parents = (graph?.parentChildEdges ?? [])
    .filter((e) => e.childId === personId)
    .map((e) => personsById.get(e.parentId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const children = (graph?.parentChildEdges ?? [])
    .filter((e) => e.parentId === personId)
    .map((e) => personsById.get(e.childId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const myMarriageIds = new Set(
    (graph?.spouseMarriageEdges ?? []).filter((e) => e.spouseId === personId).map((e) => e.marriageId),
  );
  const spouses = (graph?.spouseMarriageEdges ?? [])
    .filter((e) => myMarriageIds.has(e.marriageId) && e.spouseId !== personId)
    .map((e) => personsById.get(e.spouseId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (isLoading || !person) {
    return (
      <Box>
        <AppHeader backTo={`/families/${familyId}`} backLabel="Back to family" />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={72} height={72} />
            <Skeleton variant="text" width={180} height={40} />
          </Stack>
          <Skeleton variant="rounded" height={120} />
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader backTo={`/families/${familyId}`} backLabel="Back to family" />

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar src={person.photoUrl} alt={person.displayName} sx={{ width: 72, height: 72 }}>
            {person.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">{person.displayName}</Typography>
            {person.occupation && <Typography color="text.secondary">{person.occupation}</Typography>}
          </Box>
        </Stack>

        {canEdit && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
            <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => navigate(`/families/${familyId}/persons/${personId}/edit`)}>
              Edit
            </Button>
            <Button size="small" startIcon={<AddAPhotoIcon fontSize="small" />} onClick={() => setDialog({ kind: 'upload-photo' })}>
              Upload photo
            </Button>
            <Button size="small" startIcon={<PersonAddAlt1Icon fontSize="small" />} onClick={() => setDialog({ kind: 'add-parent' })}>
              Add parent
            </Button>
            <Button size="small" startIcon={<ChildCareIcon fontSize="small" />} onClick={() => setDialog({ kind: 'add-child' })}>
              Add child
            </Button>
            <Button size="small" startIcon={<FavoriteIcon fontSize="small" />} onClick={() => setDialog({ kind: 'add-spouse' })}>
              Add spouse
            </Button>
            {canDelete && (
              <Button size="small" color="error" startIcon={<DeleteOutlineIcon fontSize="small" />} onClick={() => setDialog({ kind: 'delete' })}>
                Delete
              </Button>
            )}
          </Stack>
        )}

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Field label="First name" value={person.firstName} />
          <Field label="Middle name" value={person.middleName} />
          <Field label="Last name" value={person.lastName} />
          <Field label="Gender" value={person.gender} />
          <Field label="Date of birth" value={person.dateOfBirth} />
          <Field label="Date of death" value={person.dateOfDeath} />
          <Field label="Village" value={person.village} />
          <Field label="City" value={person.city} />
          <Field label="Country" value={person.country} />
          <Field label="Phone" value={person.phone} />
          <Field label="Email" value={person.email} />
          <Field label="Biography" value={person.biography} />
          <Field label="Notes" value={person.notes} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <RelationList title="Parents" people={parents} familyId={familyId!} />
        <RelationList title="Children" people={children} familyId={familyId!} />
        <RelationList title="Spouses" people={spouses} familyId={familyId!} />
      </Container>

      {dialog.kind === 'add-parent' && (
        <ParentChildDialog
          familyId={familyId!}
          personId={personId!}
          relation="parent"
          persons={graph?.persons ?? []}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'add-child' && (
        <ParentChildDialog
          familyId={familyId!}
          personId={personId!}
          relation="child"
          persons={graph?.persons ?? []}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'add-spouse' && (
        <MarriageFormDialog
          familyId={familyId!}
          persons={graph?.persons ?? []}
          lockedSpouseId={personId!}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'delete' && (
        <DeletePersonDialog
          familyId={familyId!}
          personId={personId!}
          displayName={person.displayName}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'upload-photo' && (
        <PhotoUploadDialog familyId={familyId!} personId={personId!} onClose={() => setDialog({ kind: 'none' })} />
      )}
    </Box>
  );
}

function RelationList({
  title,
  people,
  familyId,
}: {
  title: string;
  people: { id: string; displayName: string }[];
  familyId: string;
}): JSX.Element | null {
  if (people.length === 0) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <List dense disablePadding>
        {people.map((p) => (
          <ListItem key={p.id} disableGutters>
            <MuiLink component={RouterLink} to={`/families/${familyId}/persons/${p.id}`}>
              {p.displayName}
            </MuiLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
