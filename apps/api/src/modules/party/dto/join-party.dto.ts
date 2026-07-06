import { IsString } from 'class-validator';

export class JoinPartyDto {
  @IsString()
  userId: string;
}
