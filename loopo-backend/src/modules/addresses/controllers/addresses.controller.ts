import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from '../services/addresses.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'List all addresses for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully.' })
  async getMyAddresses(@Request() req: any) {
    const addresses = await this.addressesService.getAddressesForUser(req.user.id);
    return { message: 'Addresses retrieved successfully', data: addresses };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  async createAddress(@Body() dto: CreateAddressDto, @Request() req: any) {
    const address = await this.addressesService.create(req.user.id, dto);
    return { message: 'Address created successfully', data: address };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Update an existing address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async updateAddress(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Request() req: any,
  ) {
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('ADMIN');
    const address = await this.addressesService.update(id, req.user.id, dto, isAdmin);
    return { message: 'Address updated successfully', data: address };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Delete an address (soft delete)' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async deleteAddress(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('ADMIN');
    await this.addressesService.delete(id, req.user.id, isAdmin);
    return { message: 'Address deleted successfully', data: {} };
  }

  @Patch(':id/default')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Set an address as the default' })
  @ApiResponse({ status: 200, description: 'Address set as default successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async setDefault(@Param('id') id: string, @Request() req: any) {
    const address = await this.addressesService.setDefaultAddress(id, req.user.id);
    return { message: 'Default address set successfully', data: address };
  }
}
