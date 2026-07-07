import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { GenreTag } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { SocialLoginDto } from './dto/social-login.dto';

const BCRYPT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  email: string;
  nickname: string;
}

function toSafeUser(user: {
  id: string;
  email: string;
  nickname: string;
}): SafeUser {
  return { id: user.id, email: user.email, nickname: user.nickname };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(
    dto: SignupDto,
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        isBeginner: dto.isBeginner,
        // 방린이는 선호도 설문 자체를 건너뛰므로 값이 없다.
        genrePreferences: dto.isBeginner
          ? []
          : ((dto.genrePreferences ?? []) as GenreTag[]),
        pacingPreference: dto.isBeginner ? null : dto.pacingPreference,
        roomTypePreference: dto.isBeginner ? null : dto.roomTypePreference,
        horrorRole:
          !dto.isBeginner && dto.genrePreferences?.includes('HORROR')
            ? dto.horrorRole
            : null,
        stat: { create: {} },
      },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        `이 계정은 ${user.provider} 소셜 로그인 전용 계정입니다. 소셜 로그인으로 이용해주세요.`,
      );
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.issueToken(user);
  }

  /**
   * 소셜 로그인/가입: (provider, providerId)로 기존 연동 계정을 찾고, 없으면
   * 이메일이 일치하는 기존 계정에 연동하거나(최초 소셜 연동), 새 계정을 만든다.
   * 이 메서드는 provider가 이미 해당 이메일의 소유권을 검증했다는 전제 하에 호출되어야 한다
   * (호출부인 InternalServiceGuard 보호 하의 컨트롤러 참고).
   */
  async loginOrCreateSocialUser(
    dto: SocialLoginDto,
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const provider = dto.provider;

    const existingByProvider = await this.prisma.user.findUnique({
      where: { provider_providerId: { provider, providerId: dto.providerId } },
    });
    if (existingByProvider) {
      return this.issueToken(existingByProvider);
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingByEmail) {
      const linked = await this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: { provider, providerId: dto.providerId },
      });
      return this.issueToken(linked);
    }

    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        provider,
        providerId: dto.providerId,
        stat: { create: {} },
      },
    });
    return this.issueToken(created);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return toSafeUser(user);
  }

  private issueToken(user: { id: string; email: string; nickname: string }): {
    accessToken: string;
    user: SafeUser;
  } {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: toSafeUser(user) };
  }
}
