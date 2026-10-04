import type {
  FamilyGraphPayload,
  MarriageChildEdge,
  ParentChildEdge,
  SpouseMarriageEdge,
} from '@vamsha/shared-types';

export interface ElkNode {
  id: string;
  width: number;
  height: number;
  /** 'person' | 'marriage' */
  kind: 'person' | 'marriage';
}

export interface ElkEdge {
  id: string;
  source: string;
  target: string;
}

export interface TreeLayoutInput {
  nodes: ElkNode[];
  edges: ElkEdge[];
}

const PERSON_NODE_WIDTH = 180;
const PERSON_NODE_HEIGHT = 100;
const MARRIAGE_NODE_WIDTH = 24;
const MARRIAGE_NODE_HEIGHT = 24;

/**
 * Converts a family graph payload into flat node/edge lists suitable for ELK layout.
 */
export function buildTreeLayoutInput(graph: FamilyGraphPayload): TreeLayoutInput {
  const nodes: ElkNode[] = [];
  const edges: ElkEdge[] = [];
  const seenNodeIds = new Set<string>();

  for (const person of graph.persons) {
    if (!seenNodeIds.has(person.id)) {
      nodes.push({
        id: person.id,
        width: PERSON_NODE_WIDTH,
        height: PERSON_NODE_HEIGHT,
        kind: 'person',
      });
      seenNodeIds.add(person.id);
    }
  }

  for (const marriage of graph.marriages) {
    if (!seenNodeIds.has(marriage.id)) {
      nodes.push({
        id: marriage.id,
        width: MARRIAGE_NODE_WIDTH,
        height: MARRIAGE_NODE_HEIGHT,
        kind: 'marriage',
      });
      seenNodeIds.add(marriage.id);
    }
  }

  addUniqueEdges(edges, graph.parentChildEdges, 'parent');
  addSpouseEdges(edges, graph.spouseMarriageEdges);
  addMarriageChildEdges(edges, graph.marriageChildEdges);

  return { nodes, edges };
}

function addUniqueEdges(
  edges: ElkEdge[],
  parentChild: ParentChildEdge[],
  prefix: string,
): void {
  const seen = new Set<string>();
  for (const { parentId, childId } of parentChild) {
    const id = `${prefix}-${parentId}-${childId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    edges.push({ id, source: parentId, target: childId });
  }
}

function addSpouseEdges(edges: ElkEdge[], spouseMarriage: SpouseMarriageEdge[]): void {
  const seen = new Set<string>();
  for (const { marriageId, spouseId } of spouseMarriage) {
    const id = `spouse-${spouseId}-${marriageId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    edges.push({ id, source: spouseId, target: marriageId });
  }
}

function addMarriageChildEdges(edges: ElkEdge[], marriageChild: MarriageChildEdge[]): void {
  const seen = new Set<string>();
  for (const { marriageId, childId } of marriageChild) {
    const id = `child-${marriageId}-${childId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    edges.push({ id, source: marriageId, target: childId });
  }
}
