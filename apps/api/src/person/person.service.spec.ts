import { Test } from '@nestjs/testing';
import { Gender, PersonFieldKey } from '@vamsha/shared-types';
import { PersonService } from './person.service';
import { Neo4jService } from '../neo4j/neo4j.service';
import { FamilyService } from '../family/family.service';

describe('PersonService', () => {
  let service: PersonService;
  let neo4j: { runRead: jest.Mock; runWrite: jest.Mock };
  let familyService: { requireFamily: jest.Mock };

  const baseRow = {
    id: 'person-1',
    familyId: 'family-1',
    firstName: 'Akshay',
    middleName: undefined,
    lastName: 'Sharma',
    displayName: 'Akshay Sharma',
    gender: Gender.MALE,
    dateOfBirth: '1990-01-01',
    dateOfDeath: undefined,
    photoUrl: 'http://example.com/photo.jpg',
    biography: 'Private bio',
    occupation: 'Engineer',
    village: undefined,
    city: 'Hyderabad',
    country: 'India',
    phone: '9999999999',
    email: 'akshay@example.com',
    notes: undefined,
    visibleFields: JSON.stringify(['firstName', 'city'] as PersonFieldKey[]),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    neo4j = { runRead: jest.fn(), runWrite: jest.fn() };
    familyService = { requireFamily: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: Neo4jService, useValue: neo4j },
        { provide: FamilyService, useValue: familyService },
      ],
    }).compile();

    service = moduleRef.get(PersonService);
  });

  describe('toDisplayPerson', () => {
    it('shows only opted-in optional fields on display views', () => {
      const full = service['rowToPerson'](baseRow);
      const display = service.toDisplayPerson(full);

      expect(display.displayName).toBe('Akshay Sharma');
      expect(display.firstName).toBe('Akshay');
      expect(display.city).toBe('Hyderabad');
      expect(display.lastName).toBeUndefined();
      expect(display.photoUrl).toBeUndefined();
      expect(display.biography).toBeUndefined();
      expect(display.phone).toBeUndefined();
    });

    it('returns full person when forEdit is true via getPerson', async () => {
      neo4j.runRead.mockResolvedValueOnce([baseRow]);

      const person = await service.getPerson('family-1', 'person-1', true);

      expect(person.biography).toBe('Private bio');
      expect(person.photoUrl).toBe('http://example.com/photo.jpg');
    });
  });

  describe('createMarriage', () => {
    it('allows first-cousin marriage without validation errors', async () => {
      neo4j.runRead
        .mockResolvedValueOnce([{ ...baseRow, id: 'akshay' }])
        .mockResolvedValueOnce([{ ...baseRow, id: 'priya', displayName: 'Priya Sharma' }]);

      neo4j.runWrite.mockResolvedValueOnce([]);

      neo4j.runRead
        .mockResolvedValueOnce([
          {
            id: 'marriage-1',
            familyId: 'family-1',
            isActive: true,
            marriageDate: undefined,
            location: undefined,
            notes: undefined,
          },
        ])
        .mockResolvedValueOnce([{ spouseId: 'akshay' }])
        .mockResolvedValueOnce([{ spouseId: 'priya' }]);

      const result = await service.createMarriage({
        familyId: 'family-1',
        spouseIds: ['akshay', 'priya'],
      });

      expect(result.spouseIds).toEqual(['akshay', 'priya']);
      expect(neo4j.runWrite).toHaveBeenCalledWith(
        expect.stringContaining('SPOUSE_IN'),
        expect.objectContaining({ spouseA: 'akshay', spouseB: 'priya' }),
      );
    });
  });

  describe('createPerson', () => {
    it('creates a person with empty visibleFields by default', async () => {
      neo4j.runWrite.mockResolvedValueOnce([
        { ...baseRow, visibleFields: '[]' },
      ]);

      const result = await service.createPerson({
        familyId: 'family-1',
        displayName: 'New Person',
      });

      expect(result.visibleFields).toEqual([]);
      expect(neo4j.runWrite).toHaveBeenCalledWith(
        expect.stringContaining('HAS_MEMBER'),
        expect.objectContaining({ visibleFields: '[]' }),
      );
    });
  });
});
