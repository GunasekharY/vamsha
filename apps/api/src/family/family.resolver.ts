import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FamilyService } from './family.service';
import { CreateFamilyInput, FamilyType } from './dto/family.types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(GqlAuthGuard)
@Resolver()
export class FamilyResolver {
  constructor(private readonly familyService: FamilyService) {}

  @Mutation(() => FamilyType)
  async createFamily(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateFamilyInput,
  ): Promise<FamilyType> {
    return this.familyService.createFamily(user.userId, input);
  }

  @Query(() => [FamilyType])
  async myFamilies(@CurrentUser() user: AuthenticatedUser): Promise<FamilyType[]> {
    return this.familyService.findFamiliesForUser(user.userId);
  }
}
