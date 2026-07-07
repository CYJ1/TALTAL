import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OCR_ADAPTER } from '../../common/adapters/ocr/ocr-adapter.interface';
import type { OcrAdapter } from '../../common/adapters/ocr/ocr-adapter.interface';
import { PAYMENT_ADAPTER } from '../../common/adapters/payment/payment-adapter.interface';
import type { PaymentAdapter } from '../../common/adapters/payment/payment-adapter.interface';
import { CreatePartyDto } from './dto/create-party.dto';

@Injectable()
export class PartyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OCR_ADAPTER) private readonly ocr: OcrAdapter,
    @Inject(PAYMENT_ADAPTER) private readonly payment: PaymentAdapter,
  ) {}

  /** [도메인 4] 사양 #1: Naver CLOVA OCR 연동 허위 매칭 원천 차단 */
  async create(dto: CreatePartyDto, hostUserId: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: dto.themeId },
      include: { store: true },
    });
    if (!theme) throw new NotFoundException(`theme ${dto.themeId} not found`);

    const ocrResult = await this.ocr.verifyBooking({
      imageBase64: dto.bookingScreenshotBase64,
      expectedStoreName: theme.store.name,
      expectedThemeName: theme.name,
      expectedReservedAt: new Date(dto.reservedAt),
    });

    if (!ocrResult.verified) {
      throw new BadRequestException('예약 캡처본 OCR 검증에 실패했습니다 (허위/리셀 룸 의심)');
    }

    return this.prisma.party.create({
      data: {
        themeId: dto.themeId,
        hostUserId,
        reservedAt: new Date(dto.reservedAt),
        capacity: dto.capacity,
        totalPriceWon: dto.totalPriceWon,
        verifiedBookingOk: true,
      },
    });
  }

  async findOne(partyId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: {
        theme: { include: { store: true } },
        participants: { include: { user: { include: { stat: true } } } },
      },
    });
    if (!party) throw new NotFoundException(`party ${partyId} not found`);
    return party;
  }

  /** [도메인 4] 사양 #2: 포트원 에스크로 대금 보호(Holding) 트랜잭션 */
  async join(partyId: string, userId: string) {
    const party = await this.findOne(partyId);

    if (party.participants.length >= party.capacity) {
      throw new ConflictException('파티 정원이 이미 가득 찼습니다');
    }
    if (party.participants.some((p) => p.userId === userId)) {
      throw new ConflictException('이미 참여 중인 유저입니다 (중복 탑승 방지)');
    }

    const depositWon = Math.round(party.totalPriceWon / party.capacity);
    const hold = await this.payment.holdDeposit({ partyId, userId, amountWon: depositWon });

    const participant = await this.prisma.partyParticipant.create({
      data: {
        partyId,
        userId,
        depositWon,
        escrowStatus: 'HOLDING',
        escrowTxRef: hold.txRef,
      },
    });

    const isNowFull = party.participants.length + 1 >= party.capacity;
    if (isNowFull) {
      await this.prisma.party.update({ where: { id: partyId }, data: { status: 'FILLED' } });
    }

    return participant;
  }

  /** [도메인 4] 사양 #3: 무단 위반자 페널티 집행 (예치금 방장 귀속 + 매너온도 0점 영구 밴) */
  async reportNoShow(partyId: string, offenderUserId: string) {
    const party = await this.findOne(partyId);
    const offender = party.participants.find((p) => p.userId === offenderUserId);
    if (!offender) throw new NotFoundException('해당 참여자를 찾을 수 없습니다');

    await this.payment.forfeit(offender.escrowTxRef!);

    await this.prisma.partyParticipant.update({
      where: { id: offender.id },
      data: { escrowStatus: 'FORFEITED' },
    });
    await this.prisma.party.update({ where: { id: partyId }, data: { status: 'DISPUTED' } });
    await this.prisma.user.update({
      where: { id: offenderUserId },
      data: { mannerTemp: 0 },
    });

    return { partyId, offenderUserId, penalty: 'DEPOSIT_FORFEITED_MANNER_TEMP_ZEROED' };
  }
}
