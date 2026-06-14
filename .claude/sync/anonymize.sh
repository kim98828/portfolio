#!/bin/bash
# stdin 텍스트에 익명화 매핑(anonymize-map.tsv)을 적용해 stdout 으로 출력한다.
# 매핑: 각 줄 "실제명칭<TAB>포트폴리오표기" (왼쪽=실제, 오른쪽=대체). '#' 주석/빈 줄 무시.
# 대체는 대소문자 무시·리터럴(정규식 아님). 긴 용어부터 적용해 부분일치 오류를 피한다.
#
# 사용: cat draft.txt | bash .claude/sync/anonymize.sh

PROJ="${CLAUDE_PROJECT_DIR:-.}"
MAP="$PROJ/.claude/sync/anonymize-map.tsv"
if python3 -c '' >/dev/null 2>&1; then PB=python3; else PB=python; fi

# 스크립트는 -c 인자로 전달한다 — heredoc 을 쓰면 stdin(=치환할 텍스트)을 가로채므로 금지.
CODE='
import os, sys, re
sys.stdout.reconfigure(encoding="utf-8")
text = sys.stdin.read()
mp = os.environ.get("MAP_FILE", "")
pairs = []
if mp and os.path.isfile(mp):
    with open(mp, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n").rstrip("\r")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if "\t" not in line:
                continue
            real, port = line.split("\t", 1)
            real, port = real.strip(), port.strip()
            if real:
                pairs.append((real, port))
pairs.sort(key=lambda p: len(p[0]), reverse=True)
for real, port in pairs:
    text = re.sub(re.escape(real), port, text, flags=re.IGNORECASE)
sys.stdout.write(text)
'
MAP_FILE="$MAP" PYTHONIOENCODING=utf-8 "$PB" -c "$CODE"
