import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { EscrowSchedulerService } from './escrow-scheduler.service';
import { OCR_ADAPTER } from '../../common/adapters/ocr/ocr-adapter.interface';
import { ClovaOcrMockAdapter } from '../../common/adapters/ocr/clova-ocr-mock.adapter';
import { PAYMENT_ADAPTER } from '../../common/adapters/payment/payment-adapter.interface';
import { PortoneMockAdapter } from '../../common/adapters/payment/portone-mock.adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PartyController],
  providers: [
    PartyService,
    EscrowSchedulerService,
    { provide: OCR_ADAPTER, useClass: ClovaOcrMockAdapter },
    { provide: PAYMENT_ADAPTER, useClass: PortoneMockAdapter },
  ],
})
export class PartyModule {}
