import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const BCRYPT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  email: string;
  nickname: string;
}

function toSafeUser(user: { id: string; email: string; nickname: string }): SafeUser {
  return { id: user.id, email: user.email, nickname: user.nickname };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string; user: SafeUser }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        stat: { create: {} },
      },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueToken(user);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return toSafeUser(user);
  }

  private issueToken(user: {
    id: string;
    email: string;
    nickname: string;
  }): { accessToken: string; user: SafeUser } {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: toSafeUser(user) };
  }
}
