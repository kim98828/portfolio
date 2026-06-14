하네스(자동화 시스템) 상태를 점검해 보고합니다.

1. **훅 등록 확인**: `.claude/settings.json` 의 hooks 블록에 6개 훅이 모두 연결돼 있는지 확인 — check-commit-tag, check-secrets (PreToolUse), bash-failure-analyzer (PostToolUseFailure), session-reminder (SessionStart), detect-user-correction (UserPromptSubmit), session-stop (Stop).
2. **훅 파일 존재**: `.claude/hooks/*.sh` 6개 파일 존재 확인.
3. **스모크 테스트 실행**: `bash .claude/tests/harness-smoke.sh` 를 실행해 전 훅 통과 여부를 보고(통과/실패 수). 실패가 있으면 어떤 검사인지 명시.
4. **피드백 통계**: `.claude/feedback/*.md` 를 파싱해 카테고리별 엔트리 수, confidence 분포, 승격 대기(5/5 미반영) 건수 요약.
5. **승격 대기 목록**: 5/5 도달했으나 CLAUDE.md 미반영 엔트리가 있으면 `/promote` 제안.
6. **3개월+ 미검증 엔트리**: validated 날짜가 90일 이상 지난 항목을 재검증/삭제 후보로 표시.
7. **관측 로그 요약**:
   - `.claude/harness.log` 가 있으면 최근 발동(교정 감지/턴 종료/차단) 건수와 마지막 시각.
   - `.claude/harness-unmatched.log` 가 있으면 **반복(2회 이상) 발생한 에러를 빈도순**으로 표시 → 새 anti-pattern / feedback 후보로 제안 (confidence 증가 신호).
8. **blocklist 설정 여부**: `.claude/secrets-blocklist.txt` 존재 여부 (없으면 example 복사 안내).
9. **동기화 하네스**: `.claude/sync/anonymize-map.tsv` 와 `source.txt` 존재 여부(없으면 example 복사 안내), `source-cursor.json` 의 마지막 동기화 SHA/버전/날짜. 가능하면 `bash .claude/sync/collect-source.sh` 로 미반영 신규 커밋 수를 표시(CURSOR_UPTODATE 면 최신).
10. 한눈에 보는 표로 보고.
