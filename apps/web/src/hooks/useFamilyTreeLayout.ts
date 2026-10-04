import { useEffect, useState } from 'react';
import type { FamilyGraphPayload } from '@vamsha/shared-types';
import { buildFamilyTreeLayout, type FamilyTreeEdge, type FamilyTreeNode } from '../graph/buildFamilyTreeLayout';

export function useFamilyTreeLayout(graph: FamilyGraphPayload | undefined): {
  nodes: FamilyTreeNode[];
  edges: FamilyTreeEdge[];
  isLayouting: boolean;
} {
  const [nodes, setNodes] = useState<FamilyTreeNode[]>([]);
  const [edges, setEdges] = useState<FamilyTreeEdge[]>([]);
  const [isLayouting, setIsLayouting] = useState(false);

  useEffect(() => {
    if (!graph) return;
    let cancelled = false;
    setIsLayouting(true);
    buildFamilyTreeLayout(graph).then((result) => {
      if (cancelled) return;
      setNodes(result.nodes);
      setEdges(result.edges);
      setIsLayouting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [graph]);

  return { nodes, edges, isLayouting };
}
