import { Controller, Get, MessageEvent, Param, Query, Sse } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { RedisService } from '../../common/redis/redis.service';

@Controller('search')
export class SearchController {
  private readonly updates$ = new Subject<MessageEvent>();

  constructor(
    private readonly searchService: SearchService,
    private readonly redis: RedisService,
  ) {
    // 스크래퍼가 캐시를 갱신할 때 발행하는 pub/sub 이벤트를 SSE로 브릿지
    void this.redis.subscribe('timeslots:updated', (payload) => {
      this.updates$.next({ data: payload });
    });
  }

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }

  @Get('facets')
  getFacets() {
    return this.searchService.getDistrictFacets();
  }

  @Get('themes/:themeId/slots')
  getSlots(@Param('themeId') themeId: string, @Query('dates') dates: string) {
    const dateList = dates.split(',').filter(Boolean);
    return this.searchService.getSlotsForDates(themeId, dateList);
  }

  /** 사양 #4: 가공 완료된 타임슬롯 데이터를 SSE로 클라이언트에 완벽히 동기화 */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.updates$.asObservable();
  }
}
