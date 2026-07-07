# 탈탈 (TalTal) — 방탈출 통합 플랫폼

"자물쇠도, 고민도 탈탈 털어드립니다." 

실시간 예약 검색, 게이미피케이션
육각 스탯 프로필, 하이브리드 리뷰, 안전 에스크로 동행 매칭, Neo4j 그래프 기반 AI
추천

5개 핵심 도메인 및 그 주변을 감싸는 앱 셸(스플래시/로그인/예약/파티개설 등) 화면까지 구현

## 빌드 범위
**풀스택 아키텍처 + 목업 외부 연동** 범위
- 프레임워크/DB/메시지 브로커/그래프DB 모두 **실제동작** (Next.js,
  NestJS, PostgreSQL, Redis, RabbitMQ, Neo4j).
- 아래 3가지는 실제 계정·크롤링 대상이 없어 **동일한 인터페이스의 목업 구현체**로
  대체함. 나중에 키/대상이 생기면 교체예정
  - **방탈출 매장 크롤링** → `apps/scraper/app/mock_source.py` (시드 기반 재현 가능한 가짜 예약 데이터)
  - **Naver CLOVA OCR** → `apps/api/src/common/adapters/ocr/clova-ocr-mock.adapter.ts`
  - **포트원(PortOne) 에스크로 결제** → `apps/api/src/common/adapters/payment/portone-mock.adapter.ts`
- **GraphSAGE/Node2Vec 학습 파이프라인**도 실제 학습 데이터·GPU 배치잡 X<br>
  동일한 Neo4j 그래프 스키마 위에서 태그 코사인 유사도 + 취약 스탯 보정 점수를
  계산하는 경량 대체 알고리즘(`apps/ai-engine/app/recommend.py`)으로 구현함<br>
  Neo4j 자체와 그래프 스키마는 실제 구현완료
- **로그인/회원가입: 실제 인증 시스템** (`apps/api/src/modules/auth`) — bcrypt
  비밀번호 해싱 + JWT 발급/검증, Next.js가 httpOnly 세션 쿠키를 관리하며
  `proxy.ts`가 비로그인 사용자를 보호된 화면에서 리다이렉트함 <br>
  `API_BASE_URL`을 설정하지 않은 목업 모드에서는 여전히 로그인 없이 데모 가능
  리뷰/파티/프로필/캘린더/추천 API도 전부 `JwtAuthGuard`로 보호되어, 클라이언트가
  보낸 `userId`가 아니라 토큰에서 검증된 사용자 본인의 데이터만 조회·수정됨<br>
- **소셜 로그인(카카오/네이버/Google)은 코드까지 준비되어 있지만, 실제 발급받은
  OAuth 클라이언트 ID/Secret이 없어 실제 테스트 필요** <br>
  로그인 화면의 소셜 버튼 → `apps/web/app/api/oauth/[provider]` (인가 리다이렉트) →
  `.../callback` (코드 교환 + 프로필 조회) → NestJS의 내부 전용 `POST /auth/social`
  (Next.js 서버만 호출 가능하도록 `x-internal-secret` 공유 비밀값으로 보호) 순으로
  이어지는 전체 플로우는 구현되어 있음<br>
  각 프로바이더 개발자 콘솔에서 앱을 등록해 `KAKAO_CLIENT_ID` 등 환경변수를 채우면 바로 동작
  — 비워두면 로그인 화면에서 해당 버튼 클릭 시 "아직 연동 준비 중" 안내로 복귀
- 디자인 톤앤매너는 **라이트 모드** 기준으로 통일
<br>

## 아키텍처

```
apps/
  web/        Next.js (App Router) — 모바일 최적화 웹뷰, 전체 화면
  api/        NestJS (DDD 모듈러) — Prisma/PostgreSQL, Redis, RabbitMQ, 에스크로/OCR 어댑터
  scraper/    Python — 비동기 목업 크롤러, RabbitMQ 컨슈머, Redis 캐시 적재
  ai-engine/  Python (FastAPI) — Neo4j 그래프 기반 추천 서빙
docker-compose.yml   postgres / redis / rabbitmq / neo4j / api / scraper / ai-engine / web
```
<br>

## 화면 Wireframe - 초안
### 로그인/회원가입
<div style="display: flex; overflow-x: auto; white-space: nowrap; gap: 10px;">
  <img src="readme_src/splashfixed.png" width="250px" />
  <img src="readme_src/new2login.png" width="250px" />
  <img src="readme_src/newloginquestion.png" width="250px" />
</div> <br>

### 전체테마 검색 및 예약창 (현재 위치기반, 위치 선택가능)
<div style="display: flex; overflow-x: auto; white-space: nowrap; gap: 10px;">
  <img src="readme_src/newsearch.png" width="250px" />
  <img src="readme_src/new5themedetail.png" width="250px" />
  <img src="readme_src/newmap.png" width="250px" />
  <img src="readme_src/new6booking.png" width="250px" />
  <img src="readme_src/new7bookingcomplete.png" width="250px" />
</div> <br>

### 동행구하기 기능
<div style="display: flex; overflow-x: auto; white-space: nowrap; gap: 10px;"> 
  <img src="readme_src/new8partynew.png" width="250px" />
  <img src="readme_src/new10notifications.png" width="250px" />
</div> <br>

### 리뷰작성
<div style="display: flex; overflow-x: auto; white-space: nowrap; gap: 10px;"> 
  <img src="readme_src/7reviewgrades.png" width="250px" />
</div> <br>


### 프로필화면
<div style="display: flex; overflow-x: auto; white-space: nowrap; gap: 10px;">
  <img src="readme_src/new9profile.png" width="250px" />
  <img src="readme_src/8profilescrolled.png" width="250px" />
</div> <br>

<br><br>

## 화면 구조 (`apps/web/app`)

앱 셸 (인증 전/공용):

| 화면 | 경로 |
|---|---|
| 시작 화면 (스플래시) | `/` |
| 로그인 | `/login` |
| 회원가입 | `/signup` |
| 알림 | `/notifications` |

5개 핵심 도메인 ↔ 코드 매핑:

| 도메인 | 화면 | 백엔드 |
|---|---|---|
| 1. 실시간 통합 검색 | `/home` | `apps/api/src/modules/search`, `apps/scraper` |
| 2. 마이캘린더 & 육각 스탯 | `/calendar`, `/profile` | `apps/api/src/modules/stats` (UserStatCalculator, Webhook 스케줄러) |
| 3. 하이브리드 리뷰 | `/themes/[themeId]/review` | `apps/api/src/modules/reviews` |
| 4. 안전 에스크로 동행 매칭 | `/party/[id]`, `/party/new` | `apps/api/src/modules/party` (OCR/결제 어댑터, 정산 스케줄러) |
| 5. Neo4j 그래프 AI 추천 | `/recommendations` | `apps/ai-engine` (Neo4j) ↔ `apps/api/src/modules/recommendation` (프록시) |

테마 상세 & 예약 플로우 (도메인 1·4를 잇는 화면):

| 화면 | 경로 |
|---|---|
| 테마 상세 | `/themes/[themeId]` |
| 예약 폼 | `/themes/[themeId]/book` |
| 예약 완료 | `/themes/[themeId]/book/complete` |
| 동행 파티 개설 (OCR 업로드) | `/party/new` |

<br>

## 실행 방법

### 방법 A — 프론트엔드만 (외부 인프라 없이 즉시 데모)

```bash
cd apps/web
npm install
npm run dev
```

`API_BASE_URL` 환경변수를 설정하지 않으면 `apps/web/lib/mock-data.ts`의 인메모리
픽스처로 모든 화면이 즉시 동작합니다 (백엔드 서버 필요 없음). 
`/`(스플래시)부터 시작해서 로그인 → 홈 → 테마 상세 → 예약 → 동행 파티 개설까지 전체 플로우를 눌러볼 수 있습니다.

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

