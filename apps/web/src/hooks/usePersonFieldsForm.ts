import { useState } from 'react';
import { Gender } from '@vamsha/shared-types';
import type { CreatePersonInput, Person, PersonFieldKey, UpdatePersonInput } from '@vamsha/shared-types';

export interface PersonFieldsForm {
  displayName: string;
  setDisplayName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  middleName: string;
  setMiddleName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  gender: Gender | '';
  setGender: (v: Gender | '') => void;
  dateOfBirth: string;
  setDateOfBirth: (v: string) => void;
  dateOfDeath: string;
  setDateOfDeath: (v: string) => void;
  village: string;
  setVillage: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  occupation: string;
  setOccupation: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  biography: string;
  setBiography: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  visibleFields: Set<PersonFieldKey>;
  toggleVisibleField: (key: PersonFieldKey) => void;
  loadFrom: (person: Person) => void;
  toCreateInput: (familyId: string) => CreatePersonInput;
  toUpdateInput: (familyId: string, personId: string) => UpdatePersonInput;
}

export function usePersonFieldsForm(): PersonFieldsForm {
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [biography, setBiography] = useState('');
  const [notes, setNotes] = useState('');
  const [visibleFields, setVisibleFields] = useState<Set<PersonFieldKey>>(new Set());

  function toggleVisibleField(key: PersonFieldKey): void {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function loadFrom(person: Person): void {
    setDisplayName(person.displayName);
    setFirstName(person.firstName ?? '');
    setMiddleName(person.middleName ?? '');
    setLastName(person.lastName ?? '');
    setGender(person.gender ?? '');
    setDateOfBirth(person.dateOfBirth ?? '');
    setDateOfDeath(person.dateOfDeath ?? '');
    setVillage(person.village ?? '');
    setCity(person.city ?? '');
    setCountry(person.country ?? '');
    setOccupation(person.occupation ?? '');
    setPhone(person.phone ?? '');
    setEmail(person.email ?? '');
    setBiography(person.biography ?? '');
    setNotes(person.notes ?? '');
    setVisibleFields(new Set(person.visibleFields));
  }

  function common() {
    return {
      firstName: firstName.trim() || undefined,
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      displayName: displayName.trim(),
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      dateOfDeath: dateOfDeath || undefined,
      village: village.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      visibleFields: Array.from(visibleFields),
    };
  }

  function toCreateInput(familyId: string): CreatePersonInput {
    return { familyId, ...common() };
  }

  function toUpdateInput(familyId: string, personId: string): UpdatePersonInput {
    return {
      familyId,
      personId,
      ...common(),
      occupation: occupation.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      biography: biography.trim() || undefined,
      notes: notes.trim() || undefined,
    };
  }

  return {
    displayName,
    setDisplayName,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    dateOfDeath,
    setDateOfDeath,
    village,
    setVillage,
    city,
    setCity,
    country,
    setCountry,
    occupation,
    setOccupation,
    phone,
    setPhone,
    email,
    setEmail,
    biography,
    setBiography,
    notes,
    setNotes,
    visibleFields,
    toggleVisibleField,
    loadFrom,
    toCreateInput,
    toUpdateInput,
  };
}
