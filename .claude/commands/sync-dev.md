회사 소스 프로젝트의 최신 개발 내용을 익명화해 포트폴리오 콘텐츠(blogData/codeData)에 반영합니다.

트리거: 사용자가 "개발내용 최신화", "소스 업데이트", "하네스에서 업데이트", "/sync-dev" 라고 하면 이 절차를 따른다.
원칙: **초안 제안 후 승인** — 사용자 승인 없이 blogData.js/codeData.js 를 수정하지 않는다. 실제 내부 명칭은 절대 포트폴리오에 노출하지 않는다.

## 0. 사전 점검
- `.claude/sync/anonymize-map.tsv` 와 `.claude/sync/source.txt` 존재 확인. 없으면 각각 `*.example.*` 을 복사해 채우라고 안내 후 중단(익명화·소스경로 없이 진행 금지).

## 1. 수집
- `bash .claude/sync/collect-source.sh` 실행.
- 출력에 `CURSOR_UPTODATE` 가 있으면 "이미 최신입니다" 보고 후 종료.
- 신규 커밋/성과단위/변경영역, 그리고 참고 문서 목록을 파악한다. 서사가 빈약하면 collect-source 가 가리킨 소스 문서(docs/*, README, CLAUDE.md)를 Read 로 더 읽는다. (소스 파일은 읽기만, 포트폴리오로 복사 금지.)

## 2. 선별 & 서사화
- 신규 활동에서 **포트폴리오에 보일 만한 성과**만 고른다(릴리즈/기능/개선/자동화). 사소한 설정·버그수정은 제외.
- 각 성과를 "문제 → 해결 → 인사이트" 또는 "아키텍처" 관점으로 재구성한다. 기존 blogData/codeData 의 톤·구조(필드: blog=problem/solution/insight/arch, code=label/lang/desc/code)에 맞춘다.

## 3. 익명화 (필수)
- 초안 텍스트를 `bash .claude/sync/anonymize.sh` 에 통과시켜 매핑을 적용한다(파이프).
- 이후 `bash .claude/sync/check-anon.sh` 로 초안을 검사한다(임시파일에 쓰고 인자로 전달하거나 stdin). exit 2 면 남은 실제 명칭을 모두 치환/매핑 추가 후 재검사. **통과(exit 0)할 때까지 4단계로 넘어가지 않는다.**
- 매핑에 없는 새 내부 명칭을 발견하면 사용자에게 "anonymize-map.tsv 에 `실제명칭<TAB>표기` 추가할까요?" 제안.

## 4. 초안 제안 (승인 대기)
- 반영 대상 분배: 성과 서사 → `src/data/blogData.js` 카드, 기술 아키텍처 → `src/data/codeData.js` 팝업.
- 추가/수정할 엔트리의 **완성된 익명화 초안**을 보여주고, 어느 파일 어디에 들어갈지 명시한다.
- "이대로 반영할까요?" 로 승인을 받는다. 승인 전 파일 수정 금지.

## 5. 반영 & 검증
- 승인되면 blogData.js/codeData.js 에 엔트리를 추가(Edit/Write).
- 반영 직후 `bash .claude/sync/check-anon.sh src/data/blogData.js src/data/codeData.js` 재검사(exit 0 확인).
- 가능하면 빌드/렌더 확인(`/run` 또는 npm build)으로 깨짐 없는지 점검.

## 6. 커서 갱신 & 커밋
- `.claude/sync/source-cursor.json` 의 `last_synced_sha`/`last_synced_version`/`last_synced_date`(오늘) 를 collect-source 의 NEXT_SHA/NEXT_VERSION 으로 갱신.
- 커밋 제안: `[콘텐츠] 개발내용 최신화 — <요약> (소스 v<버전> 반영)`. (check-commit-tag + check-secrets 가 자동 검증.)
- main 머지 시 배포되므로, 푸시/배포 여부는 사용자에게 확인.
