import type { Person } from '@vamsha/shared-types';

export function lifespan(person: Person): string | null {
  if (!person.dateOfBirth && !person.dateOfDeath) return null;
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '?';
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : '';
  return deathYear ? `${birthYear} – ${deathYear}` : `b. ${birthYear}`;
}

export function initial(displayName: string): string {
  return displayName.charAt(0).toUpperCase();
}
