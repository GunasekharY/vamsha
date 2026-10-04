export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Optional person fields that can be toggled visible on tree cards.
 * displayName is always shown and is not included here.
 */
export type PersonFieldKey =
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'gender'
  | 'dateOfBirth'
  | 'dateOfDeath'
  | 'photoUrl'
  | 'biography'
  | 'occupation'
  | 'village'
  | 'city'
  | 'country'
  | 'phone'
  | 'email'
  | 'notes';

export const PERSON_FIELD_KEYS: PersonFieldKey[] = [
  'firstName',
  'middleName',
  'lastName',
  'gender',
  'dateOfBirth',
  'dateOfDeath',
  'photoUrl',
  'biography',
  'occupation',
  'village',
  'city',
  'country',
  'phone',
  'email',
  'notes',
];

/**
 * Core Person shape shared between API responses and frontend state.
 * Mirrors the (:Person) node in Neo4j — see docs/ARCHITECTURE.md.
 * No field is required except id/familyId/displayName: real families have
 * incomplete data and the UI must not force users to fill in unknowns.
 */
export interface Person {
  id: string;
  familyId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName: string;
  gender?: Gender;
  dateOfBirth?: string; // ISO 8601 date
  dateOfDeath?: string; // ISO 8601 date
  photoUrl?: string;
  biography?: string;
  occupation?: string;
  village?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  notes?: string;
  /** Fields opted-in to show on tree cards and read-only profile views. */
  visibleFields: PersonFieldKey[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonInput {
  familyId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName: string;
  gender?: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  village?: string;
  city?: string;
  country?: string;
  visibleFields?: PersonFieldKey[];
}

export interface UpdatePersonInput {
  familyId: string;
  personId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  photoUrl?: string;
  biography?: string;
  occupation?: string;
  village?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  notes?: string;
  visibleFields?: PersonFieldKey[];
}

export interface AddParentChildInput {
  familyId: string;
  parentId: string;
  childId: string;
}

export interface CreateMarriageInput {
  familyId: string;
  spouseIds: [string, string];
  marriageDate?: string;
  location?: string;
  notes?: string;
  childIds?: string[];
}
