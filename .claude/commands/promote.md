confidence 5/5 에 도달한 피드백 엔트리를 CLAUDE.md 규칙으로 승격합니다.

1. `.claude/feedback/*.md` 의 모든 엔트리를 스캔해 `confidence: 5/5` 이면서 아직 "반영됨" 마킹이 없는 항목을 찾는다.
2. 승격 대상이 없으면 그대로 보고하고 종료.
3. 대상이 있으면 각 엔트리를:
   - CLAUDE.md 의 적절한 섹션(또는 "## 검증된 규칙(Validated Rules)" 섹션을 신설)에 Pattern/Anti-pattern 을 간결한 규칙 한 줄로 추가.
   - 원본 feedback 엔트리는 삭제하지 말고 제목 끝에 `(반영됨 YYYY-MM-DD)` 마킹만 추가 (세션 리마인더가 중복 주입하지 않도록).
4. 변경 요약을 보고하고, 커밋 여부를 사용자에게 확인 (`[문서] 검증된 피드백 N건 CLAUDE.md 승격`).
