#!/bin/bash
# 작성 직전 게이트: 인자로 받은 파일(들) 또는 stdin 에서 '아직 익명화되지 않은 실제 명칭'을 찾는다.
# 검사 대상: anonymize-map.tsv 의 왼쪽(실제명칭) + secrets-blocklist.txt 리터럴.
# 발견 시 exit 2 (어디에 남았는지 보고). 깨끗하면 exit 0.
#
# 매칭은 Python(UTF-8) 으로 수행 — git-bash 의 grep -i 는 한글에서 죽음 (memory: gitbash-grep-i-korean-abort).
#
# 사용: bash .claude/sync/check-anon.sh src/data/blogData.js src/data/codeData.js
#   또는: cat draft.txt | bash .claude/sync/check-anon.sh

PROJ="${CLAUDE_PROJECT_DIR:-.}"
if python3 -c '' >/dev/null 2>&1; then PB=python3; else PB=python; fi

if [ "$#" -gt 0 ]; then
  CONTENT=$(cat "$@" 2>/dev/null); SRC="$*"
else
  CONTENT=$(cat); SRC="(stdin)"
fi

OUT=$(CONTENT_TEXT="$CONTENT" SRC="$SRC" \
  MAP_FILE="$PROJ/.claude/sync/anonymize-map.tsv" BLOCK_FILE="$PROJ/.claude/secrets-blocklist.txt" \
  PYTHONIOENCODING=utf-8 "$PB" -c '
import os, sys
sys.stdout.reconfigure(encoding="utf-8")
content = os.environ.get("CONTENT_TEXT", "")

def load(path, tab_split):
    out = []
    if path and os.path.isfile(path):
        with open(path, encoding="utf-8", errors="replace") as f:
            for ln in f:
                ln = ln.rstrip("\n").rstrip("\r"); s = ln.strip()
                if not s or s.startswith("#"): continue
                if tab_split:
                    if "\t" not in ln: continue
                    t = ln.split("\t",1)[0].strip()
                else:
                    t = ln
                if t: out.append(t)
    return out

terms = load(os.environ.get("MAP_FILE"), True) + load(os.environ.get("BLOCK_FILE"), False)
if not terms:
    print("WARN"); raise SystemExit

low = content.lower()
lines = content.splitlines()
hits = []
for t in terms:
    if t.lower() in low:
        ex = next((f"      {i+1}: {l.strip()[:140]}" for i,l in enumerate(lines) if t.lower() in l.lower()), "")
        hits.append(f"  · 미익명화 {t!r}:\n{ex}")
if hits:
    print("HIT")
    print("\n".join(hits))
')

case "$OUT" in
  WARN*)
    echo "[check-anon] 경고: anonymize-map.tsv / secrets-blocklist.txt 가 비어 검사 항목 없음." >&2
    exit 0 ;;
  HIT*)
    {
      echo "[check-anon — 차단] $SRC 에 실제 내부 명칭이 남아 있습니다."
      echo "${OUT#HIT}"
      echo ""
      echo "조치: anonymize.sh 로 치환하거나 직접 포트폴리오 표기로 바꾼 뒤 다시 검사하세요."
    } >&2
    exit 2 ;;
  *)
    echo "[check-anon] OK — 미익명화 명칭 없음 ($SRC)"
    exit 0 ;;
esac
