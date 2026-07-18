#!/bin/bash
# 소스 저장소(회사 개발 프로젝트)에서 '마지막 동기화 이후'의 개발 활동을 수집해 출력한다.
# 이 출력은 Claude 가 익명화·요약하는 '원자재'이며, 절대 포트폴리오 저장소에 그대로 기록하지 않는다.
#
# 사용: bash .claude/sync/collect-source.sh
# 소스 경로: .claude/sync/source.txt (gitignore됨) 또는 $SOURCE_REPO 환경변수. 둘 다 없으면 에러.
# (소스 경로/명칭은 내부 정보이므로 커밋되는 파일에 하드코딩하지 않는다.)

PROJ="${CLAUDE_PROJECT_DIR:-.}"
SRC_FILE="$PROJ/.claude/sync/source.txt"
SRC=""
if [ -f "$SRC_FILE" ]; then
  SRC=$(grep -vE '^\s*#' "$SRC_FILE" | head -1 | tr -d '\r' | sed 's/[[:space:]]*$//')
fi
SRC="${SRC:-$SOURCE_REPO}"

if [ -z "$SRC" ]; then
  echo "ERROR: 소스 경로가 설정되지 않음."
  echo "  → .claude/sync/source.example.txt 를 source.txt 로 복사해 경로를 적거나 SOURCE_REPO 환경변수를 지정하세요."
  exit 1
fi
if ! git -C "$SRC" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: 소스 저장소를 찾을 수 없음(git 아님): $SRC"
  exit 1
fi

CURSOR="$PROJ/.claude/sync/source-cursor.json"
SHA=""
if [ -f "$CURSOR" ]; then
  if python3 -c '' >/dev/null 2>&1; then PB=python3; else PB=python; fi
  SHA=$(CURSOR_FILE="$CURSOR" "$PB" -c "import os,json;print(json.load(open(os.environ['CURSOR_FILE'],encoding='utf-8')).get('last_synced_sha',''))" 2>/dev/null)
fi

if [ -n "$SHA" ] && git -C "$SRC" cat-file -e "$SHA" 2>/dev/null; then
  RANGE="$SHA..HEAD"; RANGE_DESC="마지막 동기화($SHA) 이후"
else
  RANGE="-40"; RANGE_DESC="최근 40개 커밋 (최초 동기화 또는 커서 없음)"
fi

HEAD_SHA=$(git -C "$SRC" rev-parse HEAD)
VERSION=$(cat "$SRC/VERSION" 2>/dev/null | tr -d '\r\n')

echo "═══════════════════════════════════════════════"
echo " 소스 개발 활동 수집  (범위: $RANGE_DESC)"
echo " 현재 버전: ${VERSION:-?}   HEAD: $HEAD_SHA"
echo "═══════════════════════════════════════════════"

if [ "$RANGE" = "-40" ]; then
  LOG=$(git -C "$SRC" log -40 --pretty='%h %s' 2>/dev/null)
  STAT=$(git -C "$SRC" log -40 --pretty=format: --name-only 2>/dev/null | grep -vE '^$' | sed 's:/.*::' | sort | uniq -c | sort -rn | head -15)
else
  LOG=$(git -C "$SRC" log "$RANGE" --pretty='%h %s' 2>/dev/null)
  STAT=$(git -C "$SRC" diff --stat "$RANGE" 2>/dev/null | tail -20)
fi

if [ -z "$LOG" ]; then
  echo ""; echo "(새 커밋 없음 — 이미 최신 상태입니다.)"; echo "CURSOR_UPTODATE"; exit 0
fi

echo ""; echo "── 신규 커밋 ──"; echo "$LOG"
echo ""; echo "── 성과 단위(기능/릴리즈/개선) ──"
echo "$LOG" | grep -E '\[릴리즈\]|\[기능\]|\[신규\]|\[개선\]|\[자동화\]' || echo "(해당 태그 커밋 없음)"
echo ""; echo "── 변경 영역 ──"; echo "$STAT"
echo ""; echo "── 참고 문서 (요약 시 읽을 후보) ──"
ls "$SRC/docs" 2>/dev/null | sed 's/^/  docs\//'
[ -f "$SRC/README.md" ] && echo "  README.md"
[ -f "$SRC/CLAUDE.md" ] && echo "  CLAUDE.md"
echo ""; echo "── 다음 커서(동기화 완료 시 기록할 값) ──"
echo "NEXT_SHA=$HEAD_SHA"
echo "NEXT_VERSION=${VERSION:-}"
