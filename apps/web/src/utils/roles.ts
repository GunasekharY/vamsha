import { FamilyRole } from '@vamsha/shared-types';

const ROLE_RANK: Record<FamilyRole, number> = {
  [FamilyRole.VIEWER]: 0,
  [FamilyRole.EDITOR]: 1,
  [FamilyRole.ADMIN]: 2,
  [FamilyRole.OWNER]: 3,
};

/**
 * UX-only gating — the server's FamilyRoleGuard re-validates every
 * mutation independently, so this never needs to be a security boundary.
 */
export function hasAtLeastRole(myRole: FamilyRole | undefined, minRole: FamilyRole): boolean {
  if (!myRole) return false;
  return ROLE_RANK[myRole] >= ROLE_RANK[minRole];
}
