import { Controller, ForbiddenException, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('users/:userId')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('profile')
  getProfile(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
    this.assertSelf(userId, req);
    return this.statsService.getProfile(userId);
  }

  @Get('calendar')
  getCalendar(
    @Param('userId') userId: string,
    @Query('month') month: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.assertSelf(userId, req);
    return this.statsService.getCalendar(userId, month);
  }

  private assertSelf(userId: string, req: AuthenticatedRequest) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('본인의 데이터만 조회할 수 있습니다.');
    }
  }
}
