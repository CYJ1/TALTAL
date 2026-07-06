FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE 4000
# 로컬/데모 환경에서는 버전 관리된 migration 파일 대신 db push로 스키마를 동기화한다.
# 운영 배포 시에는 `prisma migrate dev`로 생성한 migration을 커밋하고 `migrate deploy`로 교체할 것.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/main"]
