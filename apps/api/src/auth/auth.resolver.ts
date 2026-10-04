import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { RefreshInput } from './dto/refresh.input';
import { AuthTokensType, UserType } from './dto/auth.types';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from './authenticated-user.interface';
import { Neo4jService } from '../neo4j/neo4j.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly neo4j: Neo4jService,
  ) {}

  @Mutation(() => AuthTokensType)
  async register(@Args('input') input: RegisterInput): Promise<AuthTokensType> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthTokensType)
  async login(@Args('input') input: LoginInput): Promise<AuthTokensType> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthTokensType)
  async refreshTokens(@Args('input') input: RefreshInput): Promise<AuthTokensType> {
    return this.authService.refresh(input.refreshToken);
  }

  @Mutation(() => Boolean)
  async logout(@Args('input') input: RefreshInput): Promise<boolean> {
    await this.authService.logout(input.refreshToken);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserType)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserType> {
    const rows = await this.neo4j.runRead<UserType>(
      `MATCH (u:User {id: $id})
       RETURN u.id AS id, u.email AS email, u.name AS name, u.createdAt AS createdAt`,
      { id: user.userId },
    );
    return rows[0];
  }
}
