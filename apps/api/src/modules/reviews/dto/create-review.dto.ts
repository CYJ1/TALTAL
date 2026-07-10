import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  themeId: string;

  @IsString()
  grade: string; // 흙길 < 풀길 < 풀꽃길 < 꽃길 < 꽃밭길 < 인생테마 (오름차순)

  @IsArray()
  @IsString({ each: true })
  selectedTags: string[];

  @IsInt()
  @Min(1)
  votedHeadcount: number;

  @IsBoolean()
  cleared: boolean;

  @IsInt()
  @Min(0)
  remainingSec: number;

  @IsInt()
  @Min(0)
  hintsUsed: number;

  @IsOptional()
  @IsString()
  comment?: string;

  // 앱으로 예약 안 하고 플레이한 테마를 수동으로 기록할 때만 채워짐(YYYY-MM-DD).
  // 채워지면 PENDING_REVIEW 로그를 찾아 REVIEWED로 바꾸는 대신, 이 날짜로 새
  // UserHistoryLog(MANUAL_ENTRY)를 만든다.
  @IsOptional()
  @IsString()
  playedAt?: string;
}
