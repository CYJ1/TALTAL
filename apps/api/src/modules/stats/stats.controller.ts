import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('users/:userId')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('profile')
  getProfile(@Param('userId') userId: string) {
    return this.statsService.getProfile(userId);
  }

  @Get('calendar')
  getCalendar(@Param('userId') userId: string, @Query('month') month: string) {
    return this.statsService.getCalendar(userId, month);
  }
}
