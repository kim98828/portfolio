# CLAUDE.md — Portfolio Project

## Project Overview
kim98828의 개인 포트폴리오 웹사이트. 순수 HTML/CSS/JS 기반 정적 사이트.
GitHub Pages로 배포.

## Tech Stack
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (프레임워크 없음)
- **Backend**: Google Apps Script (Telegram 알림 + Google Sheets 로깅)
- **Hosting**: GitHub Pages
- **Fonts**: Inter (UI), Fira Code (코드 블록)

## File Structure
```
index.html      — 메인 HTML (싱글 페이지)
style.css       — 전체 스타일시트
script.js       — 앱 로직 (잠금화면, 파티클, 코드팝업, 백엔드 연동)
codeData.js     — 코드 팝업 데이터 (스킬별 코드 예제)
backend.gs      — Google Apps Script 백엔드
robots.txt      — 크롤러 차단
```

## Coding Standards

### HTML
- 시멘틱 태그 사용 (`section`, `nav`, `header`)
- `reveal` 클래스로 스크롤 애니메이션 적용
- `data-code` 속성으로 코드팝업 연결

### CSS
- CSS Variables로 테마 관리 (`--bg-primary`, `--text-primary` 등)
- 다크 테마 기본 (indigo-cyan 그라데이션)
- 모바일 반응형 (`768px` 브레이크포인트)

### JavaScript
- 순수 JS — 외부 라이브러리 없음
- `DOMContentLoaded` 안에서 모든 로직 실행
- Canvas 기반 파티클 애니메이션
- `no-cors` 모드로 Google Apps Script 통신

### Git Commit Convention
```
[기능]  새 기능 추가
[수정]  버그 수정
[문서]  문서 업데이트
[스타일] CSS/UI 변경
[리팩터] 구조 개선
[콘텐츠] 포트폴리오 내용 업데이트
```

## Sections (index.html)
1. **Lock Screen** — SHA-256 패스워드 잠금
2. **Hero** — 타이핑 효과 + 파티클 캔버스
3. **About** (01) — 자기소개 + 정보 카드
4. **Projects** (02) — DNABLE, XROOM 프로젝트 카드
5. **Technical Insights** (03) — 기술 선택 이유
6. **Career** (04) — 경력 타임라인
7. **Skills** (05) — 기술 스택 + 코드 팝업
8. **Contact** (06) — 메시지 폼 + 연락처

## Important Notes
- `backend.gs`에 Telegram Bot Token이 포함됨 — 민감 정보 주의
- `EXPECTED` SHA-256 해시는 연락처 기반 잠금 — 변경 시 주의
- 이미지는 외부 CDN URL 사용 (로컬 파일 아님)
- `codeData.js`의 코드 예제는 HTML 이스케이프 필요 (`&amp;`, `&lt;` 등)
