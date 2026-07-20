import { Controller, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttributesService } from '../services/attributes.service';
import { UpdateOptionDto } from '../dto/option.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

@ApiTags('Options')
@Controller('options')
export class OptionsController {
  constructor(private readonly attributesService: AttributesService) {}

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('UPDATE_ATTRIBUTE_OPTION', 'AttributeOption')
  @ApiOperation({ summary: 'Update a dropdown option' })
  @ApiResponse({ status: 200, description: 'Option updated successfully.' })
  @ApiResponse({ status: 404, description: 'Option not found.' })
  async update(@Param('id') id: string, @Body() updateOptionDto: UpdateOptionDto) {
    const option = await this.attributesService.updateOption(id, updateOptionDto);
    return { message: 'Option updated successfully', data: option };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.manage')
  @LogAudit('DELETE_ATTRIBUTE_OPTION', 'AttributeOption')
  @ApiOperation({ summary: 'Delete a dropdown option' })
  @ApiResponse({ status: 200, description: 'Option deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Option not found.' })
  async remove(@Param('id') id: string) {
    const result = await this.attributesService.deleteOption(id);
    return { message: 'Option deleted successfully', data: result };
  }
}
