import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permission.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('roles.create', 'roles.update') // restricting to role managers
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all system permissions.' })
  async findAll() {
    const permissions = await this.rbacService.getAllPermissions();
    return { message: 'Permissions retrieved successfully', data: permissions };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission details.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  async findOne(@Param('id') id: string) {
    const permission = await this.rbacService.getPermission(id);
    return { message: 'Permission retrieved successfully', data: permission };
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully.' })
  @ApiResponse({ status: 409, description: 'Permission already exists.' })
  async create(@Body() createPermDto: CreatePermissionDto, @Request() req: any) {
    const permission = await this.rbacService.createPermission(
      createPermDto.name,
      createPermDto.description,
      req.user.id,
    );
    return { message: 'Permission created successfully', data: permission };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePermDto: UpdatePermissionDto,
    @Request() req: any,
  ) {
    const permission = await this.rbacService.updatePermission(
      id,
      updatePermDto.name,
      updatePermDto.description,
      req.user.id,
    );
    return { message: 'Permission updated successfully', data: permission };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  async remove(@Param('id') id: string) {
    await this.rbacService.deletePermission(id);
    return { message: 'Permission deleted successfully', data: {} };
  }
}
