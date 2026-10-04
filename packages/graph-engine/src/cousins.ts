import { ParentEdge } from './types.js';
import { deriveSiblings } from './siblings.js';

/**
 * Derives first-cousin pairs: two people whose parents are siblings.
 * Used for display labels on marriage edges — never for blocking unions.
 */
export function deriveCousinPairs(edges: ParentEdge[]): Map<string, Set<string>> {
  const siblings = deriveSiblings(edges);
  const parentsByChild = new Map<string, Set<string>>();

  for (const edge of edges) {
    const parents = parentsByChild.get(edge.childId) ?? new Set<string>();
    parents.add(edge.parentId);
    parentsByChild.set(edge.childId, parents);
  }

  const cousinsByPerson = new Map<string, Set<string>>();

  for (const [personId, parents] of parentsByChild.entries()) {
    for (const parentId of parents) {
      const parentSiblings = siblings.get(parentId);
      if (!parentSiblings) continue;

      for (const auntUncleId of parentSiblings) {
        for (const edge of edges) {
          if (edge.parentId === auntUncleId && edge.childId !== personId) {
            const cousinSet = cousinsByPerson.get(personId) ?? new Set<string>();
            cousinSet.add(edge.childId);
            cousinsByPerson.set(personId, cousinSet);
          }
        }
      }
    }
  }

  return cousinsByPerson;
}

/** Returns true if two people are first cousins (symmetric check). */
export function areFirstCousins(
  personAId: string,
  personBId: string,
  edges: ParentEdge[],
): boolean {
  const cousins = deriveCousinPairs(edges);
  return cousins.get(personAId)?.has(personBId) ?? false;
}
