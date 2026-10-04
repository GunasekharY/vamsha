import { useQuery } from '@tanstack/react-query';
import type { FamilyRole } from '@vamsha/shared-types';
import { fetchMyFamilies, type FamilyWithRole } from '../api/family-api';
import { useAuthStore } from '../store/auth-store';

export function useCurrentFamily(familyId: string): {
  family: FamilyWithRole | undefined;
  myRole: FamilyRole | undefined;
  isLoading: boolean;
} {
  const accessToken = useAuthStore((state) => state.accessToken)!;

  const { data: families, isLoading } = useQuery({
    queryKey: ['myFamilies'],
    queryFn: () => fetchMyFamilies(accessToken),
  });

  const family = families?.find((f) => f.id === familyId);
  return { family, myRole: family?.myRole, isLoading };
}
