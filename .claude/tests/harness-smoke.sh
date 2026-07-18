#!/bin/bash
# 하네스 스모크 테스트 — 각 훅에 샘플 JSON 을 주입해 exit code / 출력을 검증한다.
# 실행: bash .claude/tests/harness-smoke.sh
# 종료코드: 0 = 전부 통과, 1 = 실패 있음

HOOKS="$(cd "$(dirname "$0")/.." && pwd)/hooks"
export CLAUDE_PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

PASS=0; FAIL=0
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

# run <hook> <json> ; sets RC, OUT
run() {
  OUT=$(echo "$2" | bash "$HOOKS/$1" 2>&1); RC=$?
}

echo "── check-commit-tag.sh ──"
run check-commit-tag.sh '{"tool_input":{"command":"git commit -m \"[수정] 버그\""}}'
[ "$RC" = 0 ] && ok "태그 있는 커밋 통과" || bad "태그 있는 커밋이 차단됨 (rc=$RC)"
run check-commit-tag.sh '{"tool_input":{"command":"git commit -m \"fix bug\""}}'
[ "$RC" = 2 ] && ok "태그 없는 커밋 차단" || bad "태그 없는 커밋이 통과됨 (rc=$RC)"
run check-commit-tag.sh '{"tool_input":{"command":"ls -la"}}'
[ "$RC" = 0 ] && ok "비커밋 명령 통과" || bad "비커밋 명령이 차단됨 (rc=$RC)"

echo "── check-secrets.sh ──"
run check-secrets.sh '{"tool_input":{"command":"ls -la"}}'
[ "$RC" = 0 ] && ok "비커밋 명령 통과" || bad "비커밋 명령이 차단됨 (rc=$RC)"
# 비밀키 차단은 staged diff 에 의존하므로 단위 검증: 패턴 매칭만 직접 확인.
# 예시 토큰은 런타임에 조립한다 — 이 테스트 파일 자체가 check-secrets 에 걸리지 않도록 리터럴을 두지 않음.
FAKE_TOK="ntn_$(printf 'a%.0s' $(seq 1 30))"
echo "+NOTION_KEY=$FAKE_TOK" | grep -qEi 'ntn_[A-Za-z0-9]{20,}' \
  && ok "Notion 토큰 정규식 매칭" || bad "Notion 토큰 정규식 불일치"
echo "+const x = 1" | grep -qEi 'ntn_[A-Za-z0-9]{20,}' \
  && bad "정상 코드 오탐" || ok "정상 코드 오탐 없음"

echo "── bash-failure-analyzer.sh ──"
run bash-failure-analyzer.sh '{"tool_input":{"command":"dir"},"tool_output":{"stderr":"bash: dir: command not found"}}'
echo "$OUT" | grep -q "Windows 명령" && ok "Windows 명령 패턴 탐지" || bad "Windows 명령 패턴 미탐지"
run bash-failure-analyzer.sh '{"tool_input":{"command":"git push"},"tool_output":{"stderr":"! [rejected] main -> main (non-fast-forward)"}}'
echo "$OUT" | grep -q "push 거부" && ok "push 거부 패턴 탐지" || bad "push 거부 패턴 미탐지"

echo "── detect-user-correction.sh ──"
run detect-user-correction.sh '{"user_prompt":"그게 아니라 다시 해"}'
echo "$OUT" | grep -q "교정 감지" && ok "부정 교정 탐지" || bad "부정 교정 미탐지"
run detect-user-correction.sh '{"user_prompt":"맞아 좋아"}'
echo "$OUT" | grep -q "확인 감지" && ok "긍정 확인 탐지" || bad "긍정 확인 미탐지"
run detect-user-correction.sh '{"user_prompt":"index.html 의 헤더를 수정해줘"}'
[ -z "$OUT" ] && ok "일반 프롬프트 무반응" || bad "일반 프롬프트 오탐"

echo "── session-stop.sh ──"
run session-stop.sh '{"stop_hook_active":false}'
[ "$RC" = 0 ] && ok "정상 종료(exit 0, 정지 차단 안 함)" || bad "exit 0 아님 (rc=$RC)"
run session-stop.sh '{"stop_hook_active":true}'
[ "$RC" = 0 ] && [ -z "$OUT" ] && ok "재진입 시 조용히 종료" || bad "재진입 가드 실패"

SYNC="$(cd "$(dirname "$0")/.." && pwd)/sync"
# 격리된 임시 프로젝트에 매핑을 깔고 실제 스크립트를 호출한다
TMPD=$(mktemp -d); mkdir -p "$TMPD/.claude/sync"
printf 'SECRETNAME\t익명플랫폼\n' > "$TMPD/.claude/sync/anonymize-map.tsv"

echo "── sync: anonymize.sh ──"
OUT=$(echo "프로젝트 SECRETNAME 출시" | CLAUDE_PROJECT_DIR="$TMPD" bash "$SYNC/anonymize.sh")
{ echo "$OUT" | grep -q "익명플랫폼" && ! echo "$OUT" | grep -q "SECRETNAME"; } \
  && ok "매핑 치환 동작" || bad "매핑 치환 실패 ($OUT)"

echo "── sync: check-anon.sh ──"
echo "여기에 SECRETNAME 노출" > "$TMPD/draft.txt"
CLAUDE_PROJECT_DIR="$TMPD" bash "$SYNC/check-anon.sh" "$TMPD/draft.txt" >/dev/null 2>&1
[ $? = 2 ] && ok "미익명화 명칭 차단(exit 2)" || bad "미익명화 명칭 미차단"
echo "여기는 익명플랫폼 이야기" > "$TMPD/clean.txt"
CLAUDE_PROJECT_DIR="$TMPD" bash "$SYNC/check-anon.sh" "$TMPD/clean.txt" >/dev/null 2>&1
[ $? = 0 ] && ok "깨끗한 텍스트 통과(exit 0)" || bad "깨끗한 텍스트 오차단"
rm -rf "$TMPD"

echo ""
echo "결과: $PASS 통과 / $FAIL 실패"
[ "$FAIL" = 0 ] || exit 1
