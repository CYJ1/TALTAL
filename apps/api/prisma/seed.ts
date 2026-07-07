import 'dotenv/config';
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
// 아래 매장 목록은 실제 서울 방탈출 시장 조사(웹 검색) 기반으로 구성한 실존
// 브랜드명이다. 다만 개별 사이트 접근이 막혀있어(bot 차단) 정확한 도로명 주소·
// 위경도까지는 확인하지 못했다 — district/neighborhood는 조사 결과 기준
// 근사치이고, address/latitude/longitude는 null로 비워뒀다. 실서비스 전환 시
// 카카오/네이버 지도 지오코딩 API로 채워야 한다.
// 신규 매장의 테마 1개씩은 브랜드 실제 성격(예: 제로월드=공포 특화)은 반영했지만
// 구체적 테마명·장르·난이도는 개별 사이트 크롤링 전까지는 플레이스홀더다.
const STORES = [
  { id: 'keyescape-gangnam', name: '키이스케이프 강남점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'zerooworld-gangnam', name: '제로월드 강남점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'murderparker-gangnam', name: '머더파커 강남점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'point9-gangnam', name: '포인트나인 강남점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'sherlockholmes-gangnam2', name: '셜록홈즈 강남2호점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'doorescape-gangnam', name: '도어이스케이프 강남점', district: '서울 강남구', neighborhood: '삼성동' },
  { id: 'themaze-gangnam', name: '더메이즈 강남점', district: '서울 강남구', neighborhood: '논현동' },
  { id: 'xscape-gangnam', name: '엑스케이프 강남점', district: '서울 강남구', neighborhood: '역삼동' },
  { id: 'bitphobia-hongdae', name: '비트포비아 홍대점', district: '서울 마포구', neighborhood: '서교동' },
  { id: 'doorescape-hongdae', name: '도어이스케이프 홍대점', district: '서울 마포구', neighborhood: '서교동' },
  { id: 'decoder-hongdae', name: '디코더 홍대점', district: '서울 마포구', neighborhood: '서교동' },
  { id: 'themaze-konkuk', name: '더메이즈 건대점', district: '서울 광진구', neighborhood: '화양동' },
  { id: 'xscape-konkuk', name: '엑스케이프 건대점', district: '서울 광진구', neighborhood: '화양동' },
  { id: 'bitphobia-sinchon', name: '비트포비아 신촌점', district: '서울 서대문구', neighborhood: '신촌동' },
  { id: 'masterkey-sinchon', name: '마스터키 신촌점', district: '서울 서대문구', neighborhood: '신촌동' },
  { id: 'decoder-seongsu', name: '디코더 성수점', district: '서울 성동구', neighborhood: '성수동' },
];

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
  {
    id: 'sherlock-signature',
    storeId: 'sherlockholmes-gangnam2',
    name: '셜록홈즈 대표 테마 (확인 필요)',
    genre: 'MYSTERY_DETECTIVE',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.3,
    tags: ['추리', '문제방'],
    weight: { logic: 6, observe: 5, speed: 2, story: 4, solving: 6, tank: 1 },
  },
  {
    id: 'doorescape-gangnam-signature',
    storeId: 'doorescape-gangnam',
    name: '도어이스케이프 강남 대표 테마 (확인 필요)',
    genre: 'ACTION_ADVENTURE',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.2,
    tags: ['액션'],
    weight: { logic: 4, observe: 5, speed: 5, story: 3, solving: 4, tank: 3 },
  },
  {
    id: 'themaze-gangnam-signature',
    storeId: 'themaze-gangnam',
    name: '더메이즈 강남 대표 테마 (확인 필요)',
    genre: 'SCIFI_FANTASY',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.2,
    tags: ['SF'],
    weight: { logic: 5, observe: 5, speed: 3, story: 5, solving: 5, tank: 2 },
  },
  {
    id: 'xscape-gangnam-signature',
    storeId: 'xscape-gangnam',
    name: '엑스케이프 강남 대표 테마 (확인 필요)',
    genre: 'ACTION_ADVENTURE',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 27000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.1,
    tags: ['액션'],
    weight: { logic: 4, observe: 4, speed: 6, story: 3, solving: 4, tank: 3 },
  },
  {
    id: 'bitphobia-hongdae-signature',
    storeId: 'bitphobia-hongdae',
    name: '비트포비아 홍대 대표 테마 (확인 필요)',
    genre: 'HORROR_THRILLER',
    generation: 'GEN2',
    difficulty: 4,
    pricePerPersonWon: 29000,
    capacityMin: 2,
    capacityMax: 6,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.4,
    tags: ['공포'],
    weight: { logic: 3, observe: 4, speed: 3, story: 3, solving: 3, tank: 8 },
  },
  {
    id: 'doorescape-hongdae-signature',
    storeId: 'doorescape-hongdae',
    name: '도어이스케이프 홍대 대표 테마 (확인 필요)',
    genre: 'ACTION_ADVENTURE',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.2,
    tags: ['액션'],
    weight: { logic: 4, observe: 5, speed: 5, story: 3, solving: 4, tank: 3 },
  },
  {
    id: 'decoder-hongdae-signature',
    storeId: 'decoder-hongdae',
    name: '디코더 홍대 대표 테마 (확인 필요)',
    genre: 'SCIFI_FANTASY',
    generation: 'GEN3',
    difficulty: 4,
    pricePerPersonWon: 30000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.5,
    tags: ['SF', '이머시브'],
    weight: { logic: 5, observe: 5, speed: 3, story: 6, solving: 5, tank: 2 },
  },
  {
    id: 'themaze-konkuk-signature',
    storeId: 'themaze-konkuk',
    name: '더메이즈 건대 대표 테마 (확인 필요)',
    genre: 'SCIFI_FANTASY',
    generation: 'GEN2',
    difficulty: 3,
    pricePerPersonWon: 28000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.2,
    tags: ['SF'],
    weight: { logic: 5, observe: 5, speed: 3, story: 5, solving: 5, tank: 2 },
  },
  {
    id: 'xscape-konkuk-signature',
    storeId: 'xscape-konkuk',
    name: '엑스케이프 건대 대표 테마 (확인 필요)',
    genre: 'COMEDY_ETC',
    generation: 'GEN1',
    difficulty: 2,
    pricePerPersonWon: 25000,
    capacityMin: 2,
    capacityMax: 5,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.0,
    tags: ['코믹'],
    weight: { logic: 3, observe: 3, speed: 4, story: 3, solving: 3, tank: 3 },
  },
  {
    id: 'bitphobia-sinchon-signature',
    storeId: 'bitphobia-sinchon',
    name: '비트포비아 신촌 대표 테마 (확인 필요)',
    genre: 'HORROR_THRILLER',
    generation: 'GEN2',
    difficulty: 4,
    pricePerPersonWon: 29000,
    capacityMin: 2,
    capacityMax: 6,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.3,
    tags: ['공포'],
    weight: { logic: 3, observe: 4, speed: 3, story: 3, solving: 3, tank: 8 },
  },
  {
    id: 'masterkey-sinchon-signature',
    storeId: 'masterkey-sinchon',
    name: '마스터키 신촌 대표 테마 (확인 필요)',
    genre: 'MYSTERY_DETECTIVE',
    generation: 'GEN1',
    difficulty: 3,
    pricePerPersonWon: 26000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.1,
    tags: ['추리', '문제방'],
    weight: { logic: 7, observe: 5, speed: 2, story: 3, solving: 6, tank: 1 },
  },
  {
    id: 'decoder-seongsu-signature',
    storeId: 'decoder-seongsu',
    name: '디코더 성수 대표 테마 (확인 필요)',
    genre: 'SCIFI_FANTASY',
    generation: 'GEN3',
    difficulty: 4,
    pricePerPersonWon: 30000,
    capacityMin: 2,
    capacityMax: 4,
    recommendedHeadcount: null,
    recommendedReason: null,
    rating: 4.4,
    tags: ['SF', '이머시브'],
    weight: { logic: 5, observe: 5, speed: 3, story: 6, solving: 5, tank: 2 },
  },
];

const USERS = [
  {
    id: 'escaper_pro',
    email: 'escaper_pro@taltal.demo',
    nickname: '방탈출고인물',
    mannerTemp: 98.2,
    level: 42,
    totalClears: 148,
    currentExp: 84,
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

  console.log(
    `Seeded ${STORES.length} stores, ${THEMES.length} themes, ${USERS.length} users`,
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
