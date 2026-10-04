import type {
  AddParentChildInput,
  ConfirmPhotoUploadInput,
  CreateMarriageInput,
  CreatePersonInput,
  FamilyGraphPayload,
  Person,
  PhotoUploadRequest,
  RequestPhotoUploadInput,
  UpdatePersonInput,
} from '@vamsha/shared-types';
import { PhotoMimeType } from '@vamsha/shared-types';

const MOCK_PERSONS: Person[] = [
  {
    id: 'p-1',
    familyId: 'family-1',
    firstName: 'Sundar',
    lastName: 'Nair',
    displayName: 'Sundar Nair',
    gender: 'MALE' as const,
    dateOfBirth: '1948-02-11',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-2',
    familyId: 'family-1',
    firstName: 'Lakshmi',
    lastName: 'Nair',
    displayName: 'Lakshmi Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '1951-07-19',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-3',
    familyId: 'family-1',
    firstName: 'Cherady',
    lastName: 'Nair',
    displayName: 'Cherady Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '1974-05-14',
    occupation: 'Teacher',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-4',
    familyId: 'family-1',
    firstName: 'Venkatesh',
    lastName: 'Nair',
    displayName: 'Venkatesh Nair',
    gender: 'MALE' as const,
    dateOfBirth: '1978-09-06',
    occupation: 'Engineer',
    city: 'Bengaluru',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-5',
    familyId: 'family-1',
    firstName: 'Sreelatha',
    lastName: 'Nair',
    displayName: 'Sreelatha Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '1980-11-21',
    occupation: 'Doctor',
    city: 'Thiruvananthapuram',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-6',
    familyId: 'family-1',
    firstName: 'Ramachandran',
    lastName: 'Nair',
    displayName: 'Ramachandran Nair',
    gender: 'MALE' as const,
    dateOfBirth: '1983-03-08',
    occupation: 'Business',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-7',
    familyId: 'family-1',
    firstName: 'Kavya',
    lastName: 'Nair',
    displayName: 'Kavya Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '2002-01-16',
    occupation: 'Student',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-8',
    familyId: 'family-1',
    firstName: 'Dev',
    lastName: 'Menon',
    displayName: 'Dev Menon',
    gender: 'MALE' as const,
    dateOfBirth: '1971-08-02',
    occupation: 'Architect',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-9',
    familyId: 'family-1',
    firstName: 'Riya',
    lastName: 'Menon',
    displayName: 'Riya Menon',
    gender: 'FEMALE' as const,
    dateOfBirth: '2000-08-12',
    occupation: 'Designer',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-10',
    familyId: 'family-1',
    firstName: 'Aarav',
    lastName: 'Menon',
    displayName: 'Aarav Menon',
    gender: 'MALE' as const,
    dateOfBirth: '2003-10-24',
    occupation: 'Student',
    city: 'Kochi',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-11',
    familyId: 'family-1',
    firstName: 'Leena',
    lastName: 'Chandran',
    displayName: 'Leena Chandran',
    gender: 'FEMALE' as const,
    dateOfBirth: '1979-06-26',
    occupation: 'Teacher',
    city: 'Ernakulam',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-12',
    familyId: 'family-1',
    firstName: 'Krishna',
    lastName: 'Nair',
    displayName: 'Krishna Nair',
    gender: 'MALE' as const,
    dateOfBirth: '2007-04-14',
    occupation: 'Student',
    city: 'Ernakulam',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-13',
    familyId: 'family-1',
    firstName: 'Nisha',
    lastName: 'Nair',
    displayName: 'Nisha Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '2010-09-30',
    occupation: 'Student',
    city: 'Ernakulam',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-14',
    familyId: 'family-1',
    firstName: 'Ajay',
    lastName: 'Nair',
    displayName: 'Ajay Nair',
    gender: 'MALE' as const,
    dateOfBirth: '1977-12-02',
    occupation: 'Consultant',
    city: 'Kozhikode',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-15',
    familyId: 'family-1',
    firstName: 'Anika',
    lastName: 'Nair',
    displayName: 'Anika Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '2004-02-18',
    occupation: 'Student',
    city: 'Kozhikode',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-16',
    familyId: 'family-1',
    firstName: 'Vivek',
    lastName: 'Nair',
    displayName: 'Vivek Nair',
    gender: 'MALE' as const,
    dateOfBirth: '2008-07-09',
    occupation: 'Student',
    city: 'Kozhikode',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-17',
    familyId: 'family-1',
    firstName: 'Sushma',
    lastName: 'Nair',
    displayName: 'Sushma Nair',
    gender: 'FEMALE' as const,
    dateOfBirth: '1986-06-10',
    occupation: 'Lawyer',
    city: 'Trivandrum',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
  {
    id: 'p-18',
    familyId: 'family-1',
    firstName: 'Aditya',
    lastName: 'Nair',
    displayName: 'Aditya Nair',
    gender: 'MALE' as const,
    dateOfBirth: '2013-04-05',
    occupation: 'Student',
    city: 'Trivandrum',
    country: 'India',
    visibleFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'occupation', 'city', 'country'],
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
  },
];

const MOCK_GRAPH: FamilyGraphPayload = {
  persons: MOCK_PERSONS,
  marriages: [
    {
      id: 'm-1',
      familyId: 'family-1',
      spouseIds: ['p-1', 'p-2'],
      marriageDate: '1970-05-01',
      location: 'Kochi',
      notes: 'Married in family home',
      isActive: true,
    },
    {
      id: 'm-2',
      familyId: 'family-1',
      spouseIds: ['p-3', 'p-8'],
      marriageDate: '2002-06-10',
      location: 'Kochi',
      notes: 'Family wedding',
      isActive: true,
    },
    {
      id: 'm-3',
      familyId: 'family-1',
      spouseIds: ['p-4', 'p-11'],
      marriageDate: '2006-11-18',
      location: 'Ernakulam',
      notes: 'Family wedding',
      isActive: true,
    },
    {
      id: 'm-4',
      familyId: 'family-1',
      spouseIds: ['p-5', 'p-14'],
      marriageDate: '2004-03-12',
      location: 'Kozhikode',
      notes: 'Family wedding',
      isActive: true,
    },
    {
      id: 'm-5',
      familyId: 'family-1',
      spouseIds: ['p-6', 'p-17'],
      marriageDate: '2010-02-05',
      location: 'Trivandrum',
      notes: 'Family wedding',
      isActive: true,
    },
    {
      id: 'm-6',
      familyId: 'family-1',
      spouseIds: ['p-18', 'p-15'],
      marriageDate: '2030-01-22',
      location: 'Kozhikode',
      notes: 'First-cousin marriage accepted in the family tradition',
      isActive: true,
    },
  ],
  parentChildEdges: [
    { parentId: 'p-1', childId: 'p-3' },
    { parentId: 'p-2', childId: 'p-3' },
    { parentId: 'p-1', childId: 'p-4' },
    { parentId: 'p-2', childId: 'p-4' },
    { parentId: 'p-1', childId: 'p-5' },
    { parentId: 'p-2', childId: 'p-5' },
    { parentId: 'p-1', childId: 'p-6' },
    { parentId: 'p-2', childId: 'p-6' },
    { parentId: 'p-3', childId: 'p-9' },
    { parentId: 'p-8', childId: 'p-9' },
    { parentId: 'p-3', childId: 'p-10' },
    { parentId: 'p-8', childId: 'p-10' },
    { parentId: 'p-4', childId: 'p-12' },
    { parentId: 'p-11', childId: 'p-12' },
    { parentId: 'p-4', childId: 'p-13' },
    { parentId: 'p-11', childId: 'p-13' },
    { parentId: 'p-5', childId: 'p-15' },
    { parentId: 'p-14', childId: 'p-15' },
    { parentId: 'p-5', childId: 'p-16' },
    { parentId: 'p-14', childId: 'p-16' },
    { parentId: 'p-6', childId: 'p-18' },
    { parentId: 'p-17', childId: 'p-18' },
  ],
  spouseMarriageEdges: [
    { marriageId: 'm-1', spouseId: 'p-1' },
    { marriageId: 'm-1', spouseId: 'p-2' },
    { marriageId: 'm-2', spouseId: 'p-3' },
    { marriageId: 'm-2', spouseId: 'p-8' },
    { marriageId: 'm-3', spouseId: 'p-4' },
    { marriageId: 'm-3', spouseId: 'p-11' },
    { marriageId: 'm-4', spouseId: 'p-5' },
    { marriageId: 'm-4', spouseId: 'p-14' },
    { marriageId: 'm-5', spouseId: 'p-6' },
    { marriageId: 'm-5', spouseId: 'p-17' },
    { marriageId: 'm-6', spouseId: 'p-18' },
    { marriageId: 'm-6', spouseId: 'p-15' },
  ],
  marriageChildEdges: [
    { marriageId: 'm-1', childId: 'p-3' },
    { marriageId: 'm-1', childId: 'p-4' },
    { marriageId: 'm-1', childId: 'p-5' },
    { marriageId: 'm-1', childId: 'p-6' },
    { marriageId: 'm-2', childId: 'p-9' },
    { marriageId: 'm-2', childId: 'p-10' },
    { marriageId: 'm-3', childId: 'p-12' },
    { marriageId: 'm-3', childId: 'p-13' },
    { marriageId: 'm-4', childId: 'p-15' },
    { marriageId: 'm-4', childId: 'p-16' },
    { marriageId: 'm-5', childId: 'p-18' },
  ],
  cousinPairs: [],
};

const MIME_TO_ENUM_KEY: Record<PhotoMimeType, string> = {
  [PhotoMimeType.JPEG]: 'JPEG',
  [PhotoMimeType.PNG]: 'PNG',
  [PhotoMimeType.WEBP]: 'WEBP',
};

export async function fetchFamilyGraph(
  _familyId: string,
  _accessToken: string,
): Promise<FamilyGraphPayload> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return MOCK_GRAPH;
}

export async function fetchPerson(
  familyId: string,
  personId: string,
  _forEdit: boolean,
  _accessToken: string,
): Promise<Person> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const person = MOCK_PERSONS.find((item) => item.familyId === familyId && item.id === personId);
  if (!person) {
    throw new Error('Person not found in mock data.');
  }
  return person;
}

export async function createPerson(
  input: CreatePersonInput,
  _accessToken: string,
): Promise<Person> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const person: Person = {
    id: `p-${Date.now()}`,
    familyId: input.familyId,
    firstName: input.firstName,
    middleName: input.middleName,
    lastName: input.lastName,
    displayName: input.displayName,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    dateOfDeath: input.dateOfDeath,
    village: input.village,
    city: input.city,
    country: input.country,
    visibleFields: input.visibleFields ?? ['displayName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_PERSONS.push(person);
  MOCK_GRAPH.persons = MOCK_PERSONS;
  return person;
}

export async function updatePerson(
  input: UpdatePersonInput,
  _accessToken: string,
): Promise<Person> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const existing = MOCK_PERSONS.find((person) => person.id === input.personId) ?? MOCK_PERSONS[0];
  const updated: Person = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  const index = MOCK_PERSONS.findIndex((person) => person.id === input.personId);
  if (index >= 0) MOCK_PERSONS[index] = updated;
  MOCK_GRAPH.persons = MOCK_PERSONS;
  return updated;
}

export async function addParentChild(
  input: AddParentChildInput,
  _accessToken: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  MOCK_GRAPH.parentChildEdges.push({ parentId: input.parentId, childId: input.childId });
  return true;
}

export async function createMarriage(
  input: CreateMarriageInput,
  _accessToken: string,
): Promise<{ id: string; spouseIds: string[] }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const marriage = {
    id: `m-${Date.now()}`,
    spouseIds: input.spouseIds,
  };
  MOCK_GRAPH.marriages.push({
    ...marriage,
    familyId: input.familyId,
    marriageDate: input.marriageDate,
    location: input.location,
    notes: input.notes,
    isActive: true,
  });
  MOCK_GRAPH.spouseMarriageEdges.push(
    { marriageId: marriage.id, spouseId: input.spouseIds[0] },
    { marriageId: marriage.id, spouseId: input.spouseIds[1] },
  );
  return marriage;
}

export async function deletePerson(
  _familyId: string,
  personId: string,
  _accessToken: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const idx = MOCK_PERSONS.findIndex((person) => person.id === personId);
  if (idx >= 0) MOCK_PERSONS.splice(idx, 1);
  MOCK_GRAPH.persons = MOCK_PERSONS;
  return true;
}

export async function requestPhotoUpload(
  input: RequestPhotoUploadInput,
  _accessToken: string,
): Promise<PhotoUploadRequest> {
  await new Promise((resolve) => setTimeout(resolve, 160));
  return {
    uploadUrl: 'https://example.com/mock-upload',
    objectKey: `${input.personId}-${Date.now()}.png`,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
}

export async function confirmPhotoUpload(
  input: ConfirmPhotoUploadInput,
  _accessToken: string,
): Promise<Person> {
  await new Promise((resolve) => setTimeout(resolve, 160));
  const person = MOCK_PERSONS.find((item) => item.id === input.personId) ?? MOCK_PERSONS[0];
  const updated = { ...person, photoUrl: input.objectKey, updatedAt: new Date().toISOString() };
  const index = MOCK_PERSONS.findIndex((item) => item.id === input.personId);
  if (index >= 0) MOCK_PERSONS[index] = updated;
  return updated;
}

export async function uploadPhotoFile(_uploadUrl: string, _file: File): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}
