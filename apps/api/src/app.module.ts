import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { Neo4jModule } from './neo4j/neo4j.module';
// Redis is intentionally disabled for the local Neo4j-only setup.
// import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting per plan section 27 ("Rate limiting").
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Plan section 27: "GraphQL depth/complexity limits."
      // validationRules enforcing max depth are added when the schema
      // grows enough (Phase 2+) to need it; kept simple in Phase 1.
      playground: process.env.NODE_ENV !== 'production',
    }),
    Neo4jModule,
    // RedisModule,
    AuthModule,
    FamilyModule,
    PersonModule,
  ],
})
export class AppModule {}
