import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttributesService } from '../services/attributes.service';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeGroupDto, UpdateAttributeGroupDto } from '../dto/attribute.dto';
import { CreateOptionDto } from '../dto/option.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';

@ApiTags('Attributes')
@Controller()
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  // --- Category Specific Attributes (Form Schemas) ---

  @Get('categories/:id/attributes')
  @Public()
  @ApiOperation({ summary: 'Get dynamic form attributes schema for a category' })
  @ApiResponse({ status: 200, description: 'Attributes schema including validation constraints and options.' })
  async findCategoryAttributes(@Param('id') id: string) {
    const attributes = await this.attributesService.getCategoryAttributes(id, true);
    return { message: 'Category attributes schema retrieved successfully', data: attributes };
  }

  @Post('categories/:id/attributes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('CREATE_ATTRIBUTE', 'Attribute')
  @ApiOperation({ summary: 'Add a dynamic attribute to a category' })
  @ApiResponse({ status: 201, description: 'Attribute created successfully.' })
  async createCategoryAttribute(
    @Param('id') categoryId: string,
    @Body() createAttrDto: CreateAttributeDto,
    @Request() req: any,
  ) {
    const attribute = await this.attributesService.createAttribute(categoryId, createAttrDto, req.user.id);
    return { message: 'Category attribute created successfully', data: attribute };
  }

  // --- Attributes CRUD ---

  @Put('attributes/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('UPDATE_ATTRIBUTE', 'Attribute')
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute updated successfully.' })
  async updateAttribute(
    @Param('id') id: string,
    @Body() updateAttrDto: UpdateAttributeDto,
    @Request() req: any,
  ) {
    const attribute = await this.attributesService.updateAttribute(id, updateAttrDto, req.user.id);
    return { message: 'Attribute updated successfully', data: attribute };
  }

  @Delete('attributes/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('DELETE_ATTRIBUTE', 'Attribute')
  @ApiOperation({ summary: 'Soft delete an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted successfully.' })
  async removeAttribute(@Param('id') id: string, @Request() req: any) {
    const result = await this.attributesService.deleteAttribute(id, req.user.id);
    return { message: 'Attribute deleted successfully', data: result };
  }

  // --- Category Attribute Groups ---

  @Get('categories/:id/attribute-groups')
  @Public()
  @ApiOperation({ summary: 'Get attribute layout groups for a category' })
  @ApiResponse({ status: 200, description: 'Layout groups.' })
  async getGroups(@Param('id') id: string) {
    const groups = await this.attributesService.getGroups(id);
    return { message: 'Attribute groups retrieved successfully', data: groups };
  }

  @Post('categories/:id/attribute-groups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('CREATE_ATTRIBUTE_GROUP', 'AttributeGroup')
  @ApiOperation({ summary: 'Create a new attribute group' })
  @ApiResponse({ status: 201, description: 'Group created successfully.' })
  async createGroup(
    @Param('id') categoryId: string,
    @Body() createGroupDto: CreateAttributeGroupDto,
  ) {
    const group = await this.attributesService.createGroup(categoryId, createGroupDto);
    return { message: 'Attribute group created successfully', data: group };
  }

  @Put('attribute-groups/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('UPDATE_ATTRIBUTE_GROUP', 'AttributeGroup')
  @ApiOperation({ summary: 'Update an attribute group' })
  @ApiResponse({ status: 200, description: 'Group updated.' })
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateAttributeGroupDto,
  ) {
    const group = await this.attributesService.updateGroup(id, updateGroupDto);
    return { message: 'Attribute group updated successfully', data: group };
  }

  @Delete('attribute-groups/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('DELETE_ATTRIBUTE_GROUP', 'AttributeGroup')
  @ApiOperation({ summary: 'Delete an attribute group' })
  @ApiResponse({ status: 200, description: 'Group deleted.' })
  async deleteGroup(@Param('id') id: string) {
    const result = await this.attributesService.deleteGroup(id);
    return { message: 'Attribute group deleted successfully', data: result };
  }

  // --- Attribute Options management endpoints nested under attributes controller ---

  @Post('attributes/:id/options')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('CREATE_ATTRIBUTE_OPTION', 'AttributeOption')
  @ApiOperation({ summary: 'Add a dropdown option value to an attribute' })
  @ApiResponse({ status: 201, description: 'Option value created successfully.' })
  async addOption(@Param('id') attributeId: string, @Body() createOptionDto: CreateOptionDto) {
    const option = await this.attributesService.createOption(attributeId, createOptionDto);
    return { message: 'Attribute option created successfully', data: option };
  }
}
