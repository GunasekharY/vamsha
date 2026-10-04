export enum FamilyRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMembership {
  familyId: string;
  userId: string;
  role: FamilyRole;
}

export interface CreateFamilyInput {
  name: string;
}

/**
 * A Marriage is modeled as its own node (not a direct edge) so it can carry
 * dates/location/notes and so multiple marriages per person are natural.
 * See docs/ARCHITECTURE.md and plan section 5.
 */
export interface Marriage {
  id: string;
  familyId: string;
  spouseIds: string[];
  marriageDate?: string;
  location?: string;
  notes?: string;
  isActive: boolean; // false once divorced/separated
}
