import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { ReportNoShowDto } from './dto/report-noshow.dto';

@Controller('parties')
@UseGuards(JwtAuthGuard)
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  create(@Body() dto: CreatePartyDto, @Req() req: AuthenticatedRequest) {
    return this.partyService.create(dto, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partyService.findOne(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.partyService.join(id, req.user.userId);
  }

  @Post(':id/report-noshow')
  reportNoShow(@Param('id') id: string, @Body() dto: ReportNoShowDto) {
    return this.partyService.reportNoShow(id, dto.offenderUserId);
  }
}
