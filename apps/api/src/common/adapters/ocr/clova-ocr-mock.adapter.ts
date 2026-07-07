import { Injectable, Logger } from '@nestjs/common';
import {
  BookingVerificationInput,
  BookingVerificationResult,
  OcrAdapter,
} from './ocr-adapter.interface';

/**
 * Naver CLOVA OCR API 키가 없는 개발 단계용 목업 구현체.
 * 실제 이미지 바운딩 박스 파싱 대신, 업로드된 캡처본이 기대값과 "일치한다"고
 * 가정하고 통과시킨다 (데모 목적). 실연동 시 CLOVA OCR REST API 호출로 교체.
 */
@Injectable()
export class ClovaOcrMockAdapter implements OcrAdapter {
  private readonly logger = new Logger('ClovaOcrMockAdapter(MOCK)');

  async verifyBooking(
    input: BookingVerificationInput,
  ): Promise<BookingVerificationResult> {
    this.logger.log(
      `[MOCK] OCR parsing capture for "${input.expectedStoreName} - ${input.expectedThemeName}"`,
    );
    // 목업: 이미지 바이트가 비어있지 않으면 통과, 실제 문자열 매칭은 수행하지 않음
    const verified = input.imageBase64.length > 0;
    return {
      verified,
      extractedStoreName: input.expectedStoreName,
      extractedThemeName: input.expectedThemeName,
      extractedDateTime: input.expectedReservedAt.toISOString(),
    };
  }
}
