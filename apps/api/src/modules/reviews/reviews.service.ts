import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatsService } from '../stats/stats.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  /**
   * [도메인 3] 사양 #1~#2: 리뷰 상태 직렬화 -> PostgreSQL VARCHAR[] 컬럼 결합 저장.
   * 저장 직후 [도메인 2] 사양 #4의 UserStatCalculator를 트리거하여 실시간 육각
   * 스탯 성장과 AI 데이터 피딩(Neo4j 그래프 증분 반영 대상)을 동시에 처리한다.
   */
  async create(dto: CreateReviewDto) {
    const review = await this.prisma.themeReview.create({
      data: {
        themeId: dto.themeId,
        userId: dto.userId,
        grade: dto.grade,
        selectedTags: dto.selectedTags,
        votedHeadcount: dto.votedHeadcount,
        cleared: dto.cleared,
        remainingSec: dto.remainingSec,
        hintsUsed: dto.hintsUsed,
        comment: dto.comment,
      },
    });

    await this.prisma.userHistoryLog.updateMany({
      where: { userId: dto.userId, themeId: dto.themeId, status: 'PENDING_REVIEW' },
      data: { status: 'REVIEWED' },
    });

    const updatedStat = await this.statsService.applyReviewStatGain({
      userId: dto.userId,
      themeId: dto.themeId,
      cleared: dto.cleared,
      remainingSec: dto.remainingSec,
    });

    return { review, updatedStat };
  }
}
