import { FamilyRole, type CreateFamilyInput } from '@vamsha/shared-types';

export interface FamilyWithRole {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  myRole: FamilyRole;
}

const MOCK_FAMILIES: FamilyWithRole[] = [
  {
    id: 'family-1',
    name: 'Patel Family',
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
    myRole: FamilyRole.OWNER,
  },
  {
    id: 'family-2',
    name: 'Nair Family',
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z',
    myRole: FamilyRole.ADMIN,
  },
];

export async function createFamily(
  input: CreateFamilyInput,
  _accessToken: string,
): Promise<FamilyWithRole> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const created: FamilyWithRole = {
    id: `family-${Date.now()}`,
    name: input.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    myRole: FamilyRole.OWNER,
  };
  MOCK_FAMILIES.unshift(created);
  return created;
}

export async function fetchMyFamilies(_accessToken: string): Promise<FamilyWithRole[]> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return MOCK_FAMILIES;
}
