import { IsString } from 'class-validator';

export class ReportNoShowDto {
  @IsString()
  offenderUserId: string;
}
