import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FamilyRole } from '@vamsha/shared-types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { FamilyRoleGuard, RequireFamilyRole } from '../family/family-role.guard';
import {
  AddParentChildInput,
  ConfirmPhotoUploadInput,
  CreateMarriageInput,
  CreatePersonInput,
  FamilyGraphType,
  MarriageType,
  PersonType,
  PhotoUploadRequestType,
  RequestPhotoUploadInput,
  UpdatePersonInput,
} from './dto/person.types';
import { PersonService } from './person.service';
import { StorageService } from '../storage/storage.service';

@UseGuards(GqlAuthGuard, FamilyRoleGuard)
@Resolver()
export class PersonResolver {
  constructor(
    private readonly personService: PersonService,
    private readonly storageService: StorageService,
  ) {}

  @Query(() => FamilyGraphType)
  @RequireFamilyRole(FamilyRole.VIEWER)
  async familyGraph(@Args('familyId') familyId: string): Promise<FamilyGraphType> {
    return this.personService.getFamilyGraph(familyId);
  }

  @Query(() => PersonType)
  @RequireFamilyRole(FamilyRole.VIEWER)
  async person(
    @Args('familyId') familyId: string,
    @Args('personId') personId: string,
    @Args('forEdit', { nullable: true, defaultValue: false }) forEdit: boolean,
  ): Promise<PersonType> {
    return this.personService.getPerson(familyId, personId, forEdit);
  }

  @Mutation(() => PersonType)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async createPerson(@Args('input') input: CreatePersonInput): Promise<PersonType> {
    return this.personService.createPerson(input);
  }

  @Mutation(() => PersonType)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async updatePerson(@Args('input') input: UpdatePersonInput): Promise<PersonType> {
    return this.personService.updatePerson(input);
  }

  @Mutation(() => Boolean)
  @RequireFamilyRole(FamilyRole.ADMIN)
  async deletePerson(
    @Args('familyId') familyId: string,
    @Args('personId') personId: string,
  ): Promise<boolean> {
    return this.personService.deletePerson(familyId, personId);
  }

  @Mutation(() => Boolean)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async addParentChild(@Args('input') input: AddParentChildInput): Promise<boolean> {
    return this.personService.addParentChild(input);
  }

  @Mutation(() => MarriageType)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async createMarriage(@Args('input') input: CreateMarriageInput): Promise<MarriageType> {
    return this.personService.createMarriage(input);
  }

  @Mutation(() => PhotoUploadRequestType)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async requestPhotoUpload(
    @Args('input') input: RequestPhotoUploadInput,
  ): Promise<PhotoUploadRequestType> {
    await this.personService.getPerson(input.familyId, input.personId, true);
    return this.storageService.requestPhotoUpload(input);
  }

  @Mutation(() => PersonType)
  @RequireFamilyRole(FamilyRole.EDITOR)
  async confirmPhotoUpload(
    @Args('input') input: ConfirmPhotoUploadInput,
  ): Promise<PersonType> {
    const photoUrl = this.storageService.getPublicUrl(input.objectKey);
    this.storageService.validateObjectKey(input.objectKey, input.familyId, input.personId);
    return this.personService.setPhotoUrl(input.familyId, input.personId, photoUrl);
  }
}
