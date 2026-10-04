import type { Marriage } from './family.js';
import type { Person } from './person.js';

export interface ParentChildEdge {
  parentId: string;
  childId: string;
}

export interface SpouseMarriageEdge {
  marriageId: string;
  spouseId: string;
}

export interface MarriageChildEdge {
  marriageId: string;
  childId: string;
}

export interface CousinPair {
  personAId: string;
  personBId: string;
  label: string;
}

/** Full graph payload returned by familyGraph query for tree rendering. */
export interface FamilyGraphPayload {
  persons: Person[];
  marriages: Marriage[];
  parentChildEdges: ParentChildEdge[];
  spouseMarriageEdges: SpouseMarriageEdge[];
  marriageChildEdges: MarriageChildEdge[];
  cousinPairs: CousinPair[];
}
