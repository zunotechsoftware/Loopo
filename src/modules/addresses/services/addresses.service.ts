import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressesRepository } from '../repositories/addresses.repository';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(userId: string, dto: CreateAddressDto) {
    const existing = await this.addressesRepository.findByUserId(userId);
    
    // Auto-set as default if this is the first address
    let isDefault = dto.isDefault ?? false;
    if (existing.length === 0) {
      isDefault = true;
    }

    if (isDefault) {
      await this.addressesRepository.unsetDefaults(userId);
    }

    return this.addressesRepository.create(userId, {
      type: dto.type,
      fullName: dto.fullName,
      phone: dto.phone,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isDefault,
    });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto, isAdmin = false) {
    const address = await this.addressesRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Ownership validation
    if (address.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not own this address');
    }

    if (dto.isDefault === true) {
      await this.addressesRepository.unsetDefaults(address.userId);
    }

    return this.addressesRepository.update(id, dto, userId);
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const address = await this.addressesRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Ownership validation
    if (address.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not own this address');
    }

    await this.addressesRepository.softDelete(id, userId);

    // If we deleted the default address, promote another one to default if exists
    if (address.isDefault) {
      const remaining = await this.addressesRepository.findByUserId(address.userId);
      if (remaining.length > 0) {
        await this.addressesRepository.update(remaining[0].id, { isDefault: true }, userId);
      }
    }

    return { success: true };
  }

  async getAddressesForUser(userId: string) {
    return this.addressesRepository.findByUserId(userId);
  }

  async setDefaultAddress(id: string, userId: string) {
    const address = await this.addressesRepository.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }

    await this.addressesRepository.unsetDefaults(userId);
    return this.addressesRepository.update(id, { isDefault: true }, userId);
  }
}
