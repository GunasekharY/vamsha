import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { FamilyRole } from '@vamsha/shared-types';
import { Neo4jService } from '../neo4j/neo4j.service';
import { CreateFamilyInput } from './dto/family.types';

interface FamilyRow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  myRole: FamilyRole;
}

@Injectable()
export class FamilyService {
  constructor(private readonly neo4j: Neo4jService) {}

  async createFamily(userId: string, input: CreateFamilyInput): Promise<FamilyRow> {
    const id = uuid();
    const now = new Date().toISOString();

    const rows = await this.neo4j.runWrite<FamilyRow>(
      `MATCH (u:User {id: $userId})
       CREATE (f:Family {id: $id, name: $name, createdAt: $now, updatedAt: $now})
       CREATE (u)-[:MEMBER_OF {role: $role}]->(f)
       RETURN f.id AS id, f.name AS name, f.createdAt AS createdAt,
              f.updatedAt AS updatedAt, $role AS myRole`,
      { userId, id, name: input.name, now, role: FamilyRole.OWNER },
    );

    return rows[0];
  }

  async findFamiliesForUser(userId: string): Promise<FamilyRow[]> {
    return this.neo4j.runRead<FamilyRow>(
      `MATCH (u:User {id: $userId})-[m:MEMBER_OF]->(f:Family)
       RETURN f.id AS id, f.name AS name, f.createdAt AS createdAt,
              f.updatedAt AS updatedAt, m.role AS myRole
       ORDER BY f.createdAt DESC`,
      { userId },
    );
  }

  /**
   * Used by FamilyRoleGuard to authorize mutations against a specific
   * family. Never trust a role passed by the client (plan section 27).
   */
  async getRoleForUser(userId: string, familyId: string): Promise<FamilyRole | null> {
    const rows = await this.neo4j.runRead<{ role: FamilyRole }>(
      `MATCH (u:User {id: $userId})-[m:MEMBER_OF]->(f:Family {id: $familyId})
       RETURN m.role AS role`,
      { userId, familyId },
    );
    return rows[0]?.role ?? null;
  }

  async requireFamily(familyId: string): Promise<void> {
    const rows = await this.neo4j.runRead<{ id: string }>(
      'MATCH (f:Family {id: $familyId}) RETURN f.id AS id',
      { familyId },
    );
    if (rows.length === 0) {
      throw new NotFoundException('Family not found.');
    }
  }
}
