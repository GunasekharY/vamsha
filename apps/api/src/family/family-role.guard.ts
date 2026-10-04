import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FamilyRole } from '@vamsha/shared-types';
import { FamilyService } from './family.service';
import { AuthenticatedUser } from '../auth/authenticated-user.interface';

export const REQUIRED_ROLES_KEY = 'requiredFamilyRoles';
export const RequireFamilyRole = (...roles: FamilyRole[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);

const ROLE_RANK: Record<FamilyRole, number> = {
  [FamilyRole.VIEWER]: 0,
  [FamilyRole.EDITOR]: 1,
  [FamilyRole.ADMIN]: 2,
  [FamilyRole.OWNER]: 3,
};

/**
 * Expects the resolver argument object to contain a `familyId` field.
 * Never trusts a role claimed by the client — always re-derives it from
 * the MEMBER_OF edge in Neo4j (plan section 27: "Never trust client-side
 * permissions").
 */
@Injectable()
export class FamilyRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly familyService: FamilyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<FamilyRole[]>(
      REQUIRED_ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const ctx = GqlExecutionContext.create(context);
    const gqlArgs = ctx.getArgs<{ input?: { familyId?: string }; familyId?: string }>();
    const familyId = gqlArgs.familyId ?? gqlArgs.input?.familyId;
    const user = ctx.getContext().req.user as AuthenticatedUser | undefined;

    if (!familyId || !user) {
      throw new ForbiddenException('Missing family context.');
    }

    const role = await this.familyService.getRoleForUser(user.userId, familyId);
    if (!role) {
      throw new ForbiddenException('You are not a member of this family.');
    }

    const minRequiredRank = Math.min(...requiredRoles.map((r) => ROLE_RANK[r]));
    if (ROLE_RANK[role] < minRequiredRank) {
      throw new ForbiddenException('You do not have permission to do this.');
    }

    return true;
  }
}
