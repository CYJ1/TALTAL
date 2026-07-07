// API_BASE_URL이 설정되어 있으면 실제 NestJS 백엔드(apps/api)를 호출하고,
// 없으면 이 폴더의 lib/mock-data.ts 인메모리 픽스처로 동작한다.
// (질문 응답: "없음 — 전부 목업으로" 선택에 따른 기본값은 목업 모드)
export const API_BASE_URL = process.env.API_BASE_URL ?? null;
export const IS_REMOTE_MODE = API_BASE_URL !== null;

export const DEMO_USER_ID = 'escaper_pro';

// 소셜 로그인 redirect_uri를 만들 때 사용한다. 요청의 Host 헤더는 위조될 수 있어
// 신뢰하지 않고, 반드시 이 값을 명시적으로 설정한다 (실배포 시 실제 도메인으로 교체).
export const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:3000';
