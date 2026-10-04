import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { FamilyRole } from '@vamsha/shared-types';

registerEnumType(FamilyRole, { name: 'FamilyRole' });

@InputType()
export class CreateFamilyInput {
  @Field()
  @IsString()
  @MinLength(1)
  name!: string;
}

@ObjectType()
export class FamilyType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field(() => FamilyRole)
  myRole!: FamilyRole;
}
