import { deriveSiblings } from './siblings.js';
import { ParentEdge } from './types.js';

describe('deriveSiblings', () => {
  it('treats two children of the same two parents as full siblings', () => {
    const edges: ParentEdge[] = [
      { parentId: 'grandfather', childId: 'sonA' },
      { parentId: 'grandmother', childId: 'sonA' },
      { parentId: 'grandfather', childId: 'sonB' },
      { parentId: 'grandmother', childId: 'sonB' },
    ];

    const siblings = deriveSiblings(edges);

    expect(siblings.get('sonA')).toEqual(new Set(['sonB']));
    expect(siblings.get('sonB')).toEqual(new Set(['sonA']));
  });

  it('treats children sharing exactly one parent as half-siblings', () => {
    const edges: ParentEdge[] = [
      { parentId: 'father', childId: 'childA' },
      { parentId: 'motherOne', childId: 'childA' },
      { parentId: 'father', childId: 'childB' },
      { parentId: 'motherTwo', childId: 'childB' },
    ];

    const siblings = deriveSiblings(edges);

    expect(siblings.get('childA')).toEqual(new Set(['childB']));
    expect(siblings.get('childB')).toEqual(new Set(['childA']));
  });

  it('does not mark first cousins as siblings (plan section 32 demo family)', () => {
    // Grandfather+Grandmother -> Father, Uncle -> Akshay, Priya (cousins)
    const edges: ParentEdge[] = [
      { parentId: 'grandfather', childId: 'father' },
      { parentId: 'grandmother', childId: 'father' },
      { parentId: 'grandfather', childId: 'uncle' },
      { parentId: 'grandmother', childId: 'uncle' },
      { parentId: 'father', childId: 'akshay' },
      { parentId: 'uncle', childId: 'priya' },
    ];

    const siblings = deriveSiblings(edges);

    expect(siblings.get('akshay')).toBeUndefined();
    expect(siblings.get('priya')).toBeUndefined();
    // father and uncle remain siblings via shared grandparents
    expect(siblings.get('father')).toEqual(new Set(['uncle']));
  });

  it('returns no entry for an only child', () => {
    const edges: ParentEdge[] = [
      { parentId: 'mother', childId: 'onlyChild' },
      { parentId: 'father', childId: 'onlyChild' },
    ];

    const siblings = deriveSiblings(edges);

    expect(siblings.get('onlyChild')).toBeUndefined();
  });
});
