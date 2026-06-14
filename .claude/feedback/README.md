# Feedback Loop Stacking

대화마다 검증된 학습을 누적해 복리로 축적하는 공간입니다.
git 으로 공유되며, Claude Code 가 매 세션(SessionStart 훅)에서 참조합니다.

## 엔트리 형식

```markdown
### [주제] — confidence: N/5, validated: YYYY-MM-DD

**Context**: 어떤 상황에서 발견했는지
**Pattern**: 검증된 접근법 (이렇게 해라)
**Anti-pattern**: 실패한 접근법 (이렇게 하지 마라)
**Why**: 근본 원인
**Author**: git username
```

엔트리는 `---` 줄로 구분합니다.

## Confidence 레벨

| Level | 의미 | 조건 |
|-------|------|------|
| 1/5 | 첫 발견 | 1회 관찰 |
| 2/5 | 반복 확인 | 같은 실수/패턴 2-3회 |
| 3/5 | 패턴 확립 | 세션 리마인더에 자동 주입되기 시작 |
| 4/5 | 표준 | 워크플로우에 통합 |
| 5/5 | 불변 규칙 | `/promote` 로 CLAUDE.md 승격 |

## 카테고리 파일

| 파일 | 범위 |
|------|------|
| `web.md` | HTML / CSS / JS / 모듈(modules/) / 렌더러 / UI |
| `deploy.md` | GitHub Pages / Actions / Apps Script 백엔드 / 도메인 |
| `workflow.md` | 커밋 / git / 프로세스 / 도구 사용 / 셸 |

## 규칙

- **5/5 도달 시**: `/promote` 로 CLAUDE.md 승격 (원본은 보존하고 "반영됨" 마킹).
- **3개월 미검증 시**: 재검증 또는 삭제.
- **반복 확인 시**: confidence +1, validated 날짜 갱신.
- Claude 는 교정/확인 감지 시 자동으로 피드백을 제안합니다 (UserPromptSubmit 훅).

## 자동화 훅

| Hook | 이벤트 | 동작 |
|------|--------|------|
| `detect-user-correction.sh` | UserPromptSubmit | 교정/확인 키워드 → 피드백 제안 (긍정 ≤200자) |
| `bash-failure-analyzer.sh` | PostToolUseFailure | 실패 패턴 매칭 → 수정법 주입, 미매칭은 `harness-unmatched.log` 누적 |
| `session-reminder.sh` | SessionStart | 고신뢰 피드백 동적 주입 |
| `check-commit-tag.sh` | PreToolUse(Bash) | 한국어 커밋 태그 강제 |
| `check-secrets.sh` | PreToolUse(Bash) | 커밋 staged diff 에서 비밀키/금칙어 차단 |
| `session-stop.sh` | Stop | 미커밋/미푸시 알림 + 관측 로그(`harness.log`) |

## 관측 로그

- `.claude/harness.log` — 훅 발동 기록(교정 감지, 턴 종료, 비밀키 차단). gitignore됨.
- `.claude/harness-unmatched.log` — 분류 안 된 Bash 실패 누적. 반복되면 새 패턴/피드백 후보. gitignore됨.
- 스모크 테스트: `bash .claude/tests/harness-smoke.sh` (전 훅 동작 검증).
