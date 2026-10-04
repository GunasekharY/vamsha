import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, SessionMode } from 'neo4j-driver';

/**
 * Thin wrapper around the Neo4j driver. Every other module talks to Neo4j
 * only through this service (see docs/ARCHITECTURE.md) so the driver can be
 * swapped or a repository layer added later without touching business
 * logic elsewhere.
 */
@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver!: Driver;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const uri = this.config.get<string>('NEO4J_URI', 'bolt://localhost:7687');
    const user = this.config.get<string>('NEO4J_USER', 'neo4j');
    const password = this.config.get<string>('NEO4J_PASSWORD', '');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async onModuleDestroy(): Promise<void> {
    await this.driver?.close();
  }

  getSession(mode: SessionMode = neo4j.session.WRITE): Session {
    return this.driver.session({ defaultAccessMode: mode });
  }

  async runWrite<T = Record<string, unknown>>(
    cypher: string,
    params: Record<string, unknown> = {},
  ): Promise<T[]> {
    const session = this.getSession(neo4j.session.WRITE);
    try {
      const result = await session.executeWrite((tx) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async runRead<T = Record<string, unknown>>(
    cypher: string,
    params: Record<string, unknown> = {},
  ): Promise<T[]> {
    const session = this.getSession(neo4j.session.READ);
    try {
      const result = await session.executeRead((tx) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }
}
