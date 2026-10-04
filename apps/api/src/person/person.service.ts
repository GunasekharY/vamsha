import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  areFirstCousins,
  deriveCousinPairs,
} from '@vamsha/graph-engine';
import type { ParentEdge } from '@vamsha/graph-engine';
import type {
  AddParentChildInput,
  CreateMarriageInput,
  CreatePersonInput,
  CousinPair,
  FamilyGraphPayload,
  Person,
  PersonFieldKey,
  UpdatePersonInput,
} from '@vamsha/shared-types';
import { Neo4jService } from '../neo4j/neo4j.service';
import { FamilyService } from '../family/family.service';

interface PersonRow {
  id: string;
  familyId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  displayName: string;
  gender?: string;
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
  visibleFields: string;
  createdAt: string;
  updatedAt: string;
}

interface MarriageRow {
  id: string;
  familyId: string;
  marriageDate?: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  spouseIds: string[];
}

const OPTIONAL_FIELDS: PersonFieldKey[] = [
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

@Injectable()
export class PersonService {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly familyService: FamilyService,
  ) {}

  /** Strips non-visible optional fields for tree cards and read-only views. */
  toDisplayPerson(person: Person): Person {
    const visible = new Set(person.visibleFields);
    const display: Person = {
      id: person.id,
      familyId: person.familyId,
      displayName: person.displayName,
      visibleFields: [...person.visibleFields],
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };

    for (const key of OPTIONAL_FIELDS) {
      if (visible.has(key) && person[key] !== undefined) {
        (display as unknown as Record<string, unknown>)[key] = person[key];
      }
    }

    return display;
  }

  async createPerson(input: CreatePersonInput): Promise<Person> {
    await this.familyService.requireFamily(input.familyId);

    const id = uuid();
    const now = new Date().toISOString();
    const visibleFields = JSON.stringify(input.visibleFields ?? []);

    const rows = await this.neo4j.runWrite<PersonRow>(
      `MATCH (f:Family {id: $familyId})
       CREATE (p:Person {
         id: $id,
         familyId: $familyId,
         firstName: $firstName,
         middleName: $middleName,
         lastName: $lastName,
         displayName: $displayName,
         gender: $gender,
         dateOfBirth: $dateOfBirth,
         dateOfDeath: $dateOfDeath,
         village: $village,
         city: $city,
         country: $country,
         visibleFields: $visibleFields,
         createdAt: $now,
         updatedAt: $now
       })
       CREATE (f)-[:HAS_MEMBER]->(p)
       RETURN p.id AS id, p.familyId AS familyId,
              p.firstName AS firstName, p.middleName AS middleName,
              p.lastName AS lastName, p.displayName AS displayName,
              p.gender AS gender, p.dateOfBirth AS dateOfBirth,
              p.dateOfDeath AS dateOfDeath, p.photoUrl AS photoUrl,
              p.biography AS biography, p.occupation AS occupation,
              p.village AS village, p.city AS city, p.country AS country,
              p.phone AS phone, p.email AS email, p.notes AS notes,
              p.visibleFields AS visibleFields,
              p.createdAt AS createdAt, p.updatedAt AS updatedAt`,
      {
        familyId: input.familyId,
        id,
        firstName: input.firstName ?? null,
        middleName: input.middleName ?? null,
        lastName: input.lastName ?? null,
        displayName: input.displayName,
        gender: input.gender ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        dateOfDeath: input.dateOfDeath ?? null,
        village: input.village ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        visibleFields,
        now,
      },
    );

    return this.rowToPerson(rows[0]);
  }

  async updatePerson(input: UpdatePersonInput): Promise<Person> {
    await this.requirePersonInFamily(input.personId, input.familyId);

    const now = new Date().toISOString();
    const visibleFields =
      input.visibleFields !== undefined
        ? JSON.stringify(input.visibleFields)
        : undefined;

    const rows = await this.neo4j.runWrite<PersonRow>(
      `MATCH (p:Person {id: $personId, familyId: $familyId})
       SET p.firstName = coalesce($firstName, p.firstName),
           p.middleName = coalesce($middleName, p.middleName),
           p.lastName = coalesce($lastName, p.lastName),
           p.displayName = coalesce($displayName, p.displayName),
           p.gender = coalesce($gender, p.gender),
           p.dateOfBirth = coalesce($dateOfBirth, p.dateOfBirth),
           p.dateOfDeath = coalesce($dateOfDeath, p.dateOfDeath),
           p.photoUrl = coalesce($photoUrl, p.photoUrl),
           p.biography = coalesce($biography, p.biography),
           p.occupation = coalesce($occupation, p.occupation),
           p.village = coalesce($village, p.village),
           p.city = coalesce($city, p.city),
           p.country = coalesce($country, p.country),
           p.phone = coalesce($phone, p.phone),
           p.email = coalesce($email, p.email),
           p.notes = coalesce($notes, p.notes),
           p.visibleFields = coalesce($visibleFields, p.visibleFields),
           p.updatedAt = $now
       RETURN p.id AS id, p.familyId AS familyId,
              p.firstName AS firstName, p.middleName AS middleName,
              p.lastName AS lastName, p.displayName AS displayName,
              p.gender AS gender, p.dateOfBirth AS dateOfBirth,
              p.dateOfDeath AS dateOfDeath, p.photoUrl AS photoUrl,
              p.biography AS biography, p.occupation AS occupation,
              p.village AS village, p.city AS city, p.country AS country,
              p.phone AS phone, p.email AS email, p.notes AS notes,
              p.visibleFields AS visibleFields,
              p.createdAt AS createdAt, p.updatedAt AS updatedAt`,
      {
        personId: input.personId,
        familyId: input.familyId,
        firstName: input.firstName ?? null,
        middleName: input.middleName ?? null,
        lastName: input.lastName ?? null,
        displayName: input.displayName ?? null,
        gender: input.gender ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        dateOfDeath: input.dateOfDeath ?? null,
        photoUrl: input.photoUrl ?? null,
        biography: input.biography ?? null,
        occupation: input.occupation ?? null,
        village: input.village ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        notes: input.notes ?? null,
        visibleFields: visibleFields ?? null,
        now,
      },
    );

    return this.rowToPerson(rows[0]);
  }

  async deletePerson(familyId: string, personId: string): Promise<boolean> {
    await this.requirePersonInFamily(personId, familyId);

    await this.neo4j.runWrite(
      `MATCH (p:Person {id: $personId, familyId: $familyId})
       DETACH DELETE p`,
      { personId, familyId },
    );

    return true;
  }

  async addParentChild(input: AddParentChildInput): Promise<boolean> {
    if (input.parentId === input.childId) {
      throw new BadRequestException('A person cannot be their own parent.');
    }

    await this.requirePersonInFamily(input.parentId, input.familyId);
    await this.requirePersonInFamily(input.childId, input.familyId);

    await this.neo4j.runWrite(
      `MATCH (parent:Person {id: $parentId, familyId: $familyId})
       MATCH (child:Person {id: $childId, familyId: $familyId})
       MERGE (parent)-[:PARENT_OF]->(child)`,
      {
        parentId: input.parentId,
        childId: input.childId,
        familyId: input.familyId,
      },
    );

    return true;
  }

  async createMarriage(input: CreateMarriageInput): Promise<MarriageRow> {
    const [spouseA, spouseB] = input.spouseIds;
    if (spouseA === spouseB) {
      throw new BadRequestException('A person cannot marry themselves.');
    }

    await this.requirePersonInFamily(spouseA, input.familyId);
    await this.requirePersonInFamily(spouseB, input.familyId);

    const marriageId = uuid();
    const now = new Date().toISOString();

    await this.neo4j.runWrite(
      `MATCH (a:Person {id: $spouseA, familyId: $familyId})
       MATCH (b:Person {id: $spouseB, familyId: $familyId})
       CREATE (m:Marriage {
         id: $marriageId,
         familyId: $familyId,
         marriageDate: $marriageDate,
         location: $location,
         notes: $notes,
         isActive: true,
         createdAt: $now,
         updatedAt: $now
       })
       CREATE (a)-[:SPOUSE_IN]->(m)
       CREATE (b)-[:SPOUSE_IN]->(m)`,
      {
        familyId: input.familyId,
        spouseA,
        spouseB,
        marriageId,
        marriageDate: input.marriageDate ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        now,
      },
    );

    if (input.childIds?.length) {
      for (const childId of input.childIds) {
        await this.requirePersonInFamily(childId, input.familyId);
        await this.neo4j.runWrite(
          `MATCH (m:Marriage {id: $marriageId, familyId: $familyId})
           MATCH (c:Person {id: $childId, familyId: $familyId})
           MERGE (m)-[:CHILD_OF_MARRIAGE]->(c)`,
          { marriageId, familyId: input.familyId, childId },
        );
      }
    }

    const marriages = await this.fetchMarriages(input.familyId);
    const marriage = marriages.find((m) => m.id === marriageId);
    if (!marriage) {
      throw new NotFoundException('Marriage not found after creation.');
    }
    return marriage;
  }

  async getPerson(
    familyId: string,
    personId: string,
    forEdit: boolean,
  ): Promise<Person> {
    const person = await this.requirePersonInFamily(personId, familyId);
    return forEdit ? person : this.toDisplayPerson(person);
  }

  async getFamilyGraph(familyId: string): Promise<FamilyGraphPayload> {
    await this.familyService.requireFamily(familyId);

    const personRows = await this.neo4j.runRead<PersonRow>(
      `MATCH (f:Family {id: $familyId})-[:HAS_MEMBER]->(p:Person)
       RETURN p.id AS id, p.familyId AS familyId,
              p.firstName AS firstName, p.middleName AS middleName,
              p.lastName AS lastName, p.displayName AS displayName,
              p.gender AS gender, p.dateOfBirth AS dateOfBirth,
              p.dateOfDeath AS dateOfDeath, p.photoUrl AS photoUrl,
              p.biography AS biography, p.occupation AS occupation,
              p.village AS village, p.city AS city, p.country AS country,
              p.phone AS phone, p.email AS email, p.notes AS notes,
              p.visibleFields AS visibleFields,
              p.createdAt AS createdAt, p.updatedAt AS updatedAt`,
      { familyId },
    );

    const parentChildRows = await this.neo4j.runRead<{
      parentId: string;
      childId: string;
    }>(
      `MATCH (f:Family {id: $familyId})-[:HAS_MEMBER]->(parent:Person)-[:PARENT_OF]->(child:Person)
       WHERE (f)-[:HAS_MEMBER]->(child)
       RETURN parent.id AS parentId, child.id AS childId`,
      { familyId },
    );

    const marriages = await this.fetchMarriages(familyId);

    const spouseMarriageRows = await this.neo4j.runRead<{
      marriageId: string;
      spouseId: string;
    }>(
      `MATCH (f:Family {id: $familyId})-[:HAS_MEMBER]->(p:Person)-[:SPOUSE_IN]->(m:Marriage)
       RETURN m.id AS marriageId, p.id AS spouseId`,
      { familyId },
    );

    const marriageChildRows = await this.neo4j.runRead<{
      marriageId: string;
      childId: string;
    }>(
      `MATCH (f:Family {id: $familyId})-[:HAS_MEMBER]->(m:Marriage)-[:CHILD_OF_MARRIAGE]->(c:Person)
       RETURN m.id AS marriageId, c.id AS childId`,
      { familyId },
    );

    const persons = personRows.map((row) => this.toDisplayPerson(this.rowToPerson(row)));

    const parentEdges: ParentEdge[] = parentChildRows.map((e) => ({
      parentId: e.parentId,
      childId: e.childId,
    }));

    const cousinMap = deriveCousinPairs(parentEdges);
    const cousinPairs: CousinPair[] = [];
    const seenPairs = new Set<string>();

    for (const marriage of marriages) {
      if (marriage.spouseIds.length === 2) {
        const [a, b] = marriage.spouseIds;
        if (areFirstCousins(a, b, parentEdges)) {
          const key = [a, b].sort().join(':');
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            cousinPairs.push({ personAId: a, personBId: b, label: 'First cousin' });
          }
        }
      }
    }

    // Also include cousin pairs not yet married (for future UI)
    for (const [personId, cousins] of cousinMap.entries()) {
      for (const cousinId of cousins) {
        const key = [personId, cousinId].sort().join(':');
        if (!seenPairs.has(key)) {
          seenPairs.add(key);
          cousinPairs.push({
            personAId: personId,
            personBId: cousinId,
            label: 'First cousin',
          });
        }
      }
    }

    return {
      persons,
      marriages,
      parentChildEdges: parentChildRows,
      spouseMarriageEdges: spouseMarriageRows,
      marriageChildEdges: marriageChildRows,
      cousinPairs,
    };
  }

  async setPhotoUrl(
    familyId: string,
    personId: string,
    photoUrl: string,
  ): Promise<Person> {
    return this.updatePerson({ familyId, personId, photoUrl });
  }

  private async fetchMarriages(familyId: string): Promise<MarriageRow[]> {
    const marriageRows = await this.neo4j.runRead<{
      id: string;
      familyId: string;
      marriageDate?: string;
      location?: string;
      notes?: string;
      isActive: boolean;
    }>(
      `MATCH (m:Marriage {familyId: $familyId})
       RETURN m.id AS id, m.familyId AS familyId,
              m.marriageDate AS marriageDate, m.location AS location,
              m.notes AS notes, m.isActive AS isActive`,
      { familyId },
    );

    const result: MarriageRow[] = [];
    for (const row of marriageRows) {
      const spouseRows = await this.neo4j.runRead<{ spouseId: string }>(
        `MATCH (p:Person)-[:SPOUSE_IN]->(m:Marriage {id: $marriageId})
         RETURN p.id AS spouseId`,
        { marriageId: row.id },
      );
      result.push({
        ...row,
        spouseIds: spouseRows.map((s) => s.spouseId),
      });
    }
    return result;
  }

  private async requirePersonInFamily(
    personId: string,
    familyId: string,
  ): Promise<Person> {
    const rows = await this.neo4j.runRead<PersonRow>(
      `MATCH (p:Person {id: $personId, familyId: $familyId})
       RETURN p.id AS id, p.familyId AS familyId,
              p.firstName AS firstName, p.middleName AS middleName,
              p.lastName AS lastName, p.displayName AS displayName,
              p.gender AS gender, p.dateOfBirth AS dateOfBirth,
              p.dateOfDeath AS dateOfDeath, p.photoUrl AS photoUrl,
              p.biography AS biography, p.occupation AS occupation,
              p.village AS village, p.city AS city, p.country AS country,
              p.phone AS phone, p.email AS email, p.notes AS notes,
              p.visibleFields AS visibleFields,
              p.createdAt AS createdAt, p.updatedAt AS updatedAt`,
      { personId, familyId },
    );

    if (rows.length === 0) {
      throw new NotFoundException('Person not found in this family.');
    }

    return this.rowToPerson(rows[0]);
  }

  private rowToPerson(row: PersonRow): Person {
    let visibleFields: PersonFieldKey[] = [];
    try {
      visibleFields = JSON.parse(row.visibleFields || '[]') as PersonFieldKey[];
    } catch {
      visibleFields = [];
    }

    return {
      id: row.id,
      familyId: row.familyId,
      firstName: row.firstName,
      middleName: row.middleName,
      lastName: row.lastName,
      displayName: row.displayName,
      gender: row.gender as Person['gender'],
      dateOfBirth: row.dateOfBirth,
      dateOfDeath: row.dateOfDeath,
      photoUrl: row.photoUrl,
      biography: row.biography,
      occupation: row.occupation,
      village: row.village,
      city: row.city,
      country: row.country,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      visibleFields,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
