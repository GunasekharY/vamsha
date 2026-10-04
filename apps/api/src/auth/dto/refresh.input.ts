import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RefreshInput {
  @Field()
  @IsString()
  refreshToken!: string;
}
