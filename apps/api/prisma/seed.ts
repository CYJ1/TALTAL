import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// 데모 계정 공통 비밀번호 (시드 전용, 실서비스 데이터에는 절대 사용 금지)
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123!', 10);

// store_id / theme_id는 apps/scraper와 apps/ai-engine의 시드 데이터와 동일하게
// 고정해 서비스 간 참조가 일관되도록 한다.
const STORES = [
  { id: 'keyescape-gangnam', name: '키이스케이프 강남점', region: '서울 강남구' },
  { id: 'zerooworld-gangnam', name: '제로월드 강남점', region: '서울 강남구' },
  { id: 'murderparker-gangnam', name: '머더파커 강남점', region: '서울 강남구' },
  { id: 'point9-gangnam', name: '포인트나인 강남점', region: '서울 강남구' },
];

const THEMES = [
  {
    id: 'confession',
    storeId: 'keyescape-gangnam',
    name: '고백',
    genre: '감성',
    capacityMin: 2,
    capacityMax: 5,
    rating: 4.8,
    tags: ['장치중심', '감성레전드', '나레이션필수'],
    weight: { logic: 2, observe: 3, speed: 1, story: 8, solving: 4, tank: 1 },
  },
  {
    id: 'ring',
    storeId: 'zerooworld-gangnam',
    name: '링',
    genre: '공포',
    capacityMin: 2,
    capacityMax: 6,
    rating: 4.7,
    tags: ['공포도최상', '탱커필수', '연출대박'],
    weight: { logic: 3, observe: 4, speed: 3, story: 2, solving: 3, tank: 9 },
  },
  {
    id: 'yesterday-today',
    storeId: 'murderparker-gangnam',
    name: '어제, 오늘, 그리고',
    genre: '미스터리',
    capacityMin: 2,
    capacityMax: 4,
    rating: 4.9,
    tags: ['문제방', '뚝배기유형', '활동성낮음'],
    weight: { logic: 8, observe: 5, speed: 1, story: 3, solving: 6, tank: 1 },
  },
  {
    id: 'key-double-life',
    storeId: 'point9-gangnam',
    name: '열쇠공의 이중생활',
    genre: '잠입',
    capacityMin: 2,
    capacityMax: 5,
    rating: 4.6,
    tags: ['잠입', '장치중심', '스토리연계성'],
    weight: { logic: 4, observe: 7, speed: 2, story: 5, solving: 5, tank: 2 },
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
        genre: theme.genre,
        capacityMin: theme.capacityMin,
        capacityMax: theme.capacityMax,
        rating: theme.rating,
        tags: theme.tags,
      },
      create: {
        id: theme.id,
        storeId: theme.storeId,
        name: theme.name,
        genre: theme.genre,
        capacityMin: theme.capacityMin,
        capacityMax: theme.capacityMax,
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
