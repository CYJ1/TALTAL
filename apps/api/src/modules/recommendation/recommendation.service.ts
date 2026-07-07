import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /** [도메인 5] Python FastAPI AI 엔진(Neo4j 그래프 추천)을 프록시하는 NestJS 서비스 레이어 */
  async getRecommendations(userId: string) {
    const baseUrl = this.config.get<string>(
      'AI_ENGINE_URL',
      'http://localhost:8000',
    );
    const { data } = await firstValueFrom(
      this.http.get(`${baseUrl}/recommendations/${userId}`),
    );
    return data;
  }
}
