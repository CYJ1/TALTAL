import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { applyStatGains } from './user-stat-calculator';

const EXP_PER_CLEAR = 12;
const EXP_PER_LEVEL = 100;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stat: true },
    });
    if (!user) throw new NotFoundException(`user ${userId} not found`);

    const stat =
      user.stat ?? (await this.prisma.userStat.create({ data: { userId } }));

    return {
      userId: user.id,
      nickname: user.nickname,
      level: user.level,
      mannerTemp: user.mannerTemp,
      totalClears: user.totalClears,
      expPercent: Math.min(
        100,
        Math.round((user.currentExp / EXP_PER_LEVEL) * 100),
      ),
      isBeginner: user.isBeginner,
      genrePreferences: user.genrePreferences,
      pacingPreference: user.pacingPreference,
      roomTypePreference: user.roomTypePreference,
      horrorRole: user.horrorRole,
      stat: {
        logic: stat.logic,
        observe: stat.observe,
        speed: stat.speed,
        story: stat.story,
        solving: stat.solving,
        tank: stat.tank,
      },
    };
  }

  async getCalendar(userId: string, month: string) {
    const [year, mon] = month.split('-').map(Number);
    const from = new Date(Date.UTC(year, mon - 1, 1));
    const to = new Date(Date.UTC(year, mon, 1));

    const logs = await this.prisma.userHistoryLog.findMany({
      where: { userId, playedAt: { gte: from, lt: to } },
      include: { theme: true },
      orderBy: { playedAt: 'asc' },
    });

    return logs.map((log) => ({
      id: log.id,
      date: log.playedAt.toISOString().slice(0, 10),
      themeId: log.themeId,
      themeName: log.theme.name,
      status: log.status,
    }));
  }

  /** [도메인 2] 리뷰 저장 완료 즉시 구동되는 UserStatCalculator 엔진 */
  async applyReviewStatGain(params: {
    userId: string;
    themeId: string;
    cleared: boolean;
    remainingSec: number;
  }) {
    const weight = await this.prisma.themeStatWeight.findUnique({
      where: { themeId: params.themeId },
    });
    if (!weight) return null;

    const current = await this.prisma.userStat.upsert({
      where: { userId: params.userId },
      update: {},
      create: { userId: params.userId },
    });

    const updated = applyStatGains(
      current,
      weight,
      params.cleared,
      params.remainingSec,
    );

    const savedStat = await this.prisma.userStat.update({
      where: { userId: params.userId },
      data: updated,
    });

    const user = await this.prisma.user.update({
      where: { id: params.userId },
      data: {
        totalClears: { increment: params.cleared ? 1 : 0 },
        currentExp: { increment: EXP_PER_CLEAR },
      },
    });

    if (user.currentExp >= EXP_PER_LEVEL) {
      await this.prisma.user.update({
        where: { id: params.userId },
        data: {
          level: { increment: 1 },
          currentExp: { decrement: EXP_PER_LEVEL },
        },
      });
    }

    return savedStat;
  }
}
