#!/bin/bash
# 읽기 전용 커버리지 스냅샷 — 동기화 상태를 한눈에.
#   ① 동기화 커서(마지막 반영 지점)
#   ② 카테고리별 카드 수 (blogData + blogCategories 단일 소스 그대로 집계)
#   ③ backlog 의 미해소(deferred) 항목 = "포트폴리오감이나 아직 안 들어간 것"
# 사용: bash .claude/sync/coverage-report.sh

PROJ="${CLAUDE_PROJECT_DIR:-.}"
cd "$PROJ" || { echo "프로젝트 경로 없음"; exit 1; }

echo "═══════════════════════════════════════"
echo " Sync Coverage Report"
echo "═══════════════════════════════════════"

echo ""
echo "── ① 동기화 커서 ──"
grep -E 'last_synced' .claude/sync/source-cursor.json 2>/dev/null | sed 's/^/  /' || echo "  (커서 파일 없음)"

echo ""
echo "── ② 카테고리별 카드 수 ──"
node --input-type=module -e "
import { blogData, blogCategories } from './src/data/blogData.js';
const map = new Map();
blogCategories.forEach(c => c.tags.forEach(t => map.set(t, c.id)));
const cnt = new Map(blogCategories.map(c => [c.id, 0]));
let misc = 0;
for (const card of blogData) {
  const id = map.get(card.tag);
  if (id) cnt.set(id, cnt.get(id) + 1); else misc++;
}
for (const c of blogCategories) console.log('  ' + c.name + ': ' + cnt.get(c.id));
if (misc) console.log('  ⚠ 기타(미분류 태그): ' + misc);
console.log('  ─────────────');
console.log('  총 카드: ' + blogData.length);
" 2>/dev/null || echo "  (node 집계 실패 — Node 18+ 필요)"

echo ""
echo "── ③ Backlog: 미반영 보류(deferred) ──"
DEFERRED=$(grep -E '\| *deferred *\|' .claude/sync/backlog.md 2>/dev/null)
if [ -n "$DEFERRED" ]; then
  echo "$DEFERRED" | sed 's/^/  /'
else
  echo "  (보류 항목 없음 — 모두 반영/커버됨)"
fi

echo ""
echo "→ 새 카드로 승격할 deferred 항목이 있으면 /sync-dev 서사화 단계에서 다룬다."
