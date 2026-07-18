import { Module } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { RbacRepository } from './repositories/rbac.repository';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { UserRolesController } from './controllers/user-roles.controller';

@Module({
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [RbacService, RbacRepository],
  exports: [RbacService, RbacRepository],
})
export class RbacModule {}
