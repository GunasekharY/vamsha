/**
 * graph-engine is intentionally framework-free: no NestJS, no React, no
 * Neo4j driver imports. It operates on plain edge lists so it can be unit
 * tested in isolation and reused outside the API process if needed.
 * Full relationship-finder algorithms land in Phase 5 (plan section 12);
 * this file holds the minimal shape Phase 1 needs.
 */

export interface ParentEdge {
  parentId: string;
  childId: string;
}

export interface MarriageEdge {
  marriageId: string;
  spouseIds: [string, string] | string[];
}
