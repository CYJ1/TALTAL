import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['KAKAO', 'NAVER', 'GOOGLE'])
  provider: 'KAKAO' | 'NAVER' | 'GOOGLE';

  @IsString()
  providerId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nickname: string;
}
