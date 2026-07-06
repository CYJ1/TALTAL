# TALTAL — RoomMate 방탈출 통합 플랫폼

`ROOMATE_v2 PRD (v5.5)` + `escape_platform_prd_v1`을 통합한 스펙을 기준으로 구현한
풀스택 모노레포입니다. 실시간 예약 검색, 게이미피케이션 육각 스탯 프로필, 하이브리드
리뷰, 안전 에스크로 동행 매칭, Neo4j 그래프 기반 AI 추천까지 5개 도메인을 다룹니다.

## 빌드 범위 (중요)

이번 구현은 **풀스택 아키텍처 + 목업 외부 연동** 범위로 진행했습니다.

- 프레임워크/DB/메시지 브로커/그래프DB는 모두 **실제로 동작**합니다 (Next.js,
  NestJS, PostgreSQL, Redis, RabbitMQ, Neo4j).
- 아래 3가지는 실제 계정·크롤링 대상이 없어 **동일한 인터페이스의 목업 구현체**로
  대체했습니다. 나중에 키/대상이 생기면 어댑터 구현체만 교체하면 됩니다.
  - **방탈출 매장 크롤링** → `apps/scraper/app/mock_source.py` (시드 기반 재현 가능한 가짜 예약 데이터)
  - **Naver CLOVA OCR** → `apps/api/src/common/adapters/ocr/clova-ocr-mock.adapter.ts`
  - **포트원(PortOne) 에스크로 결제** → `apps/api/src/common/adapters/payment/portone-mock.adapter.ts`
- **GraphSAGE/Node2Vec 학습 파이프라인**도 실제 학습 데이터·GPU 배치잡이 없는 단계라,
  동일한 Neo4j 그래프 스키마 위에서 태그 코사인 유사도 + 취약 스탯 보정 점수를
  계산하는 경량 대체 알고리즘(`apps/ai-engine/app/recommend.py`)으로 구현했습니다.
  Neo4j 자체와 그래프 스키마는 실제입니다.
- 디자인 톤앤매너는 **라이트 모드** 기준 (PRD v1 명시)으로 통일했습니다.

## 아키텍처

```
apps/
  web/        Next.js (App Router) — 모바일 최적화 웹뷰, 5개 도메인 화면
  api/        NestJS (DDD 모듈러) — Prisma/PostgreSQL, Redis, RabbitMQ, 에스크로/OCR 어댑터
  scraper/    Python — 비동기 목업 크롤러, RabbitMQ 컨슈머, Redis 캐시 적재
  ai-engine/  Python (FastAPI) — Neo4j 그래프 기반 추천 서빙
docker-compose.yml   postgres / redis / rabbitmq / neo4j / api / scraper / ai-engine / web
```

### 5개 도메인 ↔ 코드 매핑

| 도메인 | 화면 | 백엔드 |
|---|---|---|
| 1. 실시간 통합 검색 | `apps/web/app/page.tsx` | `apps/api/src/modules/search`, `apps/scraper` |
| 2. 마이캘린더 & 육각 스탯 | `apps/web/app/calendar/page.tsx` | `apps/api/src/modules/stats` (UserStatCalculator, Webhook 스케줄러) |
| 3. 하이브리드 리뷰 | `apps/web/app/themes/[themeId]/review/page.tsx` | `apps/api/src/modules/reviews` |
| 4. 안전 에스크로 동행 매칭 | `apps/web/app/party/[id]/page.tsx` | `apps/api/src/modules/party` (OCR/결제 어댑터, 정산 스케줄러) |
| 5. Neo4j 그래프 AI 추천 | `apps/web/app/recommendations/page.tsx` | `apps/ai-engine` (Neo4j) ↔ `apps/api/src/modules/recommendation` (프록시) |

## 실행 방법

### 방법 A — 프론트엔드만 (외부 인프라 없이 즉시 데모)

```bash
cd apps/web
npm install
npm run dev
```

`API_BASE_URL` 환경변수를 설정하지 않으면 `apps/web/lib/mock-data.ts`의 인메모리
픽스처로 5개 화면이 전부 즉시 동작합니다 (백엔드 서버 필요 없음).

### 방법 B — 전체 스택 (Docker Compose)

```bash
docker compose up --build
```

- web: http://localhost:3000 (API_BASE_URL이 자동으로 NestJS API를 가리킴)
- api: http://localhost:4000
- ai-engine: http://localhost:8000 (최초 1회 `POST /internal/seed` 호출로 Neo4j 시드)
- neo4j browser: http://localhost:7474 (neo4j / roommate-dev-pw)
- rabbitmq management: http://localhost:15672 (guest / guest)

최초 기동 후 Postgres 시드가 필요합니다:

```bash
docker compose exec api npm run prisma:seed
curl -X POST http://localhost:8000/internal/seed
```

## 검증한 것

- `apps/api`: `npm run build` (Nest/TS 컴파일) 통과
- `apps/web`: `npm run build`, `npm run lint` 통과
- `apps/web`: Playwright로 5개 화면 스크린샷 확인 + 리뷰 제출 → 육각 스탯 실시간
  성장 → 캘린더 Pending 배지 소멸까지 실제 브라우저에서 상호작용 테스트 완료
- `apps/scraper`, `apps/ai-engine`: Python 구문 검사(`py_compile`) 통과

Docker Compose 전체 스택(Postgres/Redis/RabbitMQ/Neo4j 실제 기동)은 이 개발
환경에 Docker 데몬이 없어 직접 기동 테스트는 하지 못했습니다. 로컬에 Docker가
있는 환경에서 `docker compose up --build`로 확인해주세요.
