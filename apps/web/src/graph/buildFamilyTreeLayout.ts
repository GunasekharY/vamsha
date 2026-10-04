import ELK from 'elkjs/lib/elk.bundled.js';
import { buildTreeLayoutInput } from '@vamsha/graph-engine';
import type { FamilyGraphPayload, Marriage, Person } from '@vamsha/shared-types';
import type { Edge, Node } from '@xyflow/react';

export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
}

export interface MarriageNodeData extends Record<string, unknown> {
  marriage: Marriage;
}

export type FamilyTreeNode = Node<PersonNodeData, 'person'> | Node<MarriageNodeData, 'marriage'>;

export type FamilyTreeEdgeKind = 'parent-child' | 'spouse-link';

export type FamilyTreeEdge = Edge<{ kind: FamilyTreeEdgeKind }>;

interface LayoutedNode {
  id: string;
  x?: number;
  y?: number;
}

const elk = new ELK();

const LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '40',
  'elk.edgeRouting': 'ORTHOGONAL',
};

/**
 * A direct parent-child edge is visually redundant when that same parent and
 * child are already connected through a marriage junction (parent -> marriage
 * -> child), so we drop it and let the marriage-routed path carry the line.
 */
function findRedundantParentChildPairs(graph: FamilyGraphPayload): Set<string> {
  const spousesByMarriage = new Map<string, Set<string>>();
  for (const { marriageId, spouseId } of graph.spouseMarriageEdges) {
    if (!spousesByMarriage.has(marriageId)) spousesByMarriage.set(marriageId, new Set());
    spousesByMarriage.get(marriageId)!.add(spouseId);
  }

  const covered = new Set<string>();
  for (const { marriageId, childId } of graph.marriageChildEdges) {
    const spouses = spousesByMarriage.get(marriageId);
    if (!spouses) continue;
    for (const spouseId of spouses) {
      covered.add(`${spouseId}::${childId}`);
    }
  }
  return covered;
}

export async function buildFamilyTreeLayout(
  graph: FamilyGraphPayload,
): Promise<{ nodes: FamilyTreeNode[]; edges: FamilyTreeEdge[] }> {
  if (graph.persons.length === 0) {
    return { nodes: [], edges: [] };
  }

  const { nodes: elkNodes, edges: elkEdges } = buildTreeLayoutInput(graph);
  const redundantPairs = findRedundantParentChildPairs(graph);
  const visibleEdges = elkEdges.filter(
    (edge) => !(edge.id.startsWith('parent-') && redundantPairs.has(`${edge.source}::${edge.target}`)),
  );

  const layoutRoot = await elk.layout({
    id: 'root',
    layoutOptions: LAYOUT_OPTIONS,
    children: elkNodes.map((node) => ({
      id: node.id,
      width: node.width,
      height: node.height,
    })),
    edges: visibleEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  });

  const positionById = new Map<string, { x: number; y: number }>();
  for (const child of (layoutRoot.children ?? []) as LayoutedNode[]) {
    positionById.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  const personById = new Map(graph.persons.map((p) => [p.id, p]));
  const marriageById = new Map(graph.marriages.map((m) => [m.id, m]));

  const nodes: FamilyTreeNode[] = elkNodes.map((node) => {
    const position = positionById.get(node.id) ?? { x: 0, y: 0 };
    if (node.kind === 'person') {
      return {
        id: node.id,
        type: 'person',
        position,
        data: { person: personById.get(node.id)! },
      } satisfies FamilyTreeNode;
    }
    return {
      id: node.id,
      type: 'marriage',
      position,
      data: { marriage: marriageById.get(node.id)! },
    } satisfies FamilyTreeNode;
  });

  const edges: FamilyTreeEdge[] = visibleEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    data: { kind: edge.id.startsWith('spouse-') ? 'spouse-link' : 'parent-child' },
  }));

  return { nodes, edges };
}
