import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class AuthTokensType {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserType)
  user!: UserType;
}
