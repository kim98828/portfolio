# Sync Backlog — 수집 성과 커버리지 추적

`/sync-dev` 가 매 실행 시 갱신하는 대장(ledger). 방대한 소스에서 **무엇이 이미
포트폴리오에 들어갔고, 무엇이 아직 안 들어갔는지**를 남긴다. 실명·내부명칭 금지
(이 파일은 커밋됨 → check-anon 대상). 성과 요약은 익명 표기로만.

**상태 값**
- `carded`  — 카드/팝업으로 반영됨 (오른쪽에 id 기록)
- `covered` — 기존 카드가 이미 커버 (중복 방지, id 기록)
- `deferred`— 포트폴리오감이나 아직 미반영 (다음 sync 후보)
- `skip`    — 사소/비노출 (릴리즈 bump·설정·잔재정리 등)

| 소스 버전 | 성과 (익명 요약) | 상태 | 카드 id / 사유 |
|---|---|---|---|
| v1.29–1.38 | 표시명(한글) ↔ 폴더 코드(영문) 아이덴티티 분리 | carded | `asset-identity-split` |
| v1.29–1.38 | 내부 작업목록 ↔ 팀 보드 양방향(pull+push) 동기화 | carded | `tasks-board-sync` |
| v1.29–1.38 | 요청 즉시 배정 <1분 · 미러 이중구현 드리프트 훅 | carded | codeData `n8n` [5] |
| v1.29–1.38 | 요청·작업·컨펌·리테이크 무인 라이프사이클 | covered | `asset-lifecycle` |
| v1.29–1.38 | 로직 정본 1곳 · 멀티 런타임 DRY 배포 | covered | `automation-dry-deploy` |
| v1.29–1.38 | 저장소 직독 리컨사일(카탈로그 대조) | covered | `engine-reconcile` |
| v1.29–1.38 | 하드웨어 컨트롤러 OSC 회전(원샷 + 연속 스핀) 액션 | deferred | 방송/브로드캐스트 카드 후보 |
| v1.29–1.38 | 모캡 리타겟 신규 워크스테이션 스트리밍 안정화 | deferred | 모션캡처 카드 후보 |
| v1.29–1.38 | 페이셜 캡처 OSC → 원격 트리거 브리지 | deferred | 모션캡처 카드 후보 |
| v1.29–1.38 | 협업 DB 카탈로그 스키마 자가치유(요청 URL 오류 해소) | deferred | 파이프라인 회복탄력성 카드 후보 |
| v1.29–1.38 | 트러블슈팅 기록 자동화 · 주간보고 이월 추적 | deferred | 운영 자동화 카드 후보 |
| v1.29–1.38 | 릴리즈 bump · 네이밍 서픽스 예외 · 재시도 가드 | skip | 사소/비노출 |

## 포괄 스캔 (2026-07-30) — 역량 저장소(비공개) 유래 노출 후보

전체 소스(엔진·프로젝트·툴·docs)를 훑어 `capabilities/`(비공개)에 수집한 craft 중
포트폴리오 카드로 승격할 만한 후보. 승격 시 익명화 게이트 필수.

| 영역 | 노출 후보 (익명 요약) | 상태 | 비고 |
|---|---|---|---|
| 렌더링 | 셀 포스트프로세스의 Intrinsic Image Decomposition 크로마(추가 버퍼 없이 지배광 자동 가중) | deferred | 렌더링 심화 카드 |
| 렌더링 | HDR-boost 핀 hijack + deband dither / mesh-pass 철거 후일담 | deferred | 렌더링 심화 |
| 엔진인프라 | 메이저 버전 업그레이드 패치 재적용 97%(clean base+intent+의존순 3-way) | deferred | DevOps 강력 후보 |
| 방송 | idle ViewState VRAM 스톨 후일담(보존↔해제 트레이드오프) | deferred | 방송 심화 |
| 방송 | 방송준비 프리플라이트 Skipped 상태(루트원인 하나) / 30캠→1 NDI 모자이크 | deferred | 방송 |
| 카메라 | LiveLink 폰 가상 카메라(런타임 픽스) / Dolly=컴포넌트+전환재사용 | deferred | 신규/심화 |
| 오디오 | 사운드 스펙트럼 → 비주얼(오디오스레드↔게임스레드 락-스냅샷, 로그 밴드) | deferred | **신규 영역**(카드 없음) |
| 툴 | 애니 얼굴그림자 SDF 아티스트 오써링 / DCC 뷰포트-엔진 룩 정합 | deferred | Tool 신규 |
| 툴 | 모캡 리타겟 자동화 스트리밍 정착 안정화(신 워크스테이션) | deferred | (기존 mocap deferred 심화) |
| 아키텍처 | 로스터 SSOT 4계층 권위 분리(클라 대칭 버그) / 값-지속(포인터 금지) | deferred | 심화 |
| 웹 | stateless JWT+강제로그아웃 / 멱등-게이트 재시도(POST 중복방지) | deferred | 웹 심화 |
| 캐릭터 | 밑창높이→IK 주입 체인(신발 스왑 안전) / 머티리얼 이름-타게팅 | deferred | 심화 |
