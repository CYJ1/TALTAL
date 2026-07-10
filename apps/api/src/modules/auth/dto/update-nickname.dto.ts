import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nickname: string;
}
