import { Module } from '@nestjs/common';
import { KycController } from './controllers/kyc.controller';
import { AdminKycController } from './controllers/admin-kyc.controller';
import { KycService } from './services/kyc.service';
import { KycRepository } from './repositories/kyc.repository';

@Module({
  controllers: [KycController, AdminKycController],
  providers: [KycService, KycRepository],
  exports: [KycService, KycRepository],
})
export class KycModule {}
