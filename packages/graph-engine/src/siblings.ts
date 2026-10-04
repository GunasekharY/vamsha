import { ParentEdge } from './types.js';

/**
 * Derives sibling relationships from shared parents.
 *
 * Plan section 4: "Sibling relationships should normally be derived from
 * common parents rather than stored independently." Two people who share
 * at least one parent are siblings (half-siblings if they share exactly
 * one, full siblings if they share both) — but this function only reports
 * the relationship, not the degree; degree classification is a Phase 5
 * relationship-engine concern.
 *
 * A person is never included in their own sibling set.
 */
export function deriveSiblings(edges: ParentEdge[]): Map<string, Set<string>> {
  const parentsByChild = new Map<string, Set<string>>();
  for (const edge of edges) {
    const parents = parentsByChild.get(edge.childId) ?? new Set<string>();
    parents.add(edge.parentId);
    parentsByChild.set(edge.childId, parents);
  }

  const childrenByParent = new Map<string, Set<string>>();
  for (const edge of edges) {
    const children = childrenByParent.get(edge.parentId) ?? new Set<string>();
    children.add(edge.childId);
    childrenByParent.set(edge.parentId, children);
  }

  const siblingsByPerson = new Map<string, Set<string>>();

  for (const [childId, parents] of parentsByChild.entries()) {
    const siblingSet = siblingsByPerson.get(childId) ?? new Set<string>();
    for (const parentId of parents) {
      const coChildren = childrenByParent.get(parentId) ?? new Set<string>();
      for (const coChildId of coChildren) {
        if (coChildId !== childId) {
          siblingSet.add(coChildId);
        }
      }
    }
    if (siblingSet.size > 0) {
      siblingsByPerson.set(childId, siblingSet);
    }
  }

  return siblingsByPerson;
}
