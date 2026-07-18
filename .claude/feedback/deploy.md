# Deploy Feedback — Pages / Actions / Apps Script

GitHub Pages, GitHub Actions 워크플로우, Google Apps Script 백엔드, 도메인 관련 검증된 학습.

엔트리 형식은 [README](./README.md) 참조. 새 엔트리는 아래 `---` 다음에 추가.

---

### GitHub Actions 액션 버전을 Node 런타임에 맞춰 갱신 — confidence: 2/5, validated: 2026-06-14

**Context**: GitHub Actions 의 Node.js 24 전환으로 구버전 액션이 실패 (커밋 fb96e23).
**Pattern**: 러너 Node 메이저 버전이 오르면 actions/checkout, setup-node 등 모든 액션 버전을 함께 올린다. 워크플로우 수정 시 `/ci-workflow` 스킬 참조.
**Anti-pattern**: 한 액션만 올리고 나머지를 방치 → deprecated 런타임 경고/실패.
**Why**: 액션은 특정 Node 런타임에 핀되어 있어 러너 업그레이드와 함께 갱신이 필요하다.
**Author**: kim98828

---

### 백엔드 비밀키를 커밋에 포함하지 말 것 — confidence: 3/5, validated: 2026-06-14

**Context**: backend.gs(Google Apps Script) 및 토큰류는 공개 저장소(GitHub Pages)에 노출됨.
**Pattern**: 커밋 전 git diff 로 backend.gs / 토큰 / 키 노출 여부를 확인한다. 비밀값은 Apps Script Properties 또는 환경변수로 분리.
**Anti-pattern**: API 키/토큰을 소스에 하드코딩한 채 push.
**Why**: 저장소가 공개이고 Pages 로 배포되므로 모든 커밋 내용이 영구 노출된다.
**Author**: kim98828

---
