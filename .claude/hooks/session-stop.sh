#!/bin/bash
# Stop hook: Claude 가 한 턴 응답을 마칠 때 작동한다.
# 역할: (1) 관측 로그 1줄 기록, (2) 미커밋/미푸시 변경 알림.
#
# 주의: exit 2 는 "정지를 막고 계속 진행"을 의미하므로 절대 사용하지 않는다.
#       알림은 exit 0 + stdout 으로만 노출한다(트랜스크립트 표시, 작업 차단 없음).

INPUT=$(cat)   # Stop 이벤트 JSON (사용하지 않아도 stdin 은 비워준다)

PROJ="${CLAUDE_PROJECT_DIR:-.}"
LOG="$PROJ/.claude/harness.log"

# 무한 루프 방지: Stop 훅이 이미 한 번 작동해 재진입된 경우 조용히 종료
echo "$INPUT" | grep -q '"stop_hook_active":[[:space:]]*true' && exit 0

# ── 관측 로그 ──
DIRTY_COUNT=$(git -C "$PROJ" status --porcelain 2>/dev/null | grep -c .)
echo "[$(date '+%F %T')] stop turn — dirty=$DIRTY_COUNT" >> "$LOG" 2>/dev/null

# ── 미커밋 변경 알림 ──
if [ "${DIRTY_COUNT:-0}" -gt 0 ]; then
  echo "[Harness] 커밋되지 않은 변경 ${DIRTY_COUNT}건이 있습니다. 작업이 끝났다면 /commit (한국어 [태그] 필수)."
fi

# ── 미푸시 커밋 알림 (upstream 이 설정된 경우에만) ──
UPSTREAM=$(git -C "$PROJ" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)
if [ -n "$UPSTREAM" ]; then
  AHEAD=$(git -C "$PROJ" rev-list --count "@{u}..HEAD" 2>/dev/null)
  if [ "${AHEAD:-0}" -gt 0 ]; then
    echo "[Harness] 푸시되지 않은 커밋 ${AHEAD}건 (main 푸시 = 배포). 배포하려면 git push."
  fi
fi

exit 0
