import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { StatsModule } from '../stats/stats.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StatsModule, AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
