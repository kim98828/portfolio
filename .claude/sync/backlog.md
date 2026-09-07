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

## v1.38.4 → v1.39.1 (2026-09-07 sync)

| 소스 범위 | 성과 (익명 요약) | 상태 | 반영 위치 / 비고 |
|---|---|---|---|
| v1.39.x | 원웨이 스위칭 — 카메라 키는 PVW arm, CUT 키만 송출 · 빈 PVW 컷 거부 | carded | `preview-bus-switching` |
| v1.39.x | 화면 끊기(BLACK)도 PVW 경유 · 로컬 arm 누락으로 컷 거부되던 결함 | carded | `preview-bus-switching` (동일 카드 포함) |
| v1.39.x | 탈리를 소스별 플래그 → 정체(identity) 피드백 + 전역 1회 구독 리페인트 | carded | `preview-bus-switching` · codeData `oscbus` |
| v1.39.0 | 컨트롤러 플러그인 40초 SIGKILL 무한 재시작 — 부팅 워밍업 제거(워치독 stall) | carded | `watchdog-crash-loop` |
| v1.38.x | 하드웨어 컨트롤러 OSC 회전(원샷 + 연속 스핀) · 포즈를 이름으로 주소지정 | carded | `button-action-library` (지난 deferred 해소) |
| v1.38.x | 액세서리/라디오/시퀀스/슬라이드/자료화면 액션 · stateless vs 피드백 분리 | carded | `button-action-library` |
| v1.38.x | OSC fan-out — 전송단 한 곳에서 세컨더리 미러(외부 브리지 제거) | carded | `button-action-library` · codeData `oscbus` |
| v1.38.x | 카메라 소스 목록을 프리셋 JSON 하나로 통합(별도 파일 폐기) · 프리셋 저장소 NAS SSOT | carded | `button-action-library` |
| v1.39.x | 온디맨드 공정 재정의 — 필수→선택, 자동 생성 제외, 3미러 동시 검증 테스트 | carded | `notify-fatigue-redesign` |
| v1.39.x | 보류·폐기 상태를 알림 축으로 — 일일 제외 / 주1회 결산, 에셋×변형 대조, 조회실패 폴백 | carded | `notify-fatigue-redesign` |
| v1.38.x | 배포 ZIP 최초 실행 실패(경로 파일 지연 반영) · 설치 판정에 실제 소스 경로 확인 | carded | `release-artifact-parity` |
| v1.38.x | 릴리즈 채널 간 산출물 불일치 — 화이트리스트 폐기, 아카이브 통일 + 패키징 후 검증 | carded | `release-artifact-parity` |
| v1.38.x | 의존성 상한 고정 + deprecated 시작 훅 → lifespan 전환 | carded | `release-artifact-parity` |
| v1.38.x | 설정 파일 안전 쓰기 — 읽기실패/빈파일 중단, 콜백 치환, 섹션 소실 검사, tmp→rename | carded | `conf-safe-write` · codeData `teamserver` |
| v1.38.x | 계정 등록이 주석 섹션에 오삽입 — 줄 단위 섹션 판정으로 교체 | carded | `conf-safe-write` (동일 카드 포함) |
| v1.39.x | 권한 최소화 — 경로별 직군 재명시(루트 rw 미상속), deny 대신 read 로 커밋만 차단 | deferred | DevOps 카드 후보(권한 설계 단독 서사) |
| v1.38.x | 기획 문서 보고 재편 — 허브 3곳 + 하위 DB 런타임 탐색, 카테고리 섹션 · 조회 재시도 | deferred | 파이프라인/운영 자동화 후보 |
| v1.38.x | 일일보고 로컬 이미지 직접 업로드 — 외부 호스팅 없이 multipart 직접 조립, 자리표시자 치환 | deferred | Tool 카드 후보 |
| v1.38.x | 스위처 미디어풀 스틸 자동 저장 · 캡처 대상/저장 폴더를 버튼 설정으로 | deferred | 방송 심화 |
| v1.38.x | 액션별 고유 글리프 + 매니페스트 감사 · 버튼 라벨이 기본 슬롯만 읽던 결함 | deferred | 툴/프로덕트 디테일 |
| v1.38.x | 출하본에서 디버그 모드 제거 · 사용되지 않던 구형 권한 파일 정리 | skip | 사소/잔재정리 |
| v1.38.x | 릴리즈 bump · 미러링 산출물 제외 · 역할 가이드 문서 보강 | skip | 사소/비노출 |

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
