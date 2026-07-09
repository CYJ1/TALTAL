import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /**
   * [도메인 5] Python FastAPI AI 엔진(Neo4j 그래프 추천)을 프록시하는 NestJS 서비스 레이어.
   * ai-engine은 별도 프로세스(+Neo4j)라 로컬 개발 환경에 따라 안 떠있을 수 있다 —
   * 그 경우 500으로 죽이는 대신 "지금은 추천을 못 받아온다"는 걸 명시한 빈 결과로
   * 응답해, 화면에서 안내 문구를 보여줄 수 있게 한다.
   */
  async getRecommendations(userId: string) {
    const baseUrl = this.config.get<string>(
      'AI_ENGINE_URL',
      'http://localhost:8000',
    );
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/recommendations/${userId}`),
      );
      return { ...data, aiEngineAvailable: true };
    } catch (err) {
      this.logger.warn(`AI engine unreachable: ${(err as Error).message}`);
      return {
        user_id: userId,
        peer_sample_size: 0,
        items: [],
        aiEngineAvailable: false,
      };
    }
  }
}
