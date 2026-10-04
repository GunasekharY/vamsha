import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters.' })
  password!: string;

  @Field()
  @IsString()
  @MinLength(1)
  name!: string;
}
