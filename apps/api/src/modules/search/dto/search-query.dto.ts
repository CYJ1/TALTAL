import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const GENRE_TAGS = [
  'HORROR_THRILLER',
  'EMOTIONAL_ROMANCE',
  'MYSTERY_DETECTIVE',
  'ACTION_ADVENTURE',
  'SCIFI_FANTASY',
  'COMEDY_ETC',
] as const;
const GENERATION_PREFERENCES = ['GEN1', 'GEN2', 'GEN3'] as const;

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  district?: string; // 구 (예: 강남구)

  @IsOptional()
  @IsString()
  neighborhood?: string; // 동 (예: 역삼동)

  // 테마/매장 이름 자유 검색 — 앱에서 예약 안 하고 플레이한 테마를 수동으로
  // 기록/리뷰할 때 테마를 찾는 용도로 쓰인다.
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(GENRE_TAGS)
  genre?: (typeof GENRE_TAGS)[number];

  @IsOptional()
  @IsIn(GENERATION_PREFERENCES)
  generation?: (typeof GENERATION_PREFERENCES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPriceWon?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDifficulty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  headcount?: number; // 이 인원수를 수용 가능한 테마만 (capacityMin~capacityMax 범위)

  // 사용자 현재 위치 — 제공되면 가까운 매장 순으로 정렬한다
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  timeRange?: string;

  @IsOptional()
  @IsString()
  preferenceTag?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableOnly?: boolean;
}
