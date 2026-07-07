import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const GENRE_TAGS = ['EMOTIONAL', 'HORROR', 'SCIFI', 'IMMERSIVE'] as const;
const PACING_PREFERENCES = ['STORY', 'SPEED'] as const;
const ROOM_TYPE_PREFERENCES = ['PUZZLE', 'DEVICE'] as const;
const HORROR_ROLES = ['SCARED', 'PUSH_THROUGH', 'TANK'] as const;

export type GenreTagValue = (typeof GENRE_TAGS)[number];
export type PacingPreferenceValue = (typeof PACING_PREFERENCES)[number];
export type RoomTypePreferenceValue = (typeof ROOM_TYPE_PREFERENCES)[number];
export type HorrorRoleValue = (typeof HORROR_ROLES)[number];

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

  // 방탈출 입문자인지 여부. true면 아래 선호도 항목은 모두 무시된다.
  @IsBoolean()
  isBeginner: boolean;

  @IsOptional()
  @IsArray()
  @IsIn(GENRE_TAGS, { each: true })
  genrePreferences?: GenreTagValue[];

  @IsOptional()
  @IsIn(PACING_PREFERENCES)
  pacingPreference?: PacingPreferenceValue;

  @IsOptional()
  @IsIn(ROOM_TYPE_PREFERENCES)
  roomTypePreference?: RoomTypePreferenceValue;

  // genrePreferences에 HORROR가 포함된 경우에만 의미가 있다.
  @IsOptional()
  @IsIn(HORROR_ROLES)
  horrorRole?: HorrorRoleValue;
}
