// ============================================
// Blog Card Data — Problem-Solving Cards
// ============================================
const blogData = [
    // ── Rendering ──
    {
        id: 'toon-shading',
        tag: 'Rendering',
        title: '40단계에 걸쳐 구축한 네이티브 톤 셰이딩 모델',
        problem: 'UE5의 Deferred Shading은 PBR 전용. Post-Process로는 GBuffer에 커스텀 데이터를 기록할 수 없어 조명 모델 자체를 NPR로 전환하는 것이 불가능했다.',
        solution: '엔진 소스에 MSM_Toon(ID 13) 등록, 9번째 MRT인 GBufferT(SV_Target8)를 할당하여 Toon 전용 파라미터를 독립 저장. PBR 라이트 누적을 완전히 제거하고 커스텀 ToonLightPass로 대체.',
        insight: 'GBufferT를 CustomData와 완전 분리함으로써 Toon 픽셀과 PBR 픽셀이 인접해도 서로의 라이팅 데이터를 오염시키지 않는다.',
        arch: `MSM_Toon (ID 13) Registration
├── GBufferT (SV_Target8) — 9th MRT, Toon-only parameters
├── ToonBxDF — 3-Band Cel Shading (Dark/Mid/Highlight)
├── ToonLightPass — Replaces PBR light accumulation
├── Anisotropy Blend — NPR(-1) ↔ PBR(+1) on same material
└── GT7 CVM Tonemapper — ICtCp chroma-preserving`
    },
    {
        id: 'custom-gbuffer',
        tag: 'Rendering',
        title: 'GBufferT — 9번째 MRT로 톤 전용 채널 완전 분리',
        problem: 'PBR 채널의 시멘틱으로는 톤 아트디렉션에 필요한 파라미터를 전달할 수 없었다. 초기에는 Clear Coat 채널 하이재킹으로 우회했으나, 그림자 분리·하이라이트 제어 등 요구가 늘며 채널이 부족해졌다.',
        solution: '엔진 소스에 9번째 MRT인 GBufferT(SV_Target8)를 할당하여 Toon 전용 파라미터를 독립 저장. CustomData와 완전 분리하여 NPR/PBR 픽셀 간 데이터 오염 방지. 그림자 채널을 개별 분리하여 아티스트가 각각 독립 제어 가능.',
        insight: 'Clear Coat 하이재킹은 빠른 프로토타이핑에 유효하지만, 프로덕션에서는 전용 버퍼를 할당하는 편이 채널 충돌 없이 확장 가능하다 — MRT 1개 추가의 GPU 비용은 미미하지만 설계 자유도는 비약적으로 늘어난다.',
        arch: `GBufferT (SV_Target8) — 9th MRT
├── Shadow Tint (R)     — 그림자 색상
├── Cel Range (G)       — 셀 셰이딩 범위
├── Highlight Mask (B)  — 하이라이트 영역
└── NPR/PBR Blend (A)  — Anisotropy(-1~+1)`
    },
    {
        id: 'fov-outline',
        tag: 'Rendering',
        title: 'FOV 24°~120° 어디서든 동일한 아웃라인 두께',
        problem: 'Inverted Hull 아웃라인이 카메라 FOV 변경 시 두께가 급격히 변하여, 클로즈업과 와이드 샷에서 일관된 아트 퀄리티를 유지할 수 없었다.',
        solution: 'HLSL에서 FOV 보정 계수 fovCompensation = 1.0 / tanHalfFOV 를 적용. UE5.5 내장 View.TanAndInvTanHalfFOV.x 사용으로 MPC 의존 완전 제거.',
        insight: 'FOV 24°(tan≈0.21)에서 같은 메시가 ~4.7배 적은 픽셀을 차지하므로, 보정 계수가 아웃라인을 비례 확대하여 어떤 줌에서든 동일한 픽셀 두께를 보장한다.',
        arch: `FOV 24°  → tan=0.21 → compensation=4.7× → same pixel width
FOV 45°  → tan=0.41 → compensation=2.4×
FOV 90°  → tan=1.00 → compensation=1.0× (reference)
FOV 120° → tan=1.73 → compensation=0.58×`
    },
    {
        id: 'face-sdf',
        tag: 'Rendering',
        title: 'SDF 기반 얼굴 그림자 — 아티스트가 그린 라이팅 응답',
        problem: '표준 NdotL 라이팅이 애니메 스타일 얼굴에 코, 광대뼈의 추한 그림자를 만들어 손그림 미학을 파괴. 조명 방향 변경 시 그림자가 급변하는 문제.',
        solution: 'Substance Painter에서 8~12 각도의 그림자 마스크 추출 → 커스텀 Python 도구로 SDF 텍스처 생성. 각 픽셀이 "이 각도에서 그림자 시작"을 인코딩하여, 런타임에 단일 텍스처 샘플로 부드러운 페이스 셰도우 구현.',
        insight: '기존 렌더링의 "이 픽셀이 그림자인가?"를 뒤집어, "어떤 각도에서 이 픽셀에 그림자가 도달하는가?"로 질문을 바꾸면 단일 룩업으로 프레임당 지오메트리 계산을 대체할 수 있다.',
        arch: `SP 마스크 추출 (8~12 angles)
    → 아티스트 보정 (Photoshop)
    → SDF 생성 (Python FaceShadowSDFGenerator)
    → 셰이더 적용 (Anisotropy=-1 → SDF mode)`
    },
    {
        id: 'smooth-normal',
        tag: 'Rendering',
        title: '아웃라인이 찢어지지 않는 Smooth Normal UV 베이킹',
        problem: 'UV 분할, 스무딩 그룹 경계에서 버텍스 노멀이 갈라지며 Inverted Hull 아웃라인 셸이 틈이 벌어지는 현상.',
        solution: '에디터 도구가 동일 위치의 모든 버텍스 노멀을 평균하여 UV2/UV3 채널에 탄젠트 공간 스무스 노멀 저장. 아웃라인 머티리얼이 기하학적 노멀 대신 이 UV를 읽어 WPO 방향 결정.',
        insight: '아웃라인에 필요한 노멀은 라이팅용 노멀과 다르다 — UV 분할과 무관하게 기하학적으로 일치하는 모든 노멀의 평균이 필요하며, UV 채널 저장으로 런타임 비용 제로.',
        arch: null
    },
    {
        id: 'engine-outline',
        tag: 'Rendering',
        title: '엔진 20개 파일 수정 — 모든 메시에 네이티브 아웃라인',
        problem: '플러그인 레벨 아웃라인은 SkeletalMesh에만 작동하고 StaticMesh, InstancedMesh, HISM을 지원하지 않으며, LOD 거리 컬링과 Sequencer 연동도 불가능했다.',
        solution: 'UMeshComponent에 BGRITZOutlineMaterial을 1급 UPROPERTY로 추가. OverlayMaterial 인프라를 미러링하되 ReverseCulling만 반전하여, 모든 메시 타입이 아웃라인을 자동으로 얻도록 엔진 소스 20개 파일 수정.',
        insight: 'OverlayMaterial 인프라를 정확히 복제하면 오클루전 컬링, LOD, 거리 스케일 등 기존 최적화를 공짜로 상속받는다 — 변경점은 컬링 방향 하나뿐.',
        arch: null
    },
    {
        id: 'phantom-gi',
        tag: 'Rendering',
        title: '보이지 않는 메시로 Lumen GI를 제어하는 팬텀 라이트',
        problem: '무대 특정 영역에 간접광을 추가해야 하지만, 가시적 광원을 배치하면 아트 디렉션을 파괴. Lumen Emissive GI는 Lighting Channel을 무시하여 캐릭터 격리 불가.',
        solution: 'AFakeGIEmissiveLight — HiddenInGame + SetAffectIndirectLightingWhileHidden(true) 조합으로 보이지 않는 이미시브 메시가 Lumen GI에 기여. Kelvin→RGB 변환, 그라데이션 램프 지원.',
        insight: 'SetAffectIndirectLightingWhileHidden은 Lumen 전용 플래그로, 보이지 않는 메시가 간접 조명에만 기여하는 "팬텀 광원"을 만든다.',
        arch: null
    },
    {
        id: 'character-exposure',
        tag: 'Rendering',
        title: 'Custom Stencil로 캐릭터만 노출 보정',
        problem: '밝은 무대 조명에서 캐릭터가 상대적으로 어둡게 보이지만, 글로벌 노출 조정은 배경까지 영향. 캐릭터와 배경을 분리하여 노출 보정할 네이티브 메커니즘이 없었다.',
        solution: 'CharacterPartManagerComponent가 이미 기록하는 Custom Stencil(1~7: Body/Face/Hair/Top/Pants/Shoes/Accessory) 값을 Post Process Material에서 읽어 SceneColor에 ExposureScale 선택 적용.',
        insight: '파트 식별용으로 이미 존재하는 Custom Stencil을 노출 마스크로 재활용하면 추가 렌더 패스 없이 캐릭터별 노출 보정이 가능하다.',
        arch: null
    },
    {
        id: 'optimization',
        tag: 'Optimization',
        title: '5명의 톤 캐릭터를 60fps로 — 전체 예산 플레이북',
        problem: '톤 셰이딩 + Inverted Hull 아웃라인 + Lumen GI + VSM + 멀티 채널 SDI 캡처까지 적용한 5캐릭터를 60fps로 렌더링하려면 GPU/CPU 예산 관리가 필수적.',
        solution: 'BC7+BC5 텍스처 압축, ORM 패킹으로 샘플 수 감소. LOD 타겟 50K/25K/12K/5K. LOD1+에서 아웃라인/하이라이트 머티리얼 제거. Static Switch로 컴파일 타임 분기. Animation Budget 4ms.',
        insight: 'Static Switch Parameter는 쿡 타임에 분기를 완전히 제거하므로, 노멀맵 없는 머티리얼은 노멀맵 코드 경로의 GPU 비용이 말 그대로 제로다.',
        arch: null
    },
    // ── Broadcast ──
    {
        id: 'broadcast-4ch',
        tag: 'Broadcast',
        title: '언리얼 에디터 안에서 4채널 SDI 라이브 방송',
        problem: '버추얼 아이돌 라이브에서 FreeCam/AngleCam/CharacterCam/Wide 4개 독립 피드를 60fps로 외부 스위처(ATEM)에 동시 출력해야 하나, UE 표준 SceneCapture에는 멀티 채널 SDI 코디네이터가 없다.',
        solution: 'ABroadcastOutputActor 코디네이터 — OutputChannelManager(4× SceneCapture 1080p), DeckLinkOutputManager(Blackmagic 4ch SDI), MultiViewPreviewManager(라운드로빈 저해상도 프리뷰), NDIOutputManager(네트워크 프리뷰).',
        insight: '에디터 멀티뷰 프리뷰가 4개 별도 캡처 대신 단일 SceneCapture를 라운드로빈(프레임당 2소스)으로 재사용하여 에디터 오버헤드 75% 절감.',
        arch: `ABroadcastOutputActor (Coordinator)
├── UOutputChannelManager      # 4ch SceneCapture 1080p
├── UCameraSourceRegistry      # Free/Angle/Follow/Character auto-discover
├── UDeckLinkOutputManager     # Blackmagic 4ch SDI
├── UMultiViewPreviewManager   # Round-robin low-res editor preview
├── UPIPOverlayManager         # PIP widget overlay
└── UNDIOutputManager          # Network preview output`
    },
    {
        id: 'osc-control',
        tag: 'Broadcast',
        title: 'Stream Deck → 언리얼: OSC 카메라 전환 & 실시간 의상 교체',
        problem: '라이브 방송 중 디렉터가 4채널 SDI 카메라 소스를 물리 컨트롤러로 전환하고, 캐릭터 의상도 실시간으로 교체해야 했다.',
        solution: 'UOSCControlManager가 UDP 8000에서 OSC 수신. 프리뷰 패널의 표시 순서가 곧 OSC 인덱스. 의상 변경은 /bgritz/costume/[Code]/set으로 동적 에셋 탐색(DA_[Code]_Set_[Number]_*) 수행.',
        insight: '프리뷰 패널의 표시 순서를 OSC API의 인덱스로 그대로 사용하면 설정 파일이 필요 없다 — 디렉터가 화면에서 3번을 보고 OSC 3을 보내면 그냥 동작한다.',
        arch: null
    },
    // ── Camera ──
    {
        id: 'camera-system',
        tag: 'Camera',
        title: '설정 파일 없는 카메라 아키텍처 — 레벨에 놓으면 끝',
        problem: '라이브 공연에서 자유 카메라와 최대 9개 고정 앵글 + 캐릭터 추적 카메라를 빠르게 전환해야 하지만, 설정 파일 기반 프리셋 관리가 복잡했다.',
        solution: 'CameraActorManager가 FreeCameraPawn(NumPad 0)과 레벨 배치 BGRITZCameraActorBase(NumPad 1-9)를 통합 관리. CameraID 문자열 정렬로 NumPad 자동 매핑. ShotType 프리셋으로 원클릭 배치.',
        insight: '레벨에 배치된 카메라 액터의 위치가 곧 설정이므로, 앵글 변경 시 설정 파일이 아닌 액터를 움직이면 된다.',
        arch: `NumPad 0 ──→ FreeCameraPawn (자유 카메라)
NumPad 1-9 ─→ BGRITZCameraActorBase (레벨 배치)
                ├─ AngleCameraActor (고정 앵글)
                └─ FollowCameraActor (캐릭터 추적)
Arrow Keys ──→ 카메라 순환
1-5 키 ──────→ 타겟 캐릭터 설정`
    },
    // ── MoCap ──
    {
        id: 'multi-livelink',
        tag: 'MoCap',
        title: '10개 LiveLink 동시 운용 — 5인 모캡 라이브 아키텍처',
        problem: '5명의 버추얼 아이돌을 바디(MotionBuilder) + 페이셜(iPhone ARKit) 모캡으로 동시 구동하면 10개 LiveLink 서브젝트의 네이밍, 네트워크, Timecode 동기화가 필요.',
        solution: '바디 5명은 단일 Message Bus(UDP 6666)로 통합 전송, 페이셜 5명은 고정 IP별 ARKit(포트 11111). UTimecodeSynchronizer 3프레임 버퍼로 유선(~10ms) vs WiFi(~30-50ms) 레이턴시 정렬.',
        insight: 'MotionBuilder가 5명의 바디 서브젝트를 하나의 Message Bus 연결로 스트리밍하면 네트워크 핸드셰이크와 방화벽 룰이 단일 포트로 단순화된다.',
        arch: `[MotionBuilder] ──Message Bus UDP 6666──→ 5× Body Subjects
[iPhone ×5] ──ARKit UDP 11111──→ 5× Facial Subjects
                                    ↓
                    UTimecodeSynchronizer (3-frame buffer)
                                    ↓
                    Per-Character Child AnimBP binding`
    },
    {
        id: 'arkit-remap',
        tag: 'MoCap',
        title: 'LiveLink 단계에서 캐릭터별 ARKit 리매핑',
        problem: '5명의 캐릭터가 서로 다른 얼굴 비율을 가지므로 동일한 ARKit 블렌드셰이프 값이 캐릭터마다 다르게 보임. AnimBP에서 리매핑하면 캐릭터별 로직이 중복.',
        solution: 'UARKitFacialPreProcessor(ULiveLinkFramePreProcessor 상속)를 각 캐릭터의 LiveLink Subject에 추가. FacialRemapDataAsset에 52개 블렌드셰이프별 Multiplier/Offset/Min/Max/Curve 정의.',
        insight: 'AnimBP가 아닌 LiveLink PreProcessor에서 리매핑하면 5개 캐릭터 AnimBP가 동일한 베이스 클래스를 공유하고, 캐릭터 개성은 Data Asset에만 존재한다.',
        arch: null
    },
    {
        id: 'tiptoe-fix',
        tag: 'MoCap',
        title: '모캡 까치발 수정 — 왜 펠비스가 아닌 메시를 움직였는가',
        problem: 'Vicon→MotionBuilder→LiveLink 파이프라인에서 퍼포머와 캐릭터의 체형 차이로 리타겟 후 까치발(발목 회전) 현상 발생.',
        solution: 'FootTiptoeFixComponent + AnimNode_FootTiptoeFix가 캐릭터별 높이 오프셋과 발/발가락 회전 보정값을 프레임마다 적용. DeadZone으로 모캡 노이즈 억제.',
        insight: '높이 보정을 Pelvis 본이 아닌 SkeletalMesh 컴포넌트 위치로 적용하면 "고무 다리" 아티팩트를 방지한다 — Pelvis 오프셋은 IK 캘리브레이션을 파괴하기 때문.',
        arch: null
    },
    {
        id: 'axis-remap',
        tag: 'MoCap',
        title: 'Y-Up 소품을 원컴포넌트로 수정하는 LiveLink 축 리매핑',
        problem: 'MotionBuilder/Maya의 Y-Up 좌표계에서 트래킹된 소품/카메라 리그가 UE5의 Z-Up에서 회전/미러 상태로 나타남.',
        solution: 'LiveLinkAxisRemapComponent(ActorComponent)가 DCC→UE 축 변환 프리셋을 제공. LiveLink Source 설정을 건드리지 않고 어떤 Prop Actor에든 추가 가능.',
        insight: '축 리매핑을 LiveLink Source나 PreProcessor가 아닌 ActorComponent로 만들면, 새 소품이 무대에 합류할 때 기존 설정을 건드리지 않고 빠르게 적용할 수 있다.',
        arch: null
    },
    // ── Animation ──
    {
        id: 'arm-collision',
        tag: 'Animation',
        title: 'Physics Asset으로 팔 관통 방지 — 래그돌 볼륨 재활용',
        problem: '마른 모캡 퍼포머의 "팔 내린 자세"가 리타겟 후 캐릭터 몸통을 관통. 물리 시뮬레이션은 비용이 너무 높음.',
        solution: 'AnimNode_ArmCollisionLimit가 Physics Asset의 Capsule/Sphere 볼륨을 읽어 6개 팔 본(양쪽 upperarm/lowerarm/hand)이 3개 몸통 볼륨 안에 진입하면 밀어냄. 프레임당 18회 거리 계산.',
        insight: '래그돌/물리용으로 이미 제작된 Physics Asset의 충돌 볼륨을 팔 관통 경계로 재활용하면 리거의 추가 작업 없이 다른 목적에 활용 가능하다.',
        arch: null
    },
    {
        id: 'buoyancy',
        tag: 'Animation',
        title: '순수 수학으로 만드는 유기적 플로팅 모션',
        problem: '소품/장식에 유기적 부유 모션이 필요하지만, 리지드 바디 물리는 비용이 높고 기계적인 움직임을 만든다.',
        solution: 'Sin+Cos 파형을 축별 주파수 비율로 조합(X: sin+cos@0.7, Z: sin+cos@1.3)하여 비주기적 패턴 생성. Warp 변조 + 4고조파 Perlin 노이즈. 월드 좌표가 랜덤 시드.',
        insight: '액터의 월드 좌표를 결정론적 노이즈 시드로 사용하면, 50개 동일 코인을 레벨에 배치해도 인스턴스별 설정 없이 50가지 고유 모션이 자동 생성된다.',
        arch: null
    },
    // ── Character ──
    {
        id: 'character-parts',
        tag: 'Character',
        title: '자동 아웃라인과 캐스케이딩 오버라이드를 가진 모듈러 캐릭터 파츠',
        problem: '런타임 파츠 교체 시 아웃라인 자동 생성, 물리 애니메이션 동기화, 교차 파츠 머티리얼 오버라이드(짧은 소매가 Body 메시의 팔을 가림)가 수동 설정 없이 필요했다.',
        solution: 'CharacterPartManagerComponent가 FName 키 슬롯(무제한) 관리. OutlineMaterial 지정 시 Outline_[SlotName] 자동 생성. FPartMaterialOverride로 파츠 장착 시 다른 슬롯의 머티리얼 선언적 교체.',
        insight: '짧은 소매 파츠가 "장착 시 Body.Material[0]을 MI_Body_ArmHidden으로 교체하라"고 선언하면 매니저가 저장/복원을 자동 처리 — 모프 타겟이나 숨겨진 지오메트리 없이 팔 클리핑 해결.',
        arch: null
    },
    // ── Tool ──
    {
        id: 'lookdev',
        tag: 'Tool',
        title: 'LookDev 액터 — 모든 라이팅 변수를 하나의 제어판에서',
        problem: '톤 라이팅, 컬러 그레이딩, 블룸, GI 파라미터를 실시간으로 조정해야 하지만, 여러 PostProcess 컴포넌트가 동일 필드에 겹쳐 써서 "마지막에 쓴 놈이 이김" 버그 발생.',
        solution: 'Coordinator 패턴의 BGRITZLookDevActor — 6개 독립 컴포넌트(Lighting/PP/Tonemapper/SplitCG/Character/GI)가 각각 소유한 PP 필드만 조작. DataAsset 프리셋으로 세이브/로드, 언두/리두 지원.',
        insight: '소유권을 감사하여 각 PP 필드를 정확히 하나의 컴포넌트에 할당하니, 15개의 죽은 CVar과 6개의 죽은 struct 필드가 발견되었다 — 이들은 한 번도 적용된 적이 없었다.',
        arch: `ABGRITZLookDevActor (Coordinator)
├── LightingComp    → DirectionalLight, SkyLight
├── PPComp          → Exposure, Bloom, Vignette, Split Bloom
├── TonemapperComp  → GT7 CVar control
├── SplitCGComp     → 8-Part Split Color Grading (MID)
├── CharacterComp   → Lighting Channel, Base/Shadow Tint
├── GIComp          → Lumen, AO, GI Directionality
└── HistoryManager  → Undo/Redo`
    },
    // ── Pipeline / DevOps ──
    {
        id: 'engine-fork',
        tag: 'DevOps',
        title: 'UE5 엔진 포크 유지보수 — 마커 + 레지스트리 시스템',
        problem: '100+ C++ 파일, 50+ 셰이더 파일을 수정한 엔진 포크에서 Epic 업스트림 병합 시 어떤 파일이 변경되었는지 추적할 방법이 없으면 고고학적 작업이 된다.',
        solution: '모든 엔진 수정부에 // BGRITZ Engine Start YYYY-MM-DD 마커 의무화 + ModifiedEngineFiles.md 레지스트리에 파일 경로/설명/날짜 기록. grep "BGRITZ Engine Start"로 전체 변경 목록 즉시 확인.',
        insight: '날짜 스탬프 마커 시스템이 블랙박스 엔진 포크를 자기 문서화 감사 추적으로 변환한다 — grep 한 줄이면 업스트림 대비 전체 변경 표면이 드러난다.',
        arch: null
    },
    {
        id: 'role-pipeline',
        tag: 'DevOps',
        title: '아티스트는 빌드 시스템을 절대 만지지 않는 역할별 파이프라인',
        problem: '엔진 개발자는 Git+소스 빌드, 아티스트는 SVN+프리빌드 엔진. 역할별 도구가 달라 환경 구축에 1~2일 소요되고, 아티스트가 실수로 빌드를 깨뜨리는 사고 빈발.',
        solution: 'Python BGRITZSetup — config.toml 통합 설정, 역할별 자동 셋업(Developer: Git+Build, Character/Level: SVN+Prebuilt). FastAPI 대시보드로 팀 상태 관리. 프리컴파일 엔진 SVN NAS 배포.',
        insight: '아티스트에게 빌드 툴체인을 노출하지 않는 SVN 전용 경로를 만들면 "아티스트가 엔진 빌드를 깨뜨리는" 고전적 문제가 구조적으로 불가능해진다.',
        arch: `Developer  : 00→01→02→03→04→05→06→09 (Git+Build)
Character  : 00A→10→05→06s (SVN+Prebuilt, no maps)
Level      : 00A→10→05→06s→08 (SVN+Prebuilt+Maps)
Viewer     : 00A→10→05→06s (read-only)`
    },
    {
        id: 'svn-git-overlay',
        tag: 'DevOps',
        title: 'SVN 콘텐츠 + Git 코드를 하나의 디렉토리에서',
        problem: '대용량 바이너리(텍스처, 메시)는 Git에 부적합하고, 코드는 SVN의 히스토리/디프가 약함. 두 도구를 별도로 운영하면 작업 디렉토리가 분리되어 빌드가 깨진다.',
        solution: 'Step 06이 SVN 바이너리 콘텐츠를 기본으로 체크아웃하고, 그 위에 Git 코드를 오버레이하여 단일 작업 디렉토리로 병합. 각 도구가 자신의 장점을 살리는 영역만 관리.',
        insight: 'SVN이 바이너리를, Git이 텍스트를 각각의 강점으로 관리하되 하나의 작업 디렉토리에서 합치면, 개발자는 Git의 히스토리/디프를 누리고 아티스트는 SVN만으로 충분하다.',
        arch: null
    },
    // ── Pipeline ──
    {
        id: 'bp-architecture',
        tag: 'Pipeline',
        title: 'Blueprint는 프로덕션 로직 레이어 — 75개 C++ 클래스의 깔끔한 유지',
        problem: '75개 C++ 클래스가 카메라, 캐릭터, 방송, LookDev 시스템에 걸쳐있을 때, 성능 크리티컬 C++ 로직과 에셋 참조 Blueprint 로직의 경계가 모호해지면 유지보수 비용이 폭증.',
        solution: 'C++는 "언제/어떻게"(카메라 수학, 입력, MPC 업데이트)를, Blueprint는 "무엇을"(어떤 에셋, 어떤 사운드, 어떤 조명) 소유. BlueprintImplementableEvent로 C++ 이벤트를 Blueprint가 구현.',
        insight: 'C++가 시스템의 타이밍과 메커니즘을 소유하고 Blueprint가 콘텐츠 참조를 소유하면, 엔지니어와 아티스트가 서로의 영역을 건드리지 않고 독립 작업 가능.',
        arch: null
    },
    {
        id: 'gamemode',
        tag: 'Pipeline',
        title: 'GameMode 자동 캐릭터 디스커버리와 공연 오케스트레이션',
        problem: '5명의 버추얼 아이돌 캐릭터, 카메라 시스템, 공연 상태(Active/Paused/Stopped)를 하나의 GameMode에서 조율해야 하지만, 기본 UE GameMode는 이 워크플로우를 지원하지 않음.',
        solution: 'ABGRITZ_v01GameModeBase가 BeginPlay에서 GetAllActorsOfClass로 모든 VirtualIdolCharacter를 자동 등록. 첫 번째가 Primary Idol. BlueprintImplementableEvent로 공연 시작/종료 시 음악/조명/UI 반응.',
        insight: 'BeginPlay에서 GetAllActorsOfClass로 자동 탐색하면, 새 캐릭터를 레벨에 놓기만 해도 시스템이 자동으로 인식한다 — 설정 제로.',
        arch: null
    }
];
