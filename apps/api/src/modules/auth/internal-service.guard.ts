import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * /auth/social은 OAuth 인가 코드를 provider와 직접 교환해 신원을 검증하는 일을
 * Next.js BFF(웹 서버)에게 위임한 뒤, 그 검증 결과만 전달받아 신뢰하는 구조다.
 * 이 가드는 그 호출이 실제로 우리 웹 서버에서 왔는지(공인 인터넷에 노출된 이
 * 엔드포인트를 통해 신원을 위조하는 것을 방지) 공유 비밀값으로 확인한다.
 */
@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const secret = this.config.getOrThrow<string>('INTERNAL_API_SECRET');
    const provided = req.headers['x-internal-secret'];

    if (provided !== secret) {
      throw new UnauthorizedException('내부 서비스 호출만 허용됩니다.');
    }
    return true;
  }
}
