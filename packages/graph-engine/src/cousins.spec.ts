import { areFirstCousins, deriveCousinPairs } from './cousins.js';
import { ParentEdge } from './types.js';

/** Demo family from siblings.spec.ts: Akshay and Priya are first cousins. */
const demoFamilyEdges: ParentEdge[] = [
  { parentId: 'grandfather', childId: 'father' },
  { parentId: 'grandmother', childId: 'father' },
  { parentId: 'grandfather', childId: 'uncle' },
  { parentId: 'grandmother', childId: 'uncle' },
  { parentId: 'father', childId: 'akshay' },
  { parentId: 'uncle', childId: 'priya' },
];

describe('deriveCousinPairs', () => {
  it('identifies Akshay and Priya as first cousins', () => {
    const cousins = deriveCousinPairs(demoFamilyEdges);

    expect(cousins.get('akshay')).toEqual(new Set(['priya']));
    expect(cousins.get('priya')).toEqual(new Set(['akshay']));
  });

  it('does not mark siblings as cousins', () => {
    const edges: ParentEdge[] = [
      { parentId: 'father', childId: 'childA' },
      { parentId: 'mother', childId: 'childA' },
      { parentId: 'father', childId: 'childB' },
      { parentId: 'mother', childId: 'childB' },
    ];

    const cousins = deriveCousinPairs(edges);

    expect(cousins.get('childA')).toBeUndefined();
    expect(cousins.get('childB')).toBeUndefined();
  });

  it('supports areFirstCousins helper symmetrically', () => {
    expect(areFirstCousins('akshay', 'priya', demoFamilyEdges)).toBe(true);
    expect(areFirstCousins('priya', 'akshay', demoFamilyEdges)).toBe(true);
    expect(areFirstCousins('akshay', 'father', demoFamilyEdges)).toBe(false);
  });
});
