import { Test } from '@nestjs/testing';
import { FamilyRole } from '@vamsha/shared-types';
import { FamilyService } from './family.service';
import { Neo4jService } from '../neo4j/neo4j.service';

describe('FamilyService', () => {
  let service: FamilyService;
  let neo4j: { runRead: jest.Mock; runWrite: jest.Mock };

  beforeEach(async () => {
    neo4j = { runRead: jest.fn(), runWrite: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [FamilyService, { provide: Neo4jService, useValue: neo4j }],
    }).compile();

    service = moduleRef.get(FamilyService);
  });

  it('creates a family and assigns the creator OWNER', async () => {
    neo4j.runWrite.mockResolvedValueOnce([
      {
        id: 'family-1',
        name: 'Yanuganti Family',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        myRole: FamilyRole.OWNER,
      },
    ]);

    const result = await service.createFamily('user-1', { name: 'Yanuganti Family' });

    expect(result.myRole).toBe(FamilyRole.OWNER);
    expect(neo4j.runWrite).toHaveBeenCalledWith(
      expect.stringContaining('MEMBER_OF'),
      expect.objectContaining({ userId: 'user-1', role: FamilyRole.OWNER }),
    );
  });

  it('returns null role when the user is not a member of the family', async () => {
    neo4j.runRead.mockResolvedValueOnce([]);

    const role = await service.getRoleForUser('user-1', 'family-1');

    expect(role).toBeNull();
  });

  it('returns the correct role when the user is a member', async () => {
    neo4j.runRead.mockResolvedValueOnce([{ role: FamilyRole.EDITOR }]);

    const role = await service.getRoleForUser('user-1', 'family-1');

    expect(role).toBe(FamilyRole.EDITOR);
  });
});
