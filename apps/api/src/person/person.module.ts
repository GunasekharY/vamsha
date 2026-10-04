import { Module } from '@nestjs/common';
import { FamilyModule } from '../family/family.module';
import { StorageModule } from '../storage/storage.module';
import { PersonResolver } from './person.resolver';
import { PersonService } from './person.service';

@Module({
  imports: [FamilyModule, StorageModule],
  providers: [PersonService, PersonResolver],
  exports: [PersonService],
})
export class PersonModule {}
