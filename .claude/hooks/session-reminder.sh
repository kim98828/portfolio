#!/bin/bash
# SessionStart hook: 매 세션 시작 / 컨텍스트 압축 / 세션 복원 시
# 핵심 규칙 + 동적 피드백(고신뢰)을 주입한다.
# matcher: startup|compact|resume

# Windows Store python3 stub 회피
python3 -c '' >/dev/null 2>&1 || python3() { command python "$@"; }

cat <<'STATIC'
포트폴리오 프로젝트 규칙 리마인더:
1. 정적 웹사이트(HTML/CSS/JS) + GitHub Pages 자동 배포. main 푸시 = 배포.
2. 커밋 메시지: 한국어 태그 필수 ([기능][수정][문서][스타일][리팩터][콘텐츠][구조][긴급]) — PreToolUse 훅이 차단함.
3. 셸은 bash (Unix 구문: ls/cat/grep/rm). Windows CMD 구문(dir/type/findstr) 금지.
4. 민감 정보: backend.gs / Apps Script 키 / 토큰을 커밋에 포함하지 말 것.
5. 모듈 진입점은 modules/main.js. lock-screen 참조 등 죽은 코드 재유입 주의.
6. 콘텐츠 데이터는 blogData.js / codeData.js. 도메인 필터 로직은 modules/ui.js.
7. 피드백 자동 축적 (컨텍스트 압축 후에도 유지):
   - 사용자 교정("하지마","안돼","그게 아니라") → anti-pattern 엔트리 즉시 제안.
   - 사용자 확인("맞아","좋아","정확해") → validated pattern 엔트리 제안.
   - 응답 중지 후 재프롬프트 → 가장 강한 교정 신호로 처리.
   - 동일 실수 반복 → confidence +1. 5/5 도달 → /promote 로 CLAUDE.md 승격 제안.
   - 발생 즉시 제안. 대화 끝에 몰아서 확인 금지.
STATIC

# feedback/*.md 의 confidence 점수를 파싱해 고신뢰/승격대기/최근 엔트리를 주입
FEEDBACK_DIR="$CLAUDE_PROJECT_DIR/.claude/feedback" PYTHONIOENCODING=utf-8 python3 <<'PYEOF' 2>/dev/null
import os, re, glob, datetime

root = os.environ.get("FEEDBACK_DIR", "")
if not root or not os.path.isdir(root):
    raise SystemExit

header_re = re.compile(
    r"^###\s+(.+?)\s+—\s+confidence:\s*(\d+)/5,\s*validated:\s*(\d{4}-\d{2}-\d{2})\s*$",
    re.M,
)

entries = []
for fp in sorted(glob.glob(os.path.join(root, "*.md"))):
    try:
        with open(fp, encoding="utf-8") as f:
            text = f.read()
    except Exception:
        continue
    for block in re.split(r"(?<=\n)---\n", text):
        m = header_re.search(block)
        if not m:
            continue
        entries.append({
            "title": m.group(1).strip(),
            "conf": int(m.group(2)),
            "date": m.group(3),
            "body": block,
            "file": os.path.basename(fp),
        })

def promoted(body): return "반영됨" in body

high = [e for e in entries if e["conf"] >= 3 and not promoted(e["body"])]
high.sort(key=lambda e: (-e["conf"], e["date"]))
if high:
    print()
    print("고신뢰 피드백 (3/5+) — 이번 세션에서 반드시 적용:")
    for e in high[:10]:
        print(f"  {e['title']} — {e['conf']}/5 ({e['date']}, {e['file']})")

pending = [e for e in entries if e["conf"] == 5 and not promoted(e["body"])]
if pending:
    print()
    print("승격 대기 (5/5 도달, CLAUDE.md 미반영) — /promote 대상:")
    for e in pending[:5]:
        print(f"  {e['title']} ({e['file']})")

cutoff = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
recent = [e for e in entries if e["date"] >= cutoff]
recent.sort(key=lambda e: e["date"], reverse=True)
if recent:
    print()
    print("최근 7일 추가된 피드백:")
    for e in recent[:5]:
        print(f"  [{e['date']}] {e['title']} — {e['conf']}/5 ({e['file']})")
PYEOF

exit 0
