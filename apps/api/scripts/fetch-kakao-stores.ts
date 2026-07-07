/**
 * 서울 전역 "방탈출" 매장을 카카오 로컬 API(키워드로 장소 검색)로 조회해
 * scripts/output/kakao-seoul-escape-rooms.json에 저장한다.
 *
 * 실행 전: apps/api/.env에 KAKAO_REST_API_KEY=<카카오 디벨로퍼스 REST API 키> 추가
 * 실행: npx ts-node scripts/fetch-kakao-stores.ts
 *
 * 주의: 이 샌드박스(agent-proxy)는 dapi.kakao.com 아웃바운드가 조직 네트워크
 * 정책으로 차단되어 있어, 반드시 네트워크 제한이 없는 환경(로컬 PC 등)에서
 * 실행해야 한다. 실행 후 생성되는 kakao-seoul-escape-rooms.json 파일을
 * 세션에 다시 전달하면, 그 결과로 prisma/seed.ts를 실제 데이터로 갱신한다.
 *
 * 쿼리 상한: 서울 25개 구 x 최대 3페이지 = 최대 75회 호출로 설계했다
 * (무료 쿼터를 아끼기 위해 구별 중심좌표 1곳 + 반경 검색만 사용하고,
 * 페이지네이션도 결과가 남아있을 때만 다음 페이지를 요청한다).
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_REST_API_KEY) {
  console.error('KAKAO_REST_API_KEY 환경변수가 없습니다. apps/api/.env에 추가하세요.');
  process.exit(1);
}

// 서울 25개 구청 대략 좌표(중심점). 검색 반경으로 구 전체를 느슨하게 커버하고,
// 실제 소속 구/동은 API가 반환하는 도로명/지번 주소를 파싱해 결정한다
// (구 경계 근처 매장이 이웃 구 중심좌표 검색에도 걸릴 수 있어 중복 제거로 처리).
const SEOUL_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: '강남구', lat: 37.5172, lng: 127.0473 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  { name: '강북구', lat: 37.6396, lng: 127.0257 },
  { name: '강서구', lat: 37.5509, lng: 126.8495 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '광진구', lat: 37.5384, lng: 127.0822 },
  { name: '구로구', lat: 37.4954, lng: 126.8874 },
  { name: '금천구', lat: 37.4519, lng: 126.9020 },
  { name: '노원구', lat: 37.6542, lng: 127.0568 },
  { name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { name: '동대문구', lat: 37.5744, lng: 127.0396 },
  { name: '동작구', lat: 37.5124, lng: 126.9393 },
  { name: '마포구', lat: 37.5663, lng: 126.9019 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '성동구', lat: 37.5633, lng: 127.0371 },
  { name: '성북구', lat: 37.5894, lng: 127.0167 },
  { name: '송파구', lat: 37.5145, lng: 127.1059 },
  { name: '양천구', lat: 37.5170, lng: 126.8664 },
  { name: '영등포구', lat: 37.5264, lng: 126.8962 },
  { name: '용산구', lat: 37.5326, lng: 126.9906 },
  { name: '은평구', lat: 37.6027, lng: 126.9291 },
  { name: '종로구', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '중랑구', lat: 37.6063, lng: 127.0925 },
];

const SEARCH_RADIUS_M = 4000;
const REQUEST_DELAY_MS = 300;

interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
}

interface KakaoKeywordSearchResponse {
  documents: KakaoPlaceDocument[];
  meta: { is_end: boolean; pageable_count: number; total_count: number };
}

interface CollectedStore {
  kakaoId: string;
  name: string;
  district: string;
  neighborhood: string | null;
  addressName: string;
  roadAddressName: string;
  latitude: number;
  longitude: number;
  phone: string;
  placeUrl: string;
  categoryName: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchPage(
  lat: number,
  lng: number,
  page: number,
): Promise<KakaoKeywordSearchResponse> {
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', '방탈출');
  url.searchParams.set('y', String(lat));
  url.searchParams.set('x', String(lng));
  url.searchParams.set('radius', String(SEARCH_RADIUS_M));
  url.searchParams.set('sort', 'distance');
  url.searchParams.set('size', '15');
  url.searchParams.set('page', String(page));

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`카카오 API 오류 ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<KakaoKeywordSearchResponse>;
}

function parseDistrictNeighborhood(addressName: string): { district: string; neighborhood: string | null } {
  // "서울 강남구 역삼동 736-1" 형태 파싱
  const parts = addressName.split(' ');
  const district = parts.find((p) => p.endsWith('구')) ?? '';
  const neighborhood = parts.find((p) => p.endsWith('동') || p.endsWith('가')) ?? null;
  return { district, neighborhood };
}

async function main() {
  const collected = new Map<string, CollectedStore>();
  let totalCalls = 0;

  for (const district of SEOUL_DISTRICTS) {
    let page = 1;
    let isEnd = false;

    while (!isEnd && page <= 3) {
      totalCalls += 1;
      let data: KakaoKeywordSearchResponse;
      try {
        data = await searchPage(district.lat, district.lng, page);
      } catch (err) {
        console.error(`[${district.name}] page ${page} 실패:`, (err as Error).message);
        break;
      }

      for (const doc of data.documents) {
        if (!doc.address_name.startsWith('서울')) continue; // 반경이 인접 시/구로 걸치는 경우 제외
        if (collected.has(doc.id)) continue;

        const { district: parsedDistrict, neighborhood } = parseDistrictNeighborhood(
          doc.road_address_name || doc.address_name,
        );
        collected.set(doc.id, {
          kakaoId: doc.id,
          name: doc.place_name,
          district: parsedDistrict || `서울 ${district.name}`,
          neighborhood,
          addressName: doc.address_name,
          roadAddressName: doc.road_address_name,
          latitude: Number(doc.y),
          longitude: Number(doc.x),
          phone: doc.phone,
          placeUrl: doc.place_url,
          categoryName: doc.category_name,
        });
      }

      isEnd = data.meta.is_end;
      if (!isEnd) await sleep(REQUEST_DELAY_MS);
      page += 1;
    }

    console.log(`[${district.name}] 누적 수집 ${collected.size}건 (API 호출 ${totalCalls}회)`);
    await sleep(REQUEST_DELAY_MS);
  }

  const outDir = join(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'kakao-seoul-escape-rooms.json');
  const results = Array.from(collected.values()).sort((a, b) => a.district.localeCompare(b.district));
  writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n총 API 호출 ${totalCalls}회, 매장 ${results.length}건 수집 완료 -> ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
