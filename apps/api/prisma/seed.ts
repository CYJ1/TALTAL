import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma';
import type { GenreTag, GenerationPreference } from '../generated/prisma';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// 데모 계정 공통 비밀번호 (시드 전용, 실서비스 데이터에는 절대 사용 금지)
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123!', 10);

// store_id / theme_id는 apps/scraper와 apps/ai-engine의 시드 데이터와 동일하게
// 고정해 서비스 간 참조가 일관되도록 한다.
//
// 아래 4개 매장은 실제 테마명·장르·난이도까지 조사해 둔 대표 매장이라 개별
// literal로 유지한다. district/neighborhood/address/latitude/longitude는
// 카카오 로컬 API(scripts/fetch-kakao-stores.ts) 조회 결과로 갱신했다.
const STORES = [
  {
    id: 'keyescape-gangnam',
    name: '키이스케이프 강남점',
    district: '서울 강남구',
    neighborhood: '역삼동',
    address: '서울 강남구 강남대로96길 17',
    latitude: 37.5001035869388,
    longitude: 127.028430769789,
    naverBookingUrl: null,
    homepageUrl: 'https://www.keyescape.co.kr/reservation.php',
  },
  {
    id: 'zerooworld-gangnam',
    name: '제로월드 강남점',
    district: '서울 서초구',
    neighborhood: '서초동',
    address: '서울 서초구 서초대로73길 40',
    latitude: 37.5009333761724,
    longitude: 127.024581465886,
    naverBookingUrl: null,
    homepageUrl: 'https://zerogangnam.com/reservation',
  },
  {
    // 카카오 로컬 API 검색 결과에서 매칭되는 매장을 찾지 못했다 — 폐업했거나
    // 카카오맵 미등록 매장일 수 있다. 위치 정보는 비워두고 이후 확인이 필요하다.
    // 웹 검색으로도 "머더파커" 체인의 실제 지점 목록(전주/홍대/건대/양산)에서
    // 강남점을 찾지 못해, 실존 여부가 불확실하다 — 예약 URL은 비워둔다.
    id: 'murderparker-gangnam',
    name: '머더파커 강남점',
    district: '서울 강남구',
    neighborhood: '역삼동',
    address: null,
    latitude: null,
    longitude: null,
    naverBookingUrl: null,
    homepageUrl: null,
  },
  {
    id: 'point9-gangnam',
    name: '포인트나인 강남점',
    district: '서울 강남구',
    neighborhood: '역삼동',
    address: '서울 강남구 강남대로102길 40',
    latitude: 37.5034283090159,
    longitude: 127.028386792542,
    naverBookingUrl: null,
    homepageUrl: 'https://www.point-nine.com/',
  },
];

// 카카오 로컬 API로 실제 조회한 서울 시내 방탈출/테마카페 매장 184곳 (scripts/
// fetch-kakao-stores.ts 실행 결과, 존재·주소·좌표까지 실데이터다). 원본 조회
// 결과 187곳 중 3곳은 검증 과정에서 같은 주소·전화번호의 중복/폐업 리스팅으로
// 확인되어 제외했다 — 테라스페이스 홍대점(마스터키 노바홍대점의 스테일 리스팅),
// 방탈출둡두(엑스이스케이프 홍대놀이터점의 스테일 리스팅), 스키피지(스피키지와
// 완전히 동일한 주소·전화번호의 중복 리스팅, 정확한 상호명은 미확정).
// 다만 매장 단위 정보이므로 테마 단위 상세(테마명/장르/난이도/가격)는 아직
// 알 수 없고, 아래 main()에서 매장별로 "(확인 필요)" 플레이스홀더 테마 1개씩을
// 생성한다 — 개별 사이트 크롤링 어댑터가 붙으면 실제 테마 데이터로 교체한다.
interface KakaoStoreSeed {
  id: string;
  name: string;
  district: string;
  neighborhood: string | null;
  address: string;
  latitude: number;
  longitude: number;
}

const KAKAO_STORES: KakaoStoreSeed[] = JSON.parse(
  readFileSync(join(__dirname, 'data/seoul-escape-rooms.json'), 'utf-8'),
);

// 지점 수가 많은 상위 체인부터 실제 테마 목록/장르/난이도/가격/평점을 웹 검색으로
// 조사해 채워 넣는 중이다 (매장 자체 홈페이지는 이 샌드박스 네트워크 정책상 직접
// 크롤링이 막혀있어, 커뮤니티 후기·블로그 검색 결과 기반으로 조사했다 — 협찬/광고
// 표기가 있는 글은 제외). storeId -> 테마 배열이 있으면 그 매장은 아래 KAKAO_STORES
// 루프에서 "(확인 필요)" 플레이스홀더 대신 이 실데이터로 테마를 생성한다.
interface VerifiedThemeSeed {
  name: string;
  genre: GenreTag;
  generation: GenerationPreference;
  difficulty: number;
  pricePerPersonWon: number;
  capacityMin: number;
  capacityMax: number;
  rating: number;
  tags: string[];
}

const VERIFIED_THEMES: Record<string, VerifiedThemeSeed[]> = JSON.parse(
  readFileSync(join(__dirname, 'data/verified-themes.json'), 'utf-8'),
);

const THEMES = [
  {
    id: 'confession',
    storeId: 'keyescape-gangnam',
    name: '고백',
    genre: 'EMOTIONAL_ROMANCE',
    generation: 'GEN3',
    difficulty: 3,
    pricePerPersonWon: 29000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: 3,
    recommendedReason: '공식 정원 중간값 + 스토리 몰입 밸런스',
    rating: 4.8,
    tags: ['장치중심', '감성레전드', '나레이션필수'],
    weight: { logic: 2, observe: 3, speed: 1, story: 8, solving: 4, tank: 1 },
  },
  {
    id: 'ring',
    storeId: 'zerooworld-gangnam',
    name: '링',
    genre: 'HORROR_THRILLER',
    generation: 'GEN2',
    difficulty: 4,
    pricePerPersonWon: 30000,
    capacityMin: 2,
    capacityMax: 6,
    recommendedHeadcount: 4,
    recommendedReason: '공포 테마 특성상 탱커 1인 포함 4인 균형 추천',
    rating: 4.7,
    tags: ['공포도최상', '탱커필수', '연출대박'],
    weight: { logic: 3, observe: 4, speed: 3, story: 2, solving: 3, tank: 9 },
  },
  {
    id: 'yesterday-today',
    storeId: 'murderparker-gangnam',
    name: '어제, 오늘, 그리고',
    genre: 'MYSTERY_DETECTIVE',
    generation: 'GEN1',
    difficulty: 4,
    pricePerPersonWon: 27000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: 2,
    recommendedReason: '문제 밀도가 높아 소인원 몰입 플레이 추천',
    rating: 4.9,
    tags: ['문제방', '뚝배기유형', '활동성낮음'],
    weight: { logic: 8, observe: 5, speed: 1, story: 3, solving: 6, tank: 1 },
  },
  {
    id: 'key-double-life',
    storeId: 'point9-gangnam',
    name: '열쇠공의 이중생활',
    genre: 'ACTION_ADVENTURE',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: 3,
    recommendedReason: '잠입 동선 분업에 3인이 최적',
    rating: 4.6,
    tags: ['잠입', '장치중심', '스토리연계성'],
    weight: { logic: 4, observe: 7, speed: 2, story: 5, solving: 5, tank: 2 },
  },
];

// 카카오 매장 하나당 생성하는 플레이스홀더 테마의 공통 기본값. genre는 아직
// 개별 확인 전이라 taxonomy의 catch-all 분류인 COMEDY_ETC로 두고, 사이트별
// 크롤링 어댑터가 붙으면 실제 값으로 교체한다.
const KAKAO_PLACEHOLDER_THEME_DEFAULTS = {
  genre: 'COMEDY_ETC' as const,
  generation: 'GEN2' as const,
  difficulty: 3,
  pricePerPersonWon: 28000,
  capacityMin: 2,
  capacityMax: 4,
  rating: 4.0,
  tags: [] as string[],
  weight: { logic: 3, observe: 3, speed: 3, story: 3, solving: 3, tank: 3 },
};

// 실제 후기 기반으로 조사한 테마는 육각형 스탯까지는 확인할 수 없어, 장르 특성에
// 따른 대략적인 가중치를 부여한다 (후기가 쌓이면 실제 스탯으로 대체될 값).
function genreBasedWeight(genre: GenreTag) {
  const base = { logic: 3, observe: 3, speed: 3, story: 3, solving: 3, tank: 3 };
  switch (genre) {
    case 'HORROR_THRILLER':
      return { ...base, tank: 8, observe: 4 };
    case 'EMOTIONAL_ROMANCE':
      return { ...base, story: 8, tank: 1 };
    case 'MYSTERY_DETECTIVE':
      return { ...base, logic: 7, solving: 6 };
    case 'ACTION_ADVENTURE':
      return { ...base, speed: 6, observe: 5 };
    case 'SCIFI_FANTASY':
      return { ...base, story: 6, observe: 5 };
    case 'COMEDY_ETC':
    default:
      return base;
  }
}

const USERS = [
  {
    id: 'escaper_pro',
    email: 'escaper_pro@taltal.demo',
    nickname: '방탈출고인물',
    mannerTemp: 98.2,
    level: 10,
    totalClears: 148,
    currentExp: 100,
    stat: { logic: 95, observe: 90, speed: 88, story: 72, solving: 76, tank: 98 },
  },
  {
    id: 'user_b',
    email: 'user_b@taltal.demo',
    nickname: '유저B',
    mannerTemp: 36.5,
    level: 8,
    totalClears: 12,
    currentExp: 20,
    stat: { logic: 70, observe: 80, speed: 60, story: 65, solving: 55, tank: 40 },
  },
];

async function main() {
  for (const store of STORES) {
    await prisma.store.upsert({ where: { id: store.id }, update: store, create: store });
  }

  for (const theme of THEMES) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: {
        storeId: theme.storeId,
        name: theme.name,
        genre: theme.genre as GenreTag,
        generation: theme.generation as GenerationPreference,
        difficulty: theme.difficulty,
        pricePerPersonWon: theme.pricePerPersonWon,
        capacityMin: theme.capacityMin,
        capacityMax: theme.capacityMax,
        recommendedHeadcount: theme.recommendedHeadcount,
        recommendedReason: theme.recommendedReason,
        rating: theme.rating,
        tags: theme.tags,
      },
      create: {
        id: theme.id,
        storeId: theme.storeId,
        name: theme.name,
        genre: theme.genre as GenreTag,
        generation: theme.generation as GenerationPreference,
        difficulty: theme.difficulty,
        pricePerPersonWon: theme.pricePerPersonWon,
        capacityMin: theme.capacityMin,
        capacityMax: theme.capacityMax,
        recommendedHeadcount: theme.recommendedHeadcount,
        recommendedReason: theme.recommendedReason,
        rating: theme.rating,
        tags: theme.tags,
      },
    });

    await prisma.themeStatWeight.upsert({
      where: { themeId: theme.id },
      update: theme.weight,
      create: { themeId: theme.id, ...theme.weight },
    });
  }

  const d = KAKAO_PLACEHOLDER_THEME_DEFAULTS;
  for (const store of KAKAO_STORES) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: store,
      create: store,
    });

    const verified = VERIFIED_THEMES[store.id];
    if (verified) {
      // 실제 테마 데이터가 조사된 매장은 예전에 생성된 "(확인 필요)" 플레이스홀더
      // 1개짜리 테마를 제거하고, 조사된 실제 테마들로 대체한다 (FK 제약 때문에
      // ThemeStatWeight를 먼저 지운다).
      await prisma.themeStatWeight.deleteMany({ where: { themeId: `${store.id}-theme` } });
      await prisma.theme.deleteMany({ where: { id: `${store.id}-theme` } });

      for (let i = 0; i < verified.length; i++) {
        const t = verified[i];
        const themeId = `${store.id}-t${i + 1}`;
        const weight = genreBasedWeight(t.genre);
        await prisma.theme.upsert({
          where: { id: themeId },
          update: {
            storeId: store.id,
            name: t.name,
            genre: t.genre,
            generation: t.generation,
            difficulty: t.difficulty,
            pricePerPersonWon: t.pricePerPersonWon,
            capacityMin: t.capacityMin,
            capacityMax: t.capacityMax,
            rating: t.rating,
            tags: t.tags,
          },
          create: {
            id: themeId,
            storeId: store.id,
            name: t.name,
            genre: t.genre,
            generation: t.generation,
            difficulty: t.difficulty,
            pricePerPersonWon: t.pricePerPersonWon,
            capacityMin: t.capacityMin,
            capacityMax: t.capacityMax,
            rating: t.rating,
            tags: t.tags,
          },
        });
        await prisma.themeStatWeight.upsert({
          where: { themeId },
          update: weight,
          create: { themeId, ...weight },
        });
      }
      continue;
    }

    const themeId = `${store.id}-theme`;
    await prisma.theme.upsert({
      where: { id: themeId },
      update: {
        storeId: store.id,
        name: `${store.name} 대표 테마 (확인 필요)`,
        genre: d.genre,
        generation: d.generation,
        difficulty: d.difficulty,
        pricePerPersonWon: d.pricePerPersonWon,
        capacityMin: d.capacityMin,
        capacityMax: d.capacityMax,
        rating: d.rating,
        tags: d.tags,
      },
      create: {
        id: themeId,
        storeId: store.id,
        name: `${store.name} 대표 테마 (확인 필요)`,
        genre: d.genre,
        generation: d.generation,
        difficulty: d.difficulty,
        pricePerPersonWon: d.pricePerPersonWon,
        capacityMin: d.capacityMin,
        capacityMax: d.capacityMax,
        rating: d.rating,
        tags: d.tags,
      },
    });

    await prisma.themeStatWeight.upsert({
      where: { themeId },
      update: d.weight,
      create: { themeId, ...d.weight },
    });
  }

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        nickname: user.nickname,
        mannerTemp: user.mannerTemp,
        level: user.level,
        totalClears: user.totalClears,
        currentExp: user.currentExp,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        nickname: user.nickname,
        mannerTemp: user.mannerTemp,
        level: user.level,
        totalClears: user.totalClears,
        currentExp: user.currentExp,
      },
    });

    await prisma.userStat.upsert({
      where: { userId: user.id },
      update: user.stat,
      create: { userId: user.id, ...user.stat },
    });
  }

  const verifiedThemeCount = Object.values(VERIFIED_THEMES).reduce((sum, arr) => sum + arr.length, 0);
  const placeholderThemeCount = KAKAO_STORES.length - Object.keys(VERIFIED_THEMES).length;
  console.log(
    `Seeded ${STORES.length + KAKAO_STORES.length} stores, ${THEMES.length + verifiedThemeCount + placeholderThemeCount} themes, ${USERS.length} users`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
