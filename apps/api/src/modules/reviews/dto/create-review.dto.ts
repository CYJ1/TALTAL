import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  themeId: string;

  @IsString()
  userId: string;

  @IsString()
  grade: string; // 풀길 | 흙길 | 인생테마 | 꽃길

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
}
