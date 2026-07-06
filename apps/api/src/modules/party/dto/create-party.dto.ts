import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  themeId: string;

  @IsString()
  hostUserId: string;

  @IsDateString()
  reservedAt: string;

  @IsInt()
  @Min(2)
  capacity: number;

  @IsInt()
  @Min(0)
  totalPriceWon: number;

  @IsString()
  bookingScreenshotBase64: string;
}
