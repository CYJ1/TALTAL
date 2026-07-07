import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '탈탈 — 방탈출 통합 플랫폼',
    short_name: '탈탈',
    description: '자물쇠도 고민도 탈탈. 실시간 예약 검색 · 게이미피케이션 스탯 · 안전 에스크로 동행 매칭 · AI 추천',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    lang: 'ko',
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
