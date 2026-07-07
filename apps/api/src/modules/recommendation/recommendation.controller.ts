import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get(':userId')
  get(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('본인의 추천 결과만 조회할 수 있습니다.');
    }
    return this.recommendationService.getRecommendations(userId);
  }
}
