import { IsArray, IsBoolean, IsIn, IsOptional } from 'class-validator';
import {
  EXPERIENCE_TIERS,
  GENERATION_PREFERENCES,
  GENRE_TAGS,
  HORROR_ROLES,
  PACING_PREFERENCES,
} from './signup.dto';
import type {
  ExperienceTierValue,
  GenerationPreferenceValue,
  GenreTagValue,
  HorrorRoleValue,
  PacingPreferenceValue,
} from './signup.dto';

// 소셜 로그인으로 생성된 계정은 가입 시점에 선호도 설문을 못 받으므로,
// 로그인 직후 온보딩 화면에서 이 DTO로 한 번 채워 넣는다. 필드 구성은
// SignupDto의 선호도 부분과 동일하다.
export class UpdatePreferencesDto {
  @IsBoolean()
  isBeginner: boolean;

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

  @IsOptional()
  @IsIn(HORROR_ROLES)
  horrorRole?: HorrorRoleValue;
}
