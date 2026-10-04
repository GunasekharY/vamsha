import { Box, Tooltip, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MarriageNodeData } from '../../graph/buildFamilyTreeLayout';

export function MarriageNode({ data }: NodeProps<MarriageNodeData>): JSX.Element {
  const { marriage } = data;
  const isCousinMarriage = /first[- ]?cousin/i.test(marriage.notes ?? '');
  const details = [marriage.marriageDate, marriage.location].filter(Boolean).join(' · ') || 'Married';

  return (
    <Tooltip title={isCousinMarriage ? `${details} · First cousin marriage` : details}>
      <Box
        sx={{
          width: isCousinMarriage ? 30 : 24,
          height: isCousinMarriage ? 30 : 24,
          borderRadius: '50%',
          bgcolor: isCousinMarriage ? '#f9b74a' : 'primary.main',
          color: isCousinMarriage ? '#2b1a00' : 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isCousinMarriage ? '0 0 0 2px rgba(249,183,74,0.35)' : 'none',
          border: isCousinMarriage ? '1px solid rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        {isCousinMarriage ? (
          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
            FC
          </Typography>
        ) : (
          <FavoriteIcon sx={{ fontSize: 12 }} />
        )}
      </Box>
    </Tooltip>
  );
}
