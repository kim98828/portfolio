#!/bin/bash
# UserPromptSubmit hook: 사용자 프롬프트에서 교정/확인 키워드를 감지해
# 피드백 축적 지시 텍스트를 주입한다.
# stdin: JSON { user_prompt: "..." }

# Windows Store python3 stub 회피
python3 -c '' >/dev/null 2>&1 || python3() { command python "$@"; }

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user_prompt',''))" 2>/dev/null)

[ -z "$PROMPT" ] && exit 0

# 500자 이상이면 새 작업 지시일 가능성 높음 → 스킵
PROMPT_LEN=${#PROMPT}
[ "$PROMPT_LEN" -gt 500 ] && exit 0

# 백틱(`) 안의 내용은 코드이므로 제거 후 검사
CLEAN_PROMPT=$(echo "$PROMPT" | sed 's/`[^`]*`//g')

# ── 부정 교정 키워드 ──
NEGATIVE_PATTERNS="하지마|안돼|안 돼|그게 아니라|다시 해|잘못|틀렸|그렇게 말고|아까 말한|똑바로|제대로|왜 그렇게|원복"
if echo "$CLEAN_PROMPT" | grep -qE "$NEGATIVE_PATTERNS"; then
  echo "[$(date '+%F %T')] correction detected (negative)" >> "$CLAUDE_PROJECT_DIR/.claude/harness.log" 2>/dev/null
  cat <<'INJECT'
[Harness — 필수] 사용자 교정 감지됨.
⛔ 이 지시를 무시하면 안 됩니다. 현재 응답에 반드시 포함하세요.

1. 먼저 사용자의 교정에 대응 (수정/원복 등).
2. 대응 직후, 같은 응답 안에서 feedback 추가를 제안:
   "feedback에 추가할까요?" + 엔트리 초안 제시.

엔트리 형식 (모든 필드 필수):
### [주제] — confidence: 1/5, validated: YYYY-MM-DD
**Context**: 어떤 상황에서 발생
**Pattern**: 올바른 접근법
**Anti-pattern**: 잘못된 접근법
**Why**: 근본 원인
**Author**: (git username)

카테고리: HTML/CSS/JS/모듈 → web.md | 배포/Pages/Apps Script → deploy.md | 프로세스/커밋/워크플로우 → workflow.md
기존 엔트리에 이미 있으면 confidence +1, validated 날짜 갱신을 제안.
INJECT
  exit 0
fi

# ── 긍정 확인 키워드 ──
POSITIVE_PATTERNS="맞아|좋아|그래 그거야|정확해|그게 맞|잘했|완벽"
if echo "$CLEAN_PROMPT" | grep -qE "$POSITIVE_PATTERNS"; then
  # 50→200자로 상향: "맞아, 그리고 X도..." 같은 긴 확인도 포착 (긴 새 작업지시는 위 500자 컷에서 이미 제외됨)
  if [ "$PROMPT_LEN" -lt 200 ]; then
    echo "[$(date '+%F %T')] confirmation detected (positive)" >> "$CLAUDE_PROJECT_DIR/.claude/harness.log" 2>/dev/null
    cat <<'INJECT'
[Harness] 사용자 확인 감지됨 (긍정).
지시: 방금 확인된 접근법이 비자명한(non-obvious) 패턴이라면 해당 카테고리 feedback 파일(web/deploy/workflow.md)에 validated pattern 엔트리를 제안하세요.
자명한 일반 코딩은 제안하지 마세요.
기존 엔트리가 있으면 confidence +1, validated 날짜 갱신만 제안.
"feedback에 추가할까요?" 물어보세요.
INJECT
    exit 0
  fi
fi

exit 0
