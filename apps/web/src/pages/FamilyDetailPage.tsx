import { useState } from 'react';
import { Box, Button, Container, Typography, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { FamilyRole } from '@vamsha/shared-types';
import { fetchFamilyGraph } from '../api/person-api';
import { useAuthStore } from '../store/auth-store';
import { useCurrentFamily } from '../hooks/useCurrentFamily';
import { hasAtLeastRole } from '../utils/roles';
import { AppHeader } from '../components/AppHeader';
import { MarriageFormDialog } from '../components/MarriageFormDialog';
import { ParentChildDialog } from '../components/ParentChildDialog';
import { CreatePersonDialog } from '../components/CreatePersonDialog';
import { FamilyTreeCanvas } from '../components/tree/FamilyTreeCanvas';

type DialogState =
  | { kind: 'none' }
  | { kind: 'create-first' }
  | { kind: 'record-marriage' }
  | { kind: 'add-parent'; personId: string }
  | { kind: 'add-child'; personId: string }
  | { kind: 'add-spouse'; personId: string };

export function FamilyDetailPage(): JSX.Element {
  const { familyId } = useParams<{ familyId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken)!;
  const { family, myRole, isLoading: isFamilyLoading } = useCurrentFamily(familyId!);

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const { data: graph, isLoading } = useQuery({
    queryKey: ['familyGraph', familyId],
    queryFn: () => fetchFamilyGraph(familyId!, accessToken),
  });

  const canEdit = hasAtLeastRole(myRole, FamilyRole.EDITOR);
  const persons = graph?.persons ?? [];

  function handleQuickAdd(personId: string, relation: 'parent' | 'child' | 'spouse'): void {
    if (relation === 'spouse') setDialog({ kind: 'add-spouse', personId });
    else setDialog({ kind: relation === 'parent' ? 'add-parent' : 'add-child', personId });
  }

  return (
    <Box>
      <AppHeader backTo="/families" backLabel="All families" />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{isFamilyLoading ? 'Loading…' : (family?.name ?? 'Family')}</Typography>
          {canEdit && persons.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FavoriteIcon />}
              onClick={() => setDialog({ kind: 'record-marriage' })}
              disabled={persons.length < 1}
            >
              Record marriage
            </Button>
          )}
        </Box>

        {!isFamilyLoading && !family && (
          <Alert severity="error" sx={{ mt: 2 }}>
            You don't have access to this family.
          </Alert>
        )}

        {!isLoading && persons.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 10,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Diversity3Icon sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography color="text.secondary">No one in this family tree yet.</Typography>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setDialog({ kind: 'create-first' })}
              >
                Add first person
              </Button>
            )}
          </Box>
        ) : (
          <FamilyTreeCanvas graph={graph} familyId={familyId!} canEdit={canEdit} onQuickAdd={handleQuickAdd} />
        )}
      </Container>

      {dialog.kind === 'create-first' && (
        <CreatePersonDialog familyId={familyId!} onClose={() => setDialog({ kind: 'none' })} />
      )}
      {dialog.kind === 'record-marriage' && (
        <MarriageFormDialog familyId={familyId!} persons={persons} onClose={() => setDialog({ kind: 'none' })} />
      )}
      {dialog.kind === 'add-parent' && (
        <ParentChildDialog
          familyId={familyId!}
          personId={dialog.personId}
          relation="parent"
          persons={persons}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'add-child' && (
        <ParentChildDialog
          familyId={familyId!}
          personId={dialog.personId}
          relation="child"
          persons={persons}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
      {dialog.kind === 'add-spouse' && (
        <MarriageFormDialog
          familyId={familyId!}
          persons={persons}
          lockedSpouseId={dialog.personId}
          onClose={() => setDialog({ kind: 'none' })}
        />
      )}
    </Box>
  );
}
