#!/bin/bash
# PreToolUse hook: 한국어 태그가 없는 git commit 을 차단한다.
# Exit codes: 0 = allow, 2 = block (stderr 가 Claude 에 표시됨)
#
# 자체완결형(self-contained) — 외부 정책 파일에 의존하지 않는다.
# 커밋 컨벤션 출처: .claude/commands/commit.md

INPUT=$(cat)

# Windows 환경: `python3` 가 Microsoft Store stub 일 수 있음 (PATH 상단이면 항상
# exit 49 + 빈 stdout → 훅이 메시지를 빈 것으로 오판). 실제 동작 인터프리터 자동 선택.
if python3 -c '' >/dev/null 2>&1; then
    PYBIN=python3
elif python -c '' >/dev/null 2>&1; then
    PYBIN=python
else
    # Python 이 없으면 검증 건너뛰고 통과 (훅 깨짐으로 작업 차단 안 함)
    echo "[Harness] 경고: Python 인터프리터를 찾을 수 없음 — 커밋 검증 건너뜀" >&2
    exit 0
fi

# JSON 에서 -m 메시지 추출 (shlex 로 따옴표 정확히 처리, cp949 회피)
PARSED=$(CLAUDE_HOOK_INPUT="$INPUT" PYTHONIOENCODING=utf-8 "$PYBIN" <<'PYEOF'
import os, sys, json, shlex
sys.stdout.reconfigure(encoding="utf-8")
try:
    d = json.loads(os.environ.get("CLAUDE_HOOK_INPUT", "{}"))
    cmd = d.get("tool_input", {}).get("command", "")
except Exception:
    print("SKIP\t"); raise SystemExit

if "git commit" not in cmd or "-m" not in cmd:
    print("SKIP\t"); raise SystemExit
if "--amend" in cmd:
    print("SKIP\t"); raise SystemExit

try:
    tokens = shlex.split(cmd, posix=True)
except ValueError:
    print("SKIP\t"); raise SystemExit

msg = ""
for i, tok in enumerate(tokens):
    if tok == "-m" and i + 1 < len(tokens):
        msg = tokens[i + 1]; break
    if tok.startswith("-m") and tok != "-m":
        msg = tok[2:]; break
    if tok.startswith("--message="):
        msg = tok[len("--message="):]; break

# 태그 검증을 Python 안에서 직접 수행해 결과만 반환한다.
import re
first_line = msg.splitlines()[0].strip() if msg else ""
if not first_line:
    print("BLOCK_EMPTY\t"); raise SystemExit

# 허용: 줄 맨 앞의 [태그] (한국어 또는 영문 대문자 등 비어있지 않은 내용)
if re.match(r"^\[[^\]]+\]\s*\S", first_line):
    print("OK\t"); raise SystemExit

print(f"BLOCK_NOTAG\t{first_line}")
PYEOF
)

ACTION="${PARSED%%$'\t'*}"

case "$ACTION" in
  SKIP|OK)
    exit 0
    ;;
  BLOCK_EMPTY)
    cat >&2 <<'EOF'
[Harness — 차단] 커밋 메시지가 비어 있습니다.

필수 형식: [한국어태그] 설명
예시: git commit -m "[수정] 모바일 레이아웃 깨짐 수정"
EOF
    exit 2
    ;;
  BLOCK_NOTAG)
    cat >&2 <<'EOF'
[Harness — 차단] 커밋 메시지 맨 앞에 [태그] 가 없습니다.

필수 형식: [한국어태그] 설명
사용 가능한 태그 (.claude/commands/commit.md):
  [기능]   새 기능 추가
  [수정]   버그 수정
  [문서]   문서 업데이트
  [스타일] CSS/UI 변경
  [리팩터] 구조 개선
  [콘텐츠] 포트폴리오 내용 업데이트
  [구조]   디렉토리/모듈 재구성
  [긴급]   긴급 핫픽스

예시: git commit -m "[콘텐츠] 경력 섹션에 신규 프로젝트 추가"
EOF
    exit 2
    ;;
  *)
    exit 0
    ;;
esac
