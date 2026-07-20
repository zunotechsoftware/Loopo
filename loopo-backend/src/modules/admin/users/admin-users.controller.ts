import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { UpdateUserStatusDto, UpdateUserRolesDto, CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminUsersService.getAllUsers(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      search,
      role,
      status
    );
  }

  @Get(':id')
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Get user details by ID' })
  async getUserDetails(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAdminUserDto,
  ) {
    return this.adminUsersService.createUser(adminId, dto);
  }

  @Patch(':id')
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Update a user' })
  async updateUserDetails(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.updateUserDetails(id, adminId, dto);
  }

  @Delete(':id')
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Delete a user (soft delete)' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminUsersService.updateUserStatus(id, adminId, { status: 'DELETED' } as UpdateUserStatusDto);
  }

  @Patch(':id/status')
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Update user status (suspend, activate, delete, restore)' })
  async updateUserStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateUserStatus(id, adminId, dto);
  }

  @Patch(':id/roles')
  @Permissions('admin.users.manage')
  @ApiOperation({ summary: 'Update user roles' })
  async updateUserRoles(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.adminUsersService.updateUserRoles(id, adminId, dto);
  }
}
