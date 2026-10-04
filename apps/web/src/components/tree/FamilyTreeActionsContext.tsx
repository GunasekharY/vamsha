import { createContext, useContext } from 'react';

export interface FamilyTreeActions {
  familyId: string;
  canEdit: boolean;
  onQuickAdd: (personId: string, relation: 'parent' | 'child' | 'spouse') => void;
}

const FamilyTreeActionsContext = createContext<FamilyTreeActions | null>(null);

export function FamilyTreeActionsProvider({
  value,
  children,
}: {
  value: FamilyTreeActions;
  children: React.ReactNode;
}): JSX.Element {
  return <FamilyTreeActionsContext.Provider value={value}>{children}</FamilyTreeActionsContext.Provider>;
}

export function useFamilyTreeActions(): FamilyTreeActions {
  const ctx = useContext(FamilyTreeActionsContext);
  if (!ctx) throw new Error('useFamilyTreeActions must be used within FamilyTreeActionsProvider');
  return ctx;
}
