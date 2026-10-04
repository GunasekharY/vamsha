import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  Gender,
  PersonFieldKey,
  PhotoMimeType,
} from '@vamsha/shared-types';

registerEnumType(Gender, { name: 'Gender' });

registerEnumType(PhotoMimeType, { name: 'PhotoMimeType' });

const PersonFieldKeyEnum = {
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  gender: 'gender',
  dateOfBirth: 'dateOfBirth',
  dateOfDeath: 'dateOfDeath',
  photoUrl: 'photoUrl',
  biography: 'biography',
  occupation: 'occupation',
  village: 'village',
  city: 'city',
  country: 'country',
  phone: 'phone',
  email: 'email',
  notes: 'notes',
} as const;

registerEnumType(PersonFieldKeyEnum, { name: 'PersonFieldKey' });

@ObjectType()
export class PersonType {
  @Field()
  id!: string;

  @Field()
  familyId!: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  displayName!: string;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  dateOfDeath?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  biography?: string;

  @Field({ nullable: true })
  occupation?: string;

  @Field({ nullable: true })
  village?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String])
  visibleFields!: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

@ObjectType()
export class MarriageType {
  @Field()
  id!: string;

  @Field()
  familyId!: string;

  @Field(() => [String])
  spouseIds!: string[];

  @Field({ nullable: true })
  marriageDate?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class ParentChildEdgeType {
  @Field()
  parentId!: string;

  @Field()
  childId!: string;
}

@ObjectType()
export class SpouseMarriageEdgeType {
  @Field()
  marriageId!: string;

  @Field()
  spouseId!: string;
}

@ObjectType()
export class MarriageChildEdgeType {
  @Field()
  marriageId!: string;

  @Field()
  childId!: string;
}

@ObjectType()
export class CousinPairType {
  @Field()
  personAId!: string;

  @Field()
  personBId!: string;

  @Field()
  label!: string;
}

@ObjectType()
export class FamilyGraphType {
  @Field(() => [PersonType])
  persons!: PersonType[];

  @Field(() => [MarriageType])
  marriages!: MarriageType[];

  @Field(() => [ParentChildEdgeType])
  parentChildEdges!: ParentChildEdgeType[];

  @Field(() => [SpouseMarriageEdgeType])
  spouseMarriageEdges!: SpouseMarriageEdgeType[];

  @Field(() => [MarriageChildEdgeType])
  marriageChildEdges!: MarriageChildEdgeType[];

  @Field(() => [CousinPairType])
  cousinPairs!: CousinPairType[];
}

@InputType()
export class CreatePersonInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field()
  @IsString()
  @MinLength(1)
  displayName!: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  dateOfDeath?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  village?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  visibleFields?: PersonFieldKey[];
}

@InputType()
export class UpdatePersonInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field()
  @IsUUID()
  personId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  displayName?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  dateOfDeath?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  biography?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  village?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  visibleFields?: PersonFieldKey[];
}

@InputType()
export class AddParentChildInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field()
  @IsUUID()
  parentId!: string;

  @Field()
  @IsUUID()
  childId!: string;
}

@InputType()
export class CreateMarriageInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUUID(undefined, { each: true })
  spouseIds!: [string, string];

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  marriageDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  childIds?: string[];
}

@InputType()
export class RequestPhotoUploadInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field()
  @IsUUID()
  personId!: string;

  @Field(() => PhotoMimeType)
  @IsEnum(PhotoMimeType)
  contentType!: PhotoMimeType;

  @Field()
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  contentLength!: number;
}

@InputType()
export class ConfirmPhotoUploadInput {
  @Field()
  @IsUUID()
  familyId!: string;

  @Field()
  @IsUUID()
  personId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  objectKey!: string;
}

@ObjectType()
export class PhotoUploadRequestType {
  @Field()
  uploadUrl!: string;

  @Field()
  objectKey!: string;

  @Field()
  expiresAt!: string;
}
