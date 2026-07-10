import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InternalServiceGuard } from './internal-service.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Next.js BFF 전용: OAuth 코드 교환/프로필 조회를 마친 뒤 검증된 신원만 넘겨받는다.
  @Post('social')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InternalServiceGuard)
  social(@Body() dto: SocialLoginDto) {
    return this.authService.loginOrCreateSocialUser(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.userId);
  }

  // 소셜 신규 가입 직후 온보딩 화면에서 선호도를 한 번 채워 넣는 용도.
  @Patch('me/preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.authService.updatePreferences(req.user.userId, dto);
  }

  @Patch('me/nickname')
  @UseGuards(JwtAuthGuard)
  updateNickname(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.authService.updateNickname(req.user.userId, dto);
  }

  @Get('me/nickname-available')
  @UseGuards(JwtAuthGuard)
  async checkNicknameAvailable(
    @Req() req: AuthenticatedRequest,
    @Query('nickname') nickname: string,
  ) {
    const available = await this.authService.isNicknameAvailable(
      req.user.userId,
      nickname,
    );
    return { available };
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: AuthenticatedRequest) {
    await this.authService.deleteAccount(req.user.userId);
  }
}
