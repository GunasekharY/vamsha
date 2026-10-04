import { buildTreeLayoutInput } from './layout.js';
import type { FamilyGraphPayload } from '@vamsha/shared-types';

describe('buildTreeLayoutInput', () => {
  it('builds nodes and edges from a family graph payload', () => {
    const graph: FamilyGraphPayload = {
      persons: [
        {
          id: 'p1',
          familyId: 'f1',
          displayName: 'Father',
          visibleFields: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p2',
          familyId: 'f1',
          displayName: 'Child',
          visibleFields: [],
          createdAt: '',
          updatedAt: '',
        },
      ],
      marriages: [{ id: 'm1', familyId: 'f1', spouseIds: ['p1', 'p3'], isActive: true }],
      parentChildEdges: [{ parentId: 'p1', childId: 'p2' }],
      spouseMarriageEdges: [{ marriageId: 'm1', spouseId: 'p1' }],
      marriageChildEdges: [{ marriageId: 'm1', childId: 'p2' }],
      cousinPairs: [],
    };

    const layout = buildTreeLayoutInput(graph);

    expect(layout.nodes).toHaveLength(3);
    expect(layout.nodes.find((n) => n.id === 'p1')?.kind).toBe('person');
    expect(layout.nodes.find((n) => n.id === 'm1')?.kind).toBe('marriage');
    expect(layout.edges.length).toBeGreaterThan(0);
  });
});
