import { Avatar, Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import type { PersonNodeData } from '../../graph/buildFamilyTreeLayout';
import { initial, lifespan } from '../../utils/person-display';
import { useFamilyTreeActions } from './FamilyTreeActionsContext';

export function PersonNode({ data }: NodeProps<PersonNodeData>): JSX.Element {
  const { person } = data;
  const { familyId, canEdit, onQuickAdd } = useFamilyTreeActions();
  const navigate = useNavigate();

  function quickAdd(event: React.MouseEvent, relation: 'parent' | 'child' | 'spouse'): void {
    event.stopPropagation();
    onQuickAdd(person.id, relation);
  }

  return (
    <Paper
      elevation={2}
      onClick={() => navigate(`/families/${familyId}/persons/${person.id}`)}
      sx={{
        width: 170,
        height: 92,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        borderRadius: 2,
        position: 'relative',
        transition: 'box-shadow .15s, transform .15s',
        background: 'linear-gradient(180deg, #47c4d0 0%, #33aeb8 100%)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <Avatar
        alt={person.displayName}
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          bgcolor: 'rgba(255,255,255,0.9)',
          color: '#0f2023',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {initial(person.displayName)}
      </Avatar>
      <Box sx={{ minWidth: 0, color: '#fff' }}>
        <Typography variant="caption" fontWeight={700} noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
          {person.displayName}
        </Typography>
        {lifespan(person) && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', lineHeight: 1.2 }} noWrap>
            {lifespan(person)}
          </Typography>
        )}
      </Box>

      {canEdit && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -14,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <Tooltip title="Add parent">
            <IconButton
              size="small"
              onClick={(e) => quickAdd(e, 'parent')}
              sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
            >
              <PersonAddAlt1Icon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add spouse">
            <IconButton
              size="small"
              onClick={(e) => quickAdd(e, 'spouse')}
              sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
            >
              <FavoriteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add child">
            <IconButton
              size="small"
              onClick={(e) => quickAdd(e, 'child')}
              sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
            >
              <ChildCareIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
}
