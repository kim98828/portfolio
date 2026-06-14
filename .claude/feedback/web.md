# Web Feedback — HTML / CSS / JS / 모듈

HTML/CSS/JS, modules/ 디렉토리, 렌더러, UI 관련 검증된 학습.

엔트리 형식은 [README](./README.md) 참조. 새 엔트리는 아래 `---` 다음에 추가.

---

### 모듈 진입점에서 죽은 코드 참조 금지 — confidence: 2/5, validated: 2026-06-14

**Context**: modules/main.js 가 제거된 lock-screen 을 계속 import 해서 JS 전체가 죽음 (커밋 ff5d285).
**Pattern**: 모듈/기능을 제거하면 진입점(main.js)과 모든 import 체인에서 참조를 동시에 제거한다. 제거 후 브라우저 콘솔에서 에러 0 확인.
**Anti-pattern**: 파일만 지우고 import 구문을 남겨둠 → 첫 import 실패로 이후 전체 스크립트 중단.
**Why**: ES 모듈은 import 해석 실패 시 모듈 전체 실행이 중단된다.
**Author**: kim98828

---
