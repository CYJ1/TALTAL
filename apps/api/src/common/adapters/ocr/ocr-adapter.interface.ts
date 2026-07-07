export const OCR_ADAPTER = Symbol('OCR_ADAPTER');

export interface BookingVerificationInput {
  imageBase64: string;
  expectedStoreName: string;
  expectedThemeName: string;
  expectedReservedAt: Date;
}

export interface BookingVerificationResult {
  verified: boolean;
  extractedStoreName?: string;
  extractedThemeName?: string;
  extractedDateTime?: string;
}

/**
 * Naver CLOVA OCR 연동 계약. 예약 완료 캡처본에서 지점/테마/일시 문자열을 파싱해
 * DB의 공식 가용 테마 엔티티와 대조 검증한다 (허위·리셀 룸 유입 차단).
 */
export interface OcrAdapter {
  verifyBooking(
    input: BookingVerificationInput,
  ): Promise<BookingVerificationResult>;
}
