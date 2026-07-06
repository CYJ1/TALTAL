// API_BASE_URL이 설정되어 있으면 실제 NestJS 백엔드(apps/api)를 호출하고,
// 없으면 이 폴더의 lib/mock-data.ts 인메모리 픽스처로 동작한다.
// (질문 응답: "없음 — 전부 목업으로" 선택에 따른 기본값은 목업 모드)
export const API_BASE_URL = process.env.API_BASE_URL ?? null;
export const IS_REMOTE_MODE = API_BASE_URL !== null;

export const DEMO_USER_ID = 'escaper_pro';
