import { Global, Module, OnModuleInit } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

/**
 * Ensures a person always has a globally unique ID within the family
 * (plan section 6) by enforcing it at the database level, not just in
 * application code.
 */
@Global()
@Module({
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule implements OnModuleInit {
  constructor(private readonly neo4j: Neo4jService) {}

  async onModuleInit(): Promise<void> {
    const constraints = [
      'CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE',
      'CREATE CONSTRAINT family_id_unique IF NOT EXISTS FOR (f:Family) REQUIRE f.id IS UNIQUE',
      'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
      'CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
      'CREATE CONSTRAINT marriage_id_unique IF NOT EXISTS FOR (m:Marriage) REQUIRE m.id IS UNIQUE',
    ];

    for (const cypher of constraints) {
      await this.neo4j.runWrite(cypher);
    }
  }
}
