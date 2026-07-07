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
}
