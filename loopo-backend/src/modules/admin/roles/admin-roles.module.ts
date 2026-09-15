import { Module } from '@nestjs/common';
import { AdminRolesController, AdminPermissionsController } from './admin-roles.controller';
import { AdminRolesService } from './admin-roles.service';

@Module({
  controllers: [AdminRolesController, AdminPermissionsController],
  providers: [AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
