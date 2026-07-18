import { Controller, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { AssignRoleDto } from '../dto/role.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

@ApiTags('User Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully.' })
  @ApiResponse({ status: 404, description: 'User or Role not found.' })
  @ApiResponse({ status: 409, description: 'Role already assigned to user.' })
  async assign(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: any,
  ) {
    const userRole = await this.rbacService.assignRoleToUser(
      userId,
      assignRoleDto.roleId,
      req.user.id,
    );
    return { message: 'Role assigned to user successfully', data: userRole };
  }

  @Delete(':roleId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully.' })
  @ApiResponse({ status: 404, description: 'User role assignment not found.' })
  async revoke(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req: any,
  ) {
    await this.rbacService.removeRoleFromUser(userId, roleId, req.user.id);
    return { message: 'Role revoked from user successfully', data: {} };
  }
}
