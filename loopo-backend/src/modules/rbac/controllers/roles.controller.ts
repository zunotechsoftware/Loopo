import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('roles.create', 'roles.update', 'roles.delete') // requiring any of roles management permission or users view
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all system roles.' })
  async findAll() {
    const roles = await this.rbacService.getAllRoles();
    return { message: 'Roles retrieved successfully', data: roles };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('roles.create', 'roles.update')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async findOne(@Param('id') id: string) {
    const role = await this.rbacService.getRole(id);
    return { message: 'Role retrieved successfully', data: role };
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @Permissions('roles.create')
  @LogAudit('CREATE_ROLE', 'Role')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiResponse({ status: 409, description: 'Role already exists.' })
  async create(@Body() createRoleDto: CreateRoleDto, @Request() req: any) {
    const role = await this.rbacService.createRole(createRoleDto.name, createRoleDto.description, req.user.id);
    return { message: 'Role created successfully', data: role };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('roles.update')
  @LogAudit('UPDATE_ROLE', 'Role')
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: any,
  ) {
    const role = await this.rbacService.updateRole(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
      req.user.id,
    );
    return { message: 'Role updated successfully', data: role };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('roles.delete')
  @LogAudit('DELETE_ROLE', 'Role')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async remove(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
    return { message: 'Role deleted successfully', data: {} };
  }
}
