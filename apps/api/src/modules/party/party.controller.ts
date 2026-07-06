import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { JoinPartyDto } from './dto/join-party.dto';
import { ReportNoShowDto } from './dto/report-noshow.dto';

@Controller('parties')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  create(@Body() dto: CreatePartyDto) {
    return this.partyService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partyService.findOne(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Body() dto: JoinPartyDto) {
    return this.partyService.join(id, dto.userId);
  }

  @Post(':id/report-noshow')
  reportNoShow(@Param('id') id: string, @Body() dto: ReportNoShowDto) {
    return this.partyService.reportNoShow(id, dto.offenderUserId);
  }
}
