import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt는 72바이트를 초과하는 부분을 무시한다
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nickname: string;
}
