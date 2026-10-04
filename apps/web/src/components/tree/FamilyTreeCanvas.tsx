import { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { FamilyGraphPayload } from '@vamsha/shared-types';
import { useFamilyTreeLayout } from '../../hooks/useFamilyTreeLayout';
import { FamilyTreeActionsProvider } from './FamilyTreeActionsContext';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';

const nodeTypes = { person: PersonNode, marriage: MarriageNode };

export function FamilyTreeCanvas({
  graph,
  familyId,
  canEdit,
  onQuickAdd,
}: {
  graph: FamilyGraphPayload | undefined;
  familyId: string;
  canEdit: boolean;
  onQuickAdd: (personId: string, relation: 'parent' | 'child' | 'spouse') => void;
}): JSX.Element {
  const { nodes, edges, isLayouting } = useFamilyTreeLayout(graph);

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style:
          edge.data?.kind === 'spouse-link'
            ? { stroke: '#bdbdbd', strokeDasharray: '4 3' }
            : { stroke: '#8B4513', strokeWidth: 2 },
      })),
    [edges],
  );

  const actions = useMemo(() => ({ familyId, canEdit, onQuickAdd }), [familyId, canEdit, onQuickAdd]);

  return (
    <Box sx={{ height: '70vh', border: 'none', borderRadius: 2, position: 'relative', bgcolor: '#000000', overflow: 'hidden' }}>
      {isLayouting && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            bgcolor: 'rgba(0,0,0,0.5)',
          }}
        >
          <CircularProgress size={28} sx={{ color: '#4dd0e1' }} />
        </Box>
      )}
      <FamilyTreeActionsProvider value={actions}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: false }}
          panOnScroll
          minZoom={0.4}
          maxZoom={1.4}
          style={{ background: '#000000' }}
        >
          <Background color="#6dd3dd" gap={18} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </FamilyTreeActionsProvider>
    </Box>
  );
}
