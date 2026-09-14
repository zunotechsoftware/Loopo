import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRolesService } from './admin-roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/admin-role.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @Permissions('roles.view')
  @ApiOperation({ summary: 'List all roles with their permissions and assigned-user counts' })
  async getRoles() {
    return this.adminRolesService.getAllRoles();
  }

  @Post()
  @Permissions('roles.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  async createRole(@CurrentUser('id') adminId: string, @Body() dto: CreateRoleDto) {
    return this.adminRolesService.createRole(adminId, dto);
  }

  @Patch(':id')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Update a role\'s name, description, or permission set' })
  async updateRole(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminRolesService.updateRole(adminId, id, dto);
  }

  @Delete(':id')
  @Permissions('roles.delete')
  @ApiOperation({ summary: 'Delete a role (only if no users are assigned to it)' })
  async deleteRole(@Param('id') id: string) {
    return this.adminRolesService.deleteRole(id);
  }
}

// Permissions are their own top-level resource (matches the frontend's
// existing rolesService.getPermissions() call to GET /admin/permissions,
// a sibling of /admin/roles rather than nested under it).
@ApiTags('Admin - Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @Permissions('roles.view')
  @ApiOperation({ summary: 'List every permission that exists in the system' })
  async getPermissions() {
    return this.adminRolesService.getAllPermissions();
  }
}
