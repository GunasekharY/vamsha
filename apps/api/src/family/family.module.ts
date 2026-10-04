import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyResolver } from './family.resolver';
import { FamilyRoleGuard } from './family-role.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FamilyService, FamilyResolver, FamilyRoleGuard],
  exports: [FamilyService, FamilyRoleGuard],
})
export class FamilyModule {}
