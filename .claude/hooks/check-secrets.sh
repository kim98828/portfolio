#!/bin/bash
# PreToolUse hook (Bash): git commit 직전, 스테이징된 변경에서 비밀키 / 금칙어를 탐지해 차단한다.
# Exit codes: 0 = allow, 2 = block (stderr 가 Claude 에 표시됨)
#
# 자체완결형. 검증 출처: feedback/deploy.md "백엔드 비밀키를 커밋에 포함하지 말 것" (3/5),
# memory "포트폴리오는 실제 내부 시스템 명칭 노출 금지".
#
# 매칭은 전부 Python(UTF-8, re.IGNORECASE)으로 수행한다 — git-bash 의 `grep -i` 는
# 한글 멀티바이트 줄에서 SIGABRT 로 죽어 비밀키를 silent miss 하기 때문. (memory: gitbash-grep-i-korean-abort)
#
# 동작:
#   1) git commit 명령일 때만 작동 (그 외 SKIP).
#   2) `git diff --cached` 추가라인 + secrets-blocklist.txt + sync/anonymize-map.tsv(왼쪽) 를
#      Python 으로 스캔. 적중 시 exit 2.

INPUT=$(cat)

if python3 -c '' >/dev/null 2>&1; then
    PYBIN=python3
elif python -c '' >/dev/null 2>&1; then
    PYBIN=python
else
    echo "[Harness] 경고: Python 인터프리터 없음 — 비밀키 검증 건너뜀" >&2
    exit 0
fi

# 커밋 명령 판별
IS_COMMIT=$(CLAUDE_HOOK_INPUT="$INPUT" PYTHONIOENCODING=utf-8 "$PYBIN" -c '
import os, json
try:
    d = json.loads(os.environ.get("CLAUDE_HOOK_INPUT", "{}"))
    cmd = d.get("tool_input", {}).get("command", "")
except Exception:
    print("NO"); raise SystemExit
print("YES" if "git commit" in cmd else "NO")
')
[ "$IS_COMMIT" != "YES" ] && exit 0

PROJ="${CLAUDE_PROJECT_DIR:-.}"

# 스테이징된 '추가 라인'만 추출 (grep -F, no -i → 한글 안전)
ADDED=$(git -C "$PROJ" diff --cached --no-color 2>/dev/null | grep -E '^\+' | grep -vE '^\+\+\+')
[ -z "$ADDED" ] && exit 0

# 스캔은 heredoc 으로 전달한다 — 정규식에 따옴표(' ")가 있어 bash -c 래퍼가 깨지므로.
# 데이터는 환경변수로 전달(stdin 불필요).
REPORT=$(ADDED_TEXT="$ADDED" BLOCK_FILE="$PROJ/.claude/secrets-blocklist.txt" MAP_FILE="$PROJ/.claude/sync/anonymize-map.tsv" \
  PYTHONIOENCODING=utf-8 "$PYBIN" <<'PYEOF'
import os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
added = os.environ.get("ADDED_TEXT", "")

# 비밀키 정규식 (토큰은 케이스 고정 — IGNORECASE 불필요)
patterns = [
    (r"ntn_[A-Za-z0-9]{20,}",                      "Notion 토큰 (ntn_)"),
    (r"(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}",  "GitHub 토큰 (ghp_ 등)"),
    (r"github_pat_[A-Za-z0-9_]{20,}",              "GitHub fine-grained PAT"),
    (r"AKIA[0-9A-Z]{16}",                          "AWS Access Key (AKIA)"),
    (r"AIza[0-9A-Za-z_-]{30,}",                    "Google API 키 (AIza)"),
    (r"sk-[A-Za-z0-9]{20,}",                       "OpenAI/유사 비밀키 (sk-)"),
    (r"xox[baprs]-[A-Za-z0-9-]{10,}",              "Slack 토큰 (xox.-)"),
    (r"-----BEGIN[A-Z ]*PRIVATE KEY",              "개인키(PEM) 블록"),
    (r"""(?i)(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret)["' ]*[:=]["' ]*[A-Za-z0-9_./+-]{16,}""",
                                                   "키=값 형태의 하드코딩된 비밀값"),
]
hits = []
for rx, name in patterns:
    m = re.search(rx, added)
    if m:
        line = next((l for l in added.splitlines() if m.group(0)[:12] in l), m.group(0))
        hits.append(f"  · {name}\n      {line.strip()[:140]}")

def load_terms(path, tab_split):
    out = []
    if path and os.path.isfile(path):
        with open(path, encoding="utf-8", errors="replace") as f:
            for ln in f:
                ln = ln.rstrip("\n").rstrip("\r")
                s = ln.strip()
                if not s or s.startswith("#"):
                    continue
                if tab_split:
                    if "\t" not in ln:
                        continue
                    t = ln.split("\t", 1)[0].strip()
                else:
                    t = ln
                if t:
                    out.append(t)
    return out

terms = [(t, "secrets-blocklist.txt") for t in load_terms(os.environ.get("BLOCK_FILE"), False)]
terms += [(t, "anonymize-map.tsv")     for t in load_terms(os.environ.get("MAP_FILE"),   True)]
low = added.lower()
for t, src in terms:
    if t.lower() in low:
        hits.append(f"  · 금칙어/미익명화 노출: {t!r} ({src})")

if hits:
    print("\n".join(hits))
PYEOF
)

if [ -n "$REPORT" ]; then
  {
    echo "[Harness — 차단] 스테이징된 변경에 비밀값/금칙어로 의심되는 내용이 있습니다."
    echo "$REPORT"
    echo ""
    echo "조치:"
    echo "  1) 해당 값을 소스에서 제거하고 환경변수 / Apps Script Properties 로 분리."
    echo "  2) 내부 명칭이면 익명화(anonymize-map.tsv) 후 재커밋."
    echo "  3) 오탐이면 라인 수정, 정말 안전하면 이 커밋만 사람이 직접 실행."
  } >&2
  echo "[$(date '+%F %T')] BLOCK secrets/terms in commit" >> "$PROJ/.claude/harness.log" 2>/dev/null
  exit 2
fi

exit 0
