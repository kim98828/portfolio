// ============================================================
// blogData.js 배치 삽입 대기 카드 (DRAFT — 아직 blogData.js에 넣지 않음)
// 다른 쪽 blogData/codeData 업데이트 완료 후, roles 태깅과 함께 한 번에 병합.
// [대괄호] = 실제 수치/기간으로 교체. 이 파일은 삽입 후 삭제해도 됨.
// 관련 메모: memory/portfolio-role-adaptive-plan.md
// ============================================================

// ── 선구안: 5.3~5.5 커스텀 구현을 Epic이 5.8 Substrate Toon으로 공식화 (엔진 뷰 핵심) ──
    {
        id: 'toon-foresight-substrate',
        tag: 'Rendering',
        title: '내가 5.3~5.5에 구현한 방식을 Epic이 5.8 Substrate Toon으로 공식 채택',
        problem: 'UE5.5까지 엔진에는 NPR/툰 네이티브 셰이딩 모델이 없었다. PBR 전용 Deferred 구조라, 커스텀 없이는 스타일라이즈드 라이팅 모델 자체가 불가능했다.',
        solution: '초기엔 잘 쓰이지 않는 기존 셰이딩 모델(Clear Coat) 채널을 하이재킹해 우회하고, 이후 PBR 셰이딩 모델이 이미 소비하는 GBuffer 대역폭(SingleLayerWater/SSS 채널)을 재사용해 Toon BxDF를 구현. Anisotropy로 NPR↔PBR을 실시간 블렌드. 신규 MRT 할당 없이 성능 저하 없는 툰 파이프라인을 5.3~5.5 엔진 소스에서 완성해 실제 프로덕션 송출까지 검증.',
        insight: 'Epic이 UE5.8에서 발표한 experimental Substrate Toon Shading이 정확히 같은 설계 방향이다 — Blendable GBuffer 위의 Toon BSDF, 램프 기반 diffuse/specular, anisotropic NPR 블렌드, Lumen GI 연동. 공식 엔진이 뒤늦게 검증한 접근을 여러 버전 앞서 구현했다는 것 자체가 렌더링 설계 감각의 증거다.',
        arch: `[내 구현 · UE5.3~5.5 엔진 소스 개조]
├── 기존 SLW/SSS GBuffer 대역폭 재사용 (신규 할당 0, 저하 없음)
├── Custom Toon BxDF (3-band cel)
├── Anisotropy → NPR ↔ PBR 실시간 블렌드
└── Lumen GI · 아웃라인 · 페이스 SDF 연동 → 프로덕션 송출

        ≈ 같은 설계 방향, 2년 후 공식화 ≈

[Epic 공식 · UE5.8 Substrate Toon (experimental, 2026)]
├── Substrate Blendable GBuffer 위 Toon BSDF
├── Ramp 기반 diffuse/specular + dithering
├── Anisotropic specular
└── Lumen GI scale / 전 광원 타입 지원`
    },

// ── 소스 개조 커스텀 엔진 버전 업그레이드 속도 (엔진/TD 뷰) ──
    {
        id: 'engine-version-upgrade',
        tag: 'Pipeline',
        title: '소스 개조 커스텀 엔진을 5.5→5.7로 2주 만에 업그레이드',
        problem: '툰 셰이딩·아웃라인·NDI 등 수십 개 파일에 걸친 엔진 소스 개조가 쌓여 있어, 메이저 버전 업그레이드 시 수천 개 엔진 파일과 충돌한다. 보통 커스텀 엔진 업그레이드는 수개월이 걸리거나 포기한다.',
        solution: '"Custom Engine Start/End" 마커 기반 병합 전략과 vanilla-sync → vanilla-merge 워크플로우로 개조분을 격리 관리. 5.5 → 5.7 두 단계 업그레이드를 충돌 해결 포함 2주 만에 완료하고 프로덕션 재검증.',
        insight: '엔진 소스를 개조하는 능력보다, 개조한 채로 "업스트림을 계속 따라갈 수 있게" 설계하는 능력이 실무에선 더 희소하다. 마커 기반 격리가 2주 업그레이드를 가능하게 했다.',
        arch: `Custom Engine Upgrade (5.5 → 5.7 · 2주 완료)
├── VanillaEngine(5.7) → vanilla-sync
├── vanilla-merge → CustomEngine(studio-main)
├── 충돌 해결: // Custom Engine Start 마커 기준
└── Prebuilt 재배포 → 프로덕션 재검증`
    },

// ── 멀티 디시플린 파이프라인 통합 / 운영 리드십 (리드 뷰) ──
    {
        id: 'pipeline-multidiscipline-lead',
        tag: 'Pipeline',
        title: 'StudioSetup — 모델러·리거를 하나의 파이프라인에 통합해 2인으로 운영',
        problem: '모델러·배경 모델러·리거가 각자 다른 방식으로 환경을 셋업하고 결과물을 넘겨, 핸드오프마다 수작업과 프로그래머 개입이 반복됐다. 신규 인원 합류 시 셋업에만 [N일]이 소요됐다.',
        solution: '역할별(개발/캐릭터/배경/뷰어) 온보딩·셋업 파이프라인을 직접 설계·구축하고 2인 체제로 운영. 각 직군이 프로그래머 개입 없이 동일 파이프라인에서 작업하도록 통합했고, 커스텀 엔진 빌드·프리컴파일 배포까지 자동화. 실제 팀이 매일 이 위에서 작업하며, 신규 셋업을 [N일 → M시간]으로 단축.',
        insight: '파이프라인 리드십은 문서가 아니라 "다른 직군이 매일 그 위에서 실작업을 하는가"로 증명된다. 내가 만든 시스템을 서로 다른 디시플린이 실제로 굴리고 있다는 것 자체가 관리 역량의 근거다.',
        arch: `Role-based Pipeline (2인 운영 · 멀티 디시플린 통합)
├── setup-developer   — 엔진 빌드 + 풀 소스
├── setup-character   — 캐릭터 모델러/리거 (no maps)
├── setup-level       — 배경 모델러 + 레벨
├── setup-viewer      — 리뷰/뷰어 전용
├── Prebuilt 배포 (SVN NAS 동기화)
└── 결과 → 프로그래머 병목 제거, 팀 상시 가동`
    },

// ── 라이브 운영: VJ·TD·시스템 관리자 1년 + 위기대처 (위조 불가 신호) ──
    {
        id: 'live-operation-crisis',
        tag: 'Delivery',
        title: '공통 — VJ·TD·라이브 시스템 관리자 약 1년 · 주간 정기 방송 6개월(≈24회+)',
        problem: '기술을 구현하는 것과, 관객 앞 라이브에서 그것을 안 터지게 굴리는 것은 다른 역량이다. 방송·공연 중 장애는 되돌릴 수 없고 재시도가 없다.',
        solution: '직접 구축한 렌더링·방송·모캡 파이프라인을 VJ / TD / 라이브 시스템 관리자로서 약 1년간 실제 운영, 그 중 6개월은 주간 정기 방송(≈24회+)을 무중단 송출. 라이브 중 발생하는 장애를 실시간 진단·복구하고 반복 운영으로 시스템을 안정화. [추가 측정: 평균 장애 복구 시간 등]',
        insight: '"만들 수 있다"와 "라이브에서 안 터지게 굴린다"는 완전히 다른 역량이다. 재시도 없는 현장에서의 위기대처 경험은 이력서로 위조가 불가능한 신뢰 신호다.',
        arch: null
    },

// ── 스튜디오 통째 설계 능력 (내부 구성은 기밀 — 능력만 선언) ──
    {
        id: 'studio-architecture',
        tag: 'Pipeline',
        title: '공통 — 렌더링·하드웨어·스튜디오를 하나의 아키텍처로 설계',
        problem: '버추얼 프로덕션 스튜디오는 렌더링 엔진·방송 하드웨어·모캡·파이프라인이 하나로 맞물려야 한다. 개별 조각이 아니라 "전체 구성"을 그릴 수 있는 사람이 드물다.',
        solution: '렌더링 파이프라인 설계 + 하드웨어 통합(SDI/NDI/모캡/센서) + 스튜디오 구성·운영을 단일 아키텍처로 묶어 설계·구축. (구체 구성은 기밀 — 상세는 별도 논의)',
        insight: '개별 기술의 깊이보다 "전체 스튜디오를 그림 한 장으로 설계할 수 있는가"가 진짜 희소성이다.',
        arch: null
    },
