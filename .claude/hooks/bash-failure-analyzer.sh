#!/bin/bash
# PostToolUseFailure hook: Bash 실패 시 stderr 를 알려진 패턴과 대조해 수정법을 주입한다.
# stdin: JSON { tool_name, tool_input: { command }, tool_output: { stdout, stderr } }

# Windows Store python3 stub 회피
python3 -c '' >/dev/null 2>&1 || python3() { command python "$@"; }

INPUT=$(cat)
eval $(echo "$INPUT" | python3 -c "
import sys,json
d=json.load(sys.stdin)
ti=d.get('tool_input',{})
to=d.get('tool_output',{})
cmd=ti.get('command','').replace(\"'\",\"'\\\\''\")
err=to.get('stderr','').replace(\"'\",\"'\\\\''\")
out=to.get('stdout','').replace(\"'\",\"'\\\\''\")
print(f\"COMMAND='{cmd}'\")
print(f\"STDERR='{err}'\")
print(f\"STDOUT='{out}'\")
" 2>/dev/null)
ERROR="$STDERR $STDOUT"

[ -z "$COMMAND" ] && [ -z "$ERROR" ] && exit 0

MATCHED=0

# ── 패턴 1: Windows 명령을 bash 에서 실행 ──
if echo "$ERROR" | grep -qi "command not found"; then
  CMD_NAME=$(echo "$ERROR" | grep -oiE "command not found: [a-z]+|[a-z]+: command not found" | grep -oiE "dir|type|findstr|del|rmdir|cls|copy|move|nul" | head -1)
  if [ -n "$CMD_NAME" ]; then
    echo "[Harness] 실패 패턴: Windows 명령 '$CMD_NAME' 을 bash 에서 실행"
    echo "수정: 셸은 bash 입니다. Unix 명령을 쓰세요."
    echo "  dir→ls | type→cat | findstr→grep | del→rm | rmdir→rm -rf | copy→cp | move→mv | nul→/dev/null"
    MATCHED=1
  fi
fi

# ── 패턴 2: git push 거부 (non-fast-forward) ──
if echo "$ERROR" | grep -qE "rejected|non-fast-forward|fetch first"; then
  echo "[Harness] 실패 패턴: git push 거부 (원격이 앞서 있음)"
  echo "수정: git pull --rebase origin main 후 다시 push. 강제 push(--force)는 신중히."
  MATCHED=1
fi

# ── 패턴 3: pathspec / 파일 경로 불일치 ──
if echo "$ERROR" | grep -qE "pathspec.*did not match|No such file or directory"; then
  echo "[Harness] 실패 패턴: 경로 불일치"
  echo "수정: 작업 디렉토리 확인(pwd). git 은 git -C <dir> 로 경로 고정. 한글 파일명은 따옴표로 감쌀 것."
  MATCHED=1
fi

# ── 패턴 4: cp949 / 인코딩 에러 ──
if echo "$ERROR" | grep -qE "cp949|UnicodeEncodeError|UnicodeDecodeError"; then
  echo "[Harness] 실패 패턴: 인코딩 에러 (Windows cp949)"
  echo "수정: Python 에 sys.stdout.reconfigure(encoding='utf-8') 추가, 또는 PYTHONIOENCODING=utf-8 환경변수."
  MATCHED=1
fi

# ── 패턴 5: nothing to commit ──
if echo "$ERROR$STDOUT" | grep -q "nothing to commit"; then
  echo "[Harness] 실패 패턴: 커밋할 변경 없음"
  echo "수정: git status 로 확인. 스테이징 누락이면 git add <file> 먼저."
  MATCHED=1
fi

# ── 패턴 6: gh / 인증 ──
if echo "$ERROR" | grep -qiE "gh auth|authentication|not logged|HTTP 401|HTTP 403"; then
  echo "[Harness] 실패 패턴: GitHub 인증/권한 문제"
  echo "수정: gh auth status 확인. 로그인 필요 시 사용자에게 '! gh auth login' 안내."
  MATCHED=1
fi

# ── 미매칭: 새 anti-pattern 후보 제안 + 누적 ──
if [ "$MATCHED" -eq 0 ] && [ -n "$STDERR" ]; then
  if [ ${#STDERR} -gt 50 ]; then
    echo "[Harness] 미확인 Bash 실패 — 새 anti-pattern 후보?"
    echo "  명령: $COMMAND"
    echo "  에러: $(echo "$STDERR" | head -3)"
    echo "  → 반복 발생 시 workflow.md 에 feedback 축적을 제안하세요."
    # 누적: 7번째 패턴 후보를 나중에 찾을 수 있도록 미매칭 실패를 한 줄로 기록
    UNMATCHED="$CLAUDE_PROJECT_DIR/.claude/harness-unmatched.log"
    {
      echo "[$(date '+%F %T')] cmd=$(echo "$COMMAND" | head -1 | cut -c1-120)"
      echo "    err=$(echo "$STDERR" | head -1 | cut -c1-160)"
    } >> "$UNMATCHED" 2>/dev/null
  fi
fi

exit 0
