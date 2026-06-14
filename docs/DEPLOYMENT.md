# Deployment & Environments

dev/prod 분리 구조. **Vite** 빌드 + **Cloudflare Pages** 호스팅(PR 프리뷰·staging 내장).

## 디렉터리

```
index.html              ← Vite 진입 HTML (루트 고정)
src/
  main.js               ← 모듈 진입점
  style.css
  modules/*.js          ← UI/렌더/백엔드 (단일 소스 — 구 script.js 폐기)
  data/*.js             ← blogData / codeData (ES module, 동적 import로 코드 스플릿)
public/                 ← 정적 패스스루 (images/, favicon.svg, robots.txt) → dist 루트로 복사
dist/                   ← 빌드 산출물 (gitignored, 배포 대상)
.env.development        ← npm run dev 환경값
.env.production         ← npm run build 환경값
vite.config.js
package.json
```

## 로컬 개발 (Node 18+ 필요)

> **선결**: 이 PC에 Node가 설치돼 있지 않습니다. https://nodejs.org (LTS) 설치 필수.

```bash
npm install        # 최초 1회 (package-lock.json 생성됨 — 커밋 권장)
npm run dev        # http://localhost:5173  ← file:// 문제 해결
npm run build      # dist/ 생성 (.env.production 적용)
npm run preview    # 빌드 결과 로컬 확인 (http://localhost:4173)
```

## 환경 변수

`VITE_` 접두사만 클라이언트로 노출됨. 값은 비밀이 아니며(클라이언트 번들에 포함) 환경별로 분리.

| 변수 | dev | prod |
|------|-----|------|
| `VITE_APP_ENV` | development | production |
| `VITE_BACKEND_URL` | dev Apps Script (placeholder) | prod Apps Script |
| `VITE_UNLOCK_HASH` | 잠금 비번 SHA-256 | 동일 |

- 개인 오버라이드는 `.env.local` (gitignored).
- **진짜 비밀값**이 생기면 레포가 아니라 Cloudflare Pages 프로젝트의 환경변수(Production/Preview 분리)에 넣는다.
- dev 백엔드: 별도 Apps Script 배포를 만든 뒤 `.env.development`의 `VITE_BACKEND_URL` placeholder를 교체.

## Cloudflare Pages 연결 (사용자 1회 설정)

1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git** → 이 레포 선택.
2. 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Production branch**: `main`
3. **Settings → Environment variables** 에 Production / Preview 각각 `VITE_*` 등록.
4. 저장 → 첫 배포. 이후:
   - `main` 푸시 → **production** 자동 배포
   - PR/다른 브랜치 푸시 → **고유 Preview URL** 자동 생성 (= staging/리뷰)
5. (선택) 커스텀 도메인 연결.

> Cloudflare가 Git 통합으로 빌드/배포/프리뷰를 모두 처리하므로 별도 배포용 GitHub Action은 없음.
> `build.yml`은 PR에서 빌드가 깨지지 않는지 확인하는 **검증 전용** 잡.

## GitHub Pages → Cloudflare 전환 주의

- 구 `deploy.yml`(Pages)은 제거됨. **Cloudflare를 먼저 연결한 뒤 이 브랜치를 merge** 할 것.
- merge 전까지 기존 Pages 사이트는 그대로 떠 있음(프로덕션 안전).

## 이력서 PDF

`.gitignore`는 `*.pdf`를 무시하되 `!public/*.pdf` 예외를 둔다 → `public/이력서_20260207.pdf`만
커밋되어 `dist/`로 복사되고 다운로드 링크(`/이력서_20260207.pdf`)가 배포본에서 동작한다.
(다른 위치의 PDF는 여전히 무시됨.)
