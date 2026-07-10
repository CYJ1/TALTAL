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

// 한국 방탈출 어워즈 시상 부문 기준 6개 장르 분류.
export const GENRE_TAGS = [
  'HORROR_THRILLER',
  'EMOTIONAL_ROMANCE',
  'MYSTERY_DETECTIVE',
  'ACTION_ADVENTURE',
  'SCIFI_FANTASY',
  'COMEDY_ETC',
] as const;
export const PACING_PREFERENCES = ['STORY', 'SPEED'] as const;
// 방탈출 세대 구분: 1세대(자물쇠·퀴즈) / 2세대(장치·센서) / 3세대(이머시브·앱연동)
export const GENERATION_PREFERENCES = ['GEN1', 'GEN2', 'GEN3'] as const;
export const HORROR_ROLES = ['SCARED', 'PUSH_THROUGH', 'TANK'] as const;
// 방린이가 아닐 때 누적 클리어 방수 구간. "경험 있음" 하나로는 1방 해본 사람과
// 100방 넘게 해본 헤비 유저를 구분할 수 없어 별도로 받는다.
export const EXPERIENCE_TIERS = ['TIER_10', 'TIER_50', 'TIER_100', 'TIER_100_PLUS'] as const;

export type GenreTagValue = (typeof GENRE_TAGS)[number];
export type PacingPreferenceValue = (typeof PACING_PREFERENCES)[number];
export type GenerationPreferenceValue = (typeof GENERATION_PREFERENCES)[number];
export type HorrorRoleValue = (typeof HORROR_ROLES)[number];
export type ExperienceTierValue = (typeof EXPERIENCE_TIERS)[number];

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

  // isBeginner가 false일 때만 의미가 있다.
  @IsOptional()
  @IsIn(EXPERIENCE_TIERS)
  experienceTier?: ExperienceTierValue;

  @IsOptional()
  @IsArray()
  @IsIn(GENRE_TAGS, { each: true })
  genrePreferences?: GenreTagValue[];

  @IsOptional()
  @IsIn(PACING_PREFERENCES)
  pacingPreference?: PacingPreferenceValue;

  @IsOptional()
  @IsIn(GENERATION_PREFERENCES)
  generationPreference?: GenerationPreferenceValue;

  // genrePreferences에 HORROR_THRILLER가 포함된 경우에만 의미가 있다.
  @IsOptional()
  @IsIn(HORROR_ROLES)
  horrorRole?: HorrorRoleValue;
}
