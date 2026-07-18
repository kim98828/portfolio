# 프로젝트 컨벤션

포트폴리오 웹사이트 개발 시 따르는 규칙. 새로운 검증 규칙은 `.claude/feedback/` 에서 누적되며 5/5 도달 시 CLAUDE.md / 이 문서로 승격된다.

## 커밋 태그 (필수)

`[태그] 설명` 형식. PreToolUse 훅(`check-commit-tag.sh`)이 강제한다.

| 태그 | 용도 |
|------|------|
| `[기능]` | 새 기능 추가 |
| `[수정]` | 버그 수정 |
| `[문서]` | 문서 업데이트 |
| `[스타일]` | CSS/UI 변경 |
| `[리팩터]` | 구조 개선 |
| `[콘텐츠]` | 포트폴리오 내용 업데이트 |
| `[구조]` | 디렉토리/모듈 재구성 |
| `[긴급]` | 긴급 핫픽스 |

## 아키텍처 메모

- 정적 사이트(HTML/CSS/JS) — 빌드 단계 없음. `index.html` 진입.
- JS 모듈 진입점: `modules/main.js`. 렌더러/UI/설정은 `modules/` 하위.
- 콘텐츠 데이터: `blogData.js`, `codeData.js`. 도메인 필터 로직: `modules/ui.js`.
- 백엔드: `backend.gs` (Google Apps Script). 비밀키는 커밋 금지.
- 배포: main 브랜치 push → GitHub Actions → GitHub Pages.

## 셸 / 환경

- Claude Code Bash 도구 = Git Bash(POSIX). Unix 명령 사용, Windows cmd 명령 금지.
- Python 호출 시 `python3` 가 Windows Store stub 일 수 있음 — 훅들은 폴백 처리됨.

## 워크플로우 명령

- `/commit` — 변경 확인 후 컨벤션 커밋
- `/deploy` — 배포 상태 확인 후 push
- `/review` — 현재 변경 리뷰
- `/done` — 작업 마무리 요약
- `/promote` — 5/5 피드백을 CLAUDE.md 로 승격
- `/harness-status` — 하네스 상태 점검
