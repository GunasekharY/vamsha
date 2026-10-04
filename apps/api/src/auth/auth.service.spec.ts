import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { Neo4jService } from '../neo4j/neo4j.service';
import { RedisService } from '../redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let neo4j: { runRead: jest.Mock; runWrite: jest.Mock };
  let redis: { setWithTtl: jest.Mock; get: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    neo4j = { runRead: jest.fn(), runWrite: jest.fn() };
    redis = { setWithTtl: jest.fn(), get: jest.fn(), del: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: Neo4jService, useValue: neo4j },
        { provide: RedisService, useValue: redis },
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) =>
              ({
                JWT_ACCESS_SECRET: 'test_access_secret',
                JWT_REFRESH_SECRET: 'test_refresh_secret',
                JWT_ACCESS_TTL: '15m',
                JWT_REFRESH_TTL: '7d',
              })[key] ?? fallback,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers a new user and issues tokens', async () => {
    neo4j.runRead.mockResolvedValueOnce([]); // no existing user with that email
    neo4j.runWrite.mockResolvedValueOnce([]);

    const result = await service.register({
      email: 'akshay@example.com',
      password: 'a-very-long-password',
      name: 'Akshay Reddy',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('akshay@example.com');
    expect(redis.setWithTtl).toHaveBeenCalledTimes(1);
  });

  it('rejects registration with a duplicate email', async () => {
    neo4j.runRead.mockResolvedValueOnce([{ id: 'existing-id' }]);

    await expect(
      service.register({
        email: 'akshay@example.com',
        password: 'a-very-long-password',
        name: 'Akshay Reddy',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with correct credentials', async () => {
    const passwordHash = await argon2.hash('correct-password');
    neo4j.runRead.mockResolvedValueOnce([
      {
        id: 'user-1',
        email: 'akshay@example.com',
        name: 'Akshay Reddy',
        passwordHash,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const result = await service.login({
      email: 'akshay@example.com',
      password: 'correct-password',
    });

    expect(result.user.id).toBe('user-1');
  });

  it('rejects login with the wrong password', async () => {
    const passwordHash = await argon2.hash('correct-password');
    neo4j.runRead.mockResolvedValueOnce([
      {
        id: 'user-1',
        email: 'akshay@example.com',
        name: 'Akshay Reddy',
        passwordHash,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    await expect(
      service.login({ email: 'akshay@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for an unknown email with the same error as a wrong password', async () => {
    neo4j.runRead.mockResolvedValueOnce([]);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever12345' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
