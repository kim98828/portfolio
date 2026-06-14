#!/bin/bash
# PreToolUse hook (Bash): git commit 직전, 스테이징된 변경에서 비밀키 / 금칙어를 탐지해 차단한다.
# Exit codes: 0 = allow, 2 = block (stderr 가 Claude 에 표시됨)
#
# 자체완결형. 검증 출처: feedback/deploy.md "백엔드 비밀키를 커밋에 포함하지 말 것" (3/5),
# memory "포트폴리오는 실제 내부 시스템 명칭 노출 금지".
#
# 동작:
#   1) git commit 명령일 때만 작동 (그 외 SKIP).
#   2) `git diff --cached` (추가/수정된 라인)에서 비밀키 패턴을 스캔.
#   3) 추가로 .claude/secrets-blocklist.txt (gitignore됨, 로컬 전용) 의 리터럴 금칙어를 스캔.
#   4) 적중 시 exit 2 로 차단하고 어떤 라인이 걸렸는지 보고.

INPUT=$(cat)

# Windows Store python3 stub 회피 — 실제 동작 인터프리터 선택
if python3 -c '' >/dev/null 2>&1; then
    PYBIN=python3
elif python -c '' >/dev/null 2>&1; then
    PYBIN=python
else
    echo "[Harness] 경고: Python 인터프리터 없음 — 비밀키 검증 건너뜀" >&2
    exit 0
fi

# 커밋 명령인지 판별 (commit-tag 훅과 동일한 견고한 파싱)
IS_COMMIT=$(CLAUDE_HOOK_INPUT="$INPUT" PYTHONIOENCODING=utf-8 "$PYBIN" <<'PYEOF'
import os, json
try:
    d = json.loads(os.environ.get("CLAUDE_HOOK_INPUT", "{}"))
    cmd = d.get("tool_input", {}).get("command", "")
except Exception:
    print("NO"); raise SystemExit
print("YES" if "git commit" in cmd else "NO")
PYEOF
)
[ "$IS_COMMIT" != "YES" ] && exit 0

PROJ="${CLAUDE_PROJECT_DIR:-.}"

# 스테이징된 '추가 라인'(+로 시작)만 추출 — 기존 코드/문맥 라인 오탐 방지
ADDED=$(git -C "$PROJ" diff --cached --no-color 2>/dev/null | grep -E '^\+' | grep -vE '^\+\+\+')
[ -z "$ADDED" ] && exit 0

HITS=""

scan() {  # $1 = 정규식, $2 = 사람이 읽는 이름
  local found
  found=$(echo "$ADDED" | grep -nEi "$1" | head -3)
  if [ -n "$found" ]; then
    HITS="${HITS}\n  · ${2}\n$(echo "$found" | sed 's/^/      /')"
  fi
}

# ── 비밀키 패턴 ──
scan 'ntn_[A-Za-z0-9]{20,}'                              "Notion 토큰 (ntn_)"
scan '(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}'           "GitHub 토큰 (ghp_ 등)"
scan 'github_pat_[A-Za-z0-9_]{20,}'                     "GitHub fine-grained PAT"
scan 'AKIA[0-9A-Z]{16}'                                  "AWS Access Key (AKIA)"
scan 'AIza[0-9A-Za-z_-]{30,}'                            "Google API 키 (AIza)"
scan 'sk-[A-Za-z0-9]{20,}'                               "OpenAI/유사 비밀키 (sk-)"
scan 'xox[baprs]-[A-Za-z0-9-]{10,}'                      "Slack 토큰 (xox.-)"
scan '\-\-\-\-\-BEGIN[A-Z ]*PRIVATE KEY'                 "개인키(PEM) 블록"
scan '(api[_-]?key|secret|token|password|passwd|client[_-]?secret)["'\'' ]*[:=]["'\'' ]*[A-Za-z0-9_./+-]{16,}' "키=값 형태의 하드코딩된 비밀값"

# ── 로컬 금칙어(실제 내부 명칭 등) — gitignore된 파일에서 읽음 ──
BLOCKLIST="$PROJ/.claude/secrets-blocklist.txt"
if [ -f "$BLOCKLIST" ]; then
  while IFS= read -r term; do
    [ -z "$term" ] && continue
    case "$term" in \#*) continue ;; esac          # 주석 라인 무시
    if echo "$ADDED" | grep -qiF "$term"; then
      HITS="${HITS}\n  · 금칙어 노출: '${term}' (secrets-blocklist.txt)"
    fi
  done < "$BLOCKLIST"
fi

if [ -n "$HITS" ]; then
  {
    echo "[Harness — 차단] 스테이징된 변경에 비밀값/금칙어로 의심되는 내용이 있습니다."
    echo -e "$HITS"
    echo ""
    echo "조치:"
    echo "  1) 해당 값을 소스에서 제거하고 환경변수 / Apps Script Properties 로 분리."
    echo "  2) 오탐이면(예: 예시 키) 라인을 수정하거나, 정말 안전하면 이 커밋만 사람이 직접 실행."
    echo "  3) 내부 명칭이면 익명화 후 재커밋."
  } >&2
  # 관측 로그
  echo "[$(date '+%F %T')] BLOCK secrets in commit" >> "$PROJ/.claude/harness.log" 2>/dev/null
  exit 2
fi

exit 0
