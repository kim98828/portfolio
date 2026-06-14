# Workflow Feedback — 커밋 / git / 프로세스 / 셸

커밋 컨벤션, git 운영, 도구 사용, 셸(Windows bash) 관련 검증된 학습.

엔트리 형식은 [README](./README.md) 참조. 새 엔트리는 아래 `---` 다음에 추가.

---

### 커밋은 한국어 태그로 시작 — confidence: 4/5, validated: 2026-06-14

**Context**: 전체 커밋 히스토리가 [콘텐츠][수정][기능][스타일][리팩터][긴급][구조] 형식.
**Pattern**: 모든 커밋은 `[태그] 설명` 으로 시작한다. check-commit-tag.sh PreToolUse 훅이 강제한다.
**Anti-pattern**: 영문 conventional commits(feat:, fix:) 또는 태그 없는 메시지.
**Why**: 1인 한국어 프로젝트로 일관된 한국어 태그가 히스토리 가독성을 높인다.
**Author**: kim98828

---

### Windows 에서 셸은 bash — confidence: 3/5, validated: 2026-06-14

**Context**: Claude Code 의 Bash 도구는 Git Bash(POSIX) 이며 cmd/PowerShell 이 아니다.
**Pattern**: ls/cat/grep/rm 등 Unix 명령 사용. /dev/null, 정방향 슬래시 경로.
**Anti-pattern**: dir/type/findstr/del 등 Windows 명령 → command not found.
**Why**: 도구가 bash 를 호출하므로 cmd 내장 명령은 존재하지 않는다.
**Author**: kim98828

---
