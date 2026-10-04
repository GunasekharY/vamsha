import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';
import { Neo4jService } from '../neo4j/neo4j.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<StoredUser, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<IssuedTokens> {
    const existing = await this.neo4j.runRead<{ id: string }>(
      'MATCH (u:User {email: $email}) RETURN u.id AS id',
      { email: input.email },
    );
    if (existing.length > 0) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(input.password);
    const id = uuid();
    const createdAt = new Date().toISOString();

    await this.neo4j.runWrite(
      `CREATE (u:User {
         id: $id, email: $email, name: $name,
         passwordHash: $passwordHash, createdAt: $createdAt
       })`,
      { id, email: input.email, name: input.name, passwordHash, createdAt },
    );

    return this.issueTokens({ id, email: input.email, name: input.name, passwordHash, createdAt });
  }

  async login(input: LoginInput): Promise<IssuedTokens> {
    const users = await this.neo4j.runRead<StoredUser>(
      `MATCH (u:User {email: $email})
       RETURN u.id AS id, u.email AS email, u.name AS name,
              u.passwordHash AS passwordHash, u.createdAt AS createdAt`,
      { email: input.email },
    );
    const user = users[0];
    // Same error whether the email is unknown or the password is wrong —
    // avoids leaking which accounts exist.
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<IssuedTokens> {
    let payload: { sub: string; email: string; jti: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const users = await this.neo4j.runRead<StoredUser>(
      `MATCH (u:User {id: $id})
       RETURN u.id AS id, u.email AS email, u.name AS name,
              u.passwordHash AS passwordHash, u.createdAt AS createdAt`,
      { id: payload.sub },
    );
    const user = users[0];
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return this.issueTokens(user);
  }

  async logout(_refreshToken: string): Promise<void> {
    // Redis-backed refresh-token revocation is disabled for local Neo4j-only mode.
    // Logout is treated as a no-op while the app runs without Redis.
  }

  private async issueTokens(user: StoredUser): Promise<IssuedTokens> {
    const jti = uuid();
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
      },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, email: user.email, jti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
      },
    );

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }
}
