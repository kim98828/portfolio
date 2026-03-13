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
    },
    // ══════════════════════════════════════
    // XROOM (SoulXProject) — 960+ commits
    // ══════════════════════════════════════
    // ── SaveLoad ──
    {
        id: 'xroom-saveload',
        tag: 'SaveLoad',
        title: '3D 씬 전체를 직렬화하는 Save/Load 시스템 — 수십 번의 아키텍처 전환',
        problem: 'XROOM의 3D 씬에는 액터, 컴포넌트, MediaPlane 텍스처, Composure 설정, PPT 슬롯, 카메라 트랜스폼이 혼재. 단순 문자열 직렬화로는 오브젝트 간 참조와 고유 ID 충돌을 해결할 수 없었다.',
        solution: '문자열 → 오브젝트 기반 → 오브젝트 그래프 전체 영속화로 아키텍처를 수차례 전환. DragDrop 오브젝트의 UniqueID 중복 문제를 해결하고, Undo/Redo 시스템까지 Save/Load 위에 재구축.',
        insight: 'Save 시스템이 충분히 완전하면 Undo/Redo를 별도로 구현할 필요가 없다 — 스냅샷 저장/복원이 곧 Undo/Redo다. 이 발견으로 코드를 절반으로 줄였다.',
        arch: `Save/Load Architecture
├── Actor Serializer   — Transform, Properties, UniqueID
├── Component State    — Media, Composure, PPT, Camera
├── Object Graph       — Reference tracking, ID dedup
├── Undo/Redo          — Built on Save/Load snapshots
└── File I/O           — Async write, versioned format`
    },
    // ── Compositing ──
    {
        id: 'xroom-composure',
        tag: 'Compositing',
        title: 'Composure 크로마키 + Save/Load = 크래시 — 실시간 합성의 상태 관리',
        problem: 'UE5 Composure 플러그인으로 실시간 크로마키 합성을 구현했으나, Save/Load 시 Composure 상태 복원에서 크래시 발생. ColorResistance 토글 후 뷰포트에 잔상 아티팩트도 남았다.',
        solution: 'Composure 컴포넌트의 초기화 순서를 제어하는 예외 처리 레이어 추가. 복원 시 Composure를 먼저 해제 → 씬 로드 → 재초기화하는 3단계 프로세스. 잔상 문제는 렌더 타겟 강제 클리어로 해결.',
        insight: '실시간 합성 시스템은 "현재 프레임"에 최적화되어 있어 상태 저장/복원을 고려하지 않는다. Save/Load와 결합하려면 초기화 순서를 명시적으로 제어하는 중간 레이어가 필수다.',
        arch: `Load Sequence
1. Composure Release  — 기존 합성 파이프라인 해제
2. Scene Restore      — 액터, 미디어, 카메라 복원
3. Composure Reinit   — 크로마키 설정 재적용
4. RenderTarget Clear — 잔상 방지 강제 클리어`
    },
    // ── Streaming ──
    {
        id: 'xroom-ndi',
        tag: 'Streaming',
        title: 'NDI 비동기 이중 버퍼 — GPU→CPU 스톨 없는 1080p60 송출',
        problem: 'NDI 프레임 송출 시 GPU→CPU 텍스처 리드백에서 동기 대기가 발생하여 프레임 드롭. 실시간 방송에서 매 프레임 16.6ms 예산을 초과하면 시청자에게 끊김이 보인다.',
        solution: 'MappedTexture[2] 핑퐁 구조의 비동기 이중 버퍼 설계. 한 프레임을 NDI로 전송하는 동안 다음 프레임의 GPU 리드백을 동시 진행. 파이프라인 지연을 1프레임 이내로 억제.',
        insight: 'GPU→CPU 리드백은 본질적으로 느리다. 동기 방식으로는 해결 불가능하며, 1프레임 지연을 수용하는 비동기 핑퐁이 실시간 방송에서 유일한 실용적 해법이다.',
        arch: `Frame N:   GPU Render → Buffer[0] → NDI Send
Frame N+1: GPU Render → Buffer[1] → (waiting)
Frame N+2: GPU Render → Buffer[0] → NDI Send (Buffer[1])
                         ↑ ping-pong ↑`
    },
    {
        id: 'xroom-ndi-audio',
        tag: 'Streaming',
        title: 'NDI 오디오 채널 자동 다운믹스/업믹스',
        problem: 'NDI 소스마다 오디오 채널 수가 다름(예: 8ch 수신 → 2ch 출력). 채널 미스매치 시 무음 또는 왜곡 발생. 사용자가 매번 오디오 설정을 수동으로 맞추는 것은 비현실적.',
        solution: '자동 다운믹스/업믹스 알고리즘 구현. 초과 채널은 합산 후 정규화, 부족 채널은 평균으로 생성. Float32→Int16 변환 포함. 어떤 NDI 소스든 자동으로 출력 포맷에 맞춰 재생.',
        insight: '오디오 채널 불일치는 방송 현장에서 가장 흔한 문제다. "항상 자동으로 맞추기"가 "옵션으로 선택하기"보다 현장 안정성이 높다 — 방송 중에는 설정을 건드릴 시간이 없다.',
        arch: null
    },
    {
        id: 'xroom-ffmpeg',
        tag: 'Streaming',
        title: 'FFmpeg를 UE5 안에서 — 인프로세스에서 프로세스 분리로',
        problem: 'UE5 내부에서 FFmpeg 라이브러리를 직접 링크하면 인코딩 크래시가 에디터 전체를 죽인다. 연속 녹화 시 메모리 누수도 발생.',
        solution: '초기 인프로세스 방식에서 별도 프로세스 스폰 방식으로 전환. UE5는 파이프로 프레임을 전달하고 FFmpeg 프로세스가 독립적으로 인코딩. 오디오 녹음, 타임코드 표시, 파일 관리까지 모듈 분리.',
        insight: '서드파티 네이티브 라이브러리가 호스트 앱을 크래시시킬 수 있다면 프로세스를 분리하라. 파이프 통신의 오버헤드는 크래시 복구 비용보다 항상 저렴하다.',
        arch: `v1: UE5 ←link→ FFmpeg.dll  (crash = editor dead)
v2: UE5 ←pipe→ FFmpeg.exe  (crash = respawn)
         ├── Video pipe (raw frames)
         ├── Audio pipe (PCM)
         └── Control pipe (start/stop/config)`
    },
    // ── PPT ──
    {
        id: 'xroom-ppt',
        tag: 'Tool',
        title: '3D 엔진 안의 PPT — 79커밋으로 만든 프레젠테이션 시퀀서',
        problem: '3D 가상 공간에서 프레젠테이션을 하려면 카메라 이동, 오브젝트 표시/숨김, 미디어 전환, 이펙트를 시간 기반으로 제어해야 한다. PowerPoint와 같은 UX를 3D 엔진에서 구현해야 했다.',
        solution: '슬롯 기반 시퀀서 설계 — 각 슬롯이 카메라 트랜스폼, 오브젝트 가시성, 미디어 상태, 전환 효과(Fade/Dissolve/Shake)를 소유. 자동 재생, 루프, 페이지 업/다운, 멀티카메라를 지원.',
        insight: '시퀀서의 각 슬롯이 "상태 스냅샷"이라고 정의하면, 전환은 두 스냅샷 간 보간이 된다. 이 추상화가 카메라, 오브젝트, 미디어를 단일 인터페이스로 통합한다.',
        arch: `PPT Sequencer
├── Slot[N]  — Camera, Visibility, Media, Effects
├── Transition — Fade, Dissolve, Camera Shake
├── Playback  — Auto/Manual, Loop, Duration
└── Integration — Save/Load, Multi-Camera, MediaPlane`
    },
    // ── MediaPlane ──
    {
        id: 'xroom-mediaplane',
        tag: 'Tool',
        title: 'GC가 라이브 미디어를 죽인다 — MediaPlane과 가비지 컬렉션 전쟁',
        problem: 'UE5의 가비지 컬렉션이 라이브 비디오/웹캠 텍스처를 사용 중인데도 회수. MediaPlane에서 라이브 피드가 갑자기 검은 화면으로 바뀌는 현상이 간헐적으로 발생.',
        solution: '미디어 리소스의 소유권을 MediaPlane 컴포넌트가 명시적으로 AddToRoot 또는 강한 참조로 보유하도록 재설계. JPG 임포트 에러, 잔상 제거, 멀티 임포트 등 미디어 생명주기 전반을 재구축.',
        insight: 'UE5 GC는 "현재 사용 중"인지가 아니라 "참조 체인이 있는지"를 본다. 동적으로 생성된 미디어 리소스는 반드시 명시적 소유권을 설정해야 GC에서 보호된다.',
        arch: null
    },
    // ── Networking ──
    {
        id: 'xroom-multiplayer',
        tag: 'Networking',
        title: 'Command 패턴으로 멀티플레이어 상태 동기화',
        problem: 'XROOM의 멀티플레이어에서 오브젝트 선택, 이동, 삭제를 서버 권위(Server-Authoritative)로 처리해야 했다. 직접 RPC 호출 방식은 명령어 종류가 늘어날수록 스파게티 코드화.',
        solution: 'Command 패턴을 도입하여 모든 사용자 액션을 직렬화 가능한 Command 객체로 캡슐화. 서버에서 실행 후 결과를 클라이언트에 리플리케이트. DOREPLIFETIME으로 PlayerController 상태 동기화.',
        insight: 'Command 패턴은 네트워크 동기화와 Undo/Redo를 동시에 해결한다 — Command를 서버에 보내면 동기화, 스택에 쌓으면 Undo다.',
        arch: `Client → Command Object → Server Execute → Replicate
         ├── SelectCmd   — Object selection sync
         ├── MoveCmd     — Transform replication
         ├── DeleteCmd   — Server-authoritative removal
         └── UndoStack   — Command history for Undo/Redo`
    },
    // ── Auth ──
    {
        id: 'xroom-jwt',
        tag: 'Networking',
        title: 'C++에서 JWT 검증 — 크로스 플랫폼 타입 호환성 문제',
        problem: 'UE5의 C++ 환경에서 JWT 토큰을 검증할 때 inttypes.h 호환성 문제 발생. 검증 실패 시 재시도 로직이 없어 일시적 네트워크 오류에도 로그인 실패.',
        solution: 'inttypes 전용 빌드로 크로스 플랫폼 호환성 확보. HTTPManager를 GameInstance로 이동하여 인증 상태를 앱 생명주기와 동기화. JWT 디코더를 패치 브랜칭에 통합하여 인증된 업데이트만 허용.',
        insight: 'C++ 게임 엔진에서 웹 표준(JWT)을 사용할 때는 타입 시스템의 차이가 가장 큰 장벽이다. 라이브러리를 "있는 그대로" 링크하지 말고 엔진의 타입 체계에 맞게 래핑해야 한다.',
        arch: null
    },
    // ── Delivery ──
    {
        id: 'xroom-launcher',
        tag: 'Delivery',
        title: 'Electron 런처 CI/CD — 멀티 아키텍처 빌드와 코드사인 벽',
        problem: 'XROOM의 Electron 런처를 x86/x64/ARM에서 빌드하고 자동 업데이트를 지원해야 했다. Windows 코드사인이 없으면 자동 업데이트가 차단되는 문제 발견.',
        solution: 'GitHub Actions로 멀티 아키텍처 CI/CD 구축(183커밋). 코드사인 미적용 환경에서는 홈페이지 리다이렉트로 우회. Firebase 연동, API 엔드포인트 관리, 토큰 환경변수를 자동화.',
        insight: 'Electron 자동 업데이트는 코드사인을 사실상 필수로 요구한다. 코드사인 인프라가 없다면 웹 기반 업데이트 안내가 현실적인 대안이다.',
        arch: `GitHub Actions CI/CD
├── Build    — x86 / x64 / ARM
├── Sign     — (skipped → web redirect fallback)
├── Release  — GitHub Releases auto-publish
└── Update   — Electron autoUpdater → Homepage redirect`
    },
    {
        id: 'xroom-patch',
        tag: 'Delivery',
        title: 'SharedPointer 충돌 — 비동기 청크 다운로드 후 메모리 크래시',
        problem: 'XROOM의 CDN 기반 청크 패치 시스템에서 비동기 다운로드 완료 후 SharedPointer 충돌로 크래시 발생. 데이터테이블 청크 분리 후 더 빈번해짐.',
        solution: '비동기 다운로드 콜백에서 SharedPointer 소유권이 불명확했던 문제 발견. 다운로드 완료 시점에 원본 포인터가 이미 해제된 경우가 원인. Weak → Shared 승격 패턴으로 콜백 안전성 확보. 재연결 시도 로직 추가.',
        insight: '비동기 콜백에서 SharedPointer를 직접 캡처하면 수명이 예측 불가능해진다. WeakPtr로 캡처 후 콜백 진입 시 Shared로 승격하는 패턴이 비동기 C++ 코드의 정석이다.',
        arch: null
    },
    {
        id: 'xroom-3ch-deploy',
        tag: 'Delivery',
        title: '3채널 동시 배포 — Steam + Electron + AWS 버전 동기화',
        problem: 'Steam, Electron 런처, AWS 서버 3개 배포 채널의 버전이 각각 관리되어 업데이트 시 동기화 실패 빈번. 사용자마다 다른 버전을 사용하는 파편화 발생.',
        solution: '중앙 Version API 서버 구축. Electron 런처 자동 업데이트 + SteamPipe 브랜치 관리 + AWS CDN을 통합. 델타 패칭으로 업데이트 크기 80% 감소.',
        insight: '멀티채널 배포에서 "각 채널이 독립적으로 버전을 관리"하면 반드시 파편화된다. 단일 Version API가 진실의 원천(Source of Truth)이 되어야 한다.',
        arch: `Version API (Source of Truth)
├── Steam      — SteamPipe branch management
├── Electron   — autoUpdater + GitHub Releases
└── AWS CDN    — Chunked delta patching (80% smaller)`
    },
    // ── Event ──
    {
        id: 'xroom-event-branch',
        tag: 'DevOps',
        title: 'CES부터 두바이까지 — 이벤트 드리븐 브랜치 아키텍처',
        problem: 'XROOM은 CES, 두바이, WIS, NextRise, 대구 등 10개 이상의 글로벌 이벤트에 커스텀 빌드를 납품. 각 이벤트마다 다른 기능 조합이 필요하지만 메인라인 제품과 동기화도 유지해야 했다.',
        solution: '이벤트별 브랜치(v2.0.0_CES, v2.5.0_Dubai, v3.0.0_Daegu_Composure 등)를 메인라인에서 분기 → 커스터마이징 → 이벤트 종료 후 유용한 기능만 메인에 체리픽. 27개 버전 릴리스를 2년간 관리.',
        insight: '이벤트 브랜치는 "쓰고 버리는 것"이 아니라 "실전 테스트 환경"이다. 이벤트에서 검증된 기능만 메인라인에 머지하면 제품 안정성이 자연스럽게 올라간다.',
        arch: `main ─── v1.0 ─── v2.0 ─── v2.5 ─── v3.0
              ↓         ↓         ↓         ↓
            CES    Dubai/WIS  NextRise   Daegu
              └── cherry-pick useful features back ──→ main`
    },
    // ══════════════════════════════════════
    // Notion 주간보고/기술문서 기반 카드
    // ══════════════════════════════════════
    // ── Broadcast ──
    {
        id: 'notion-timecode',
        tag: 'Broadcast',
        title: '5대 장비의 타임코드를 1ms 이내로 맞추는 동기화 아키텍처',
        problem: 'Vicon 모캡 PC, MotionBuilder PC, UE5 PC, iPhone(ARKit), ATEM 스위처 — 5종 장비가 각자의 시계를 사용. 방송 중 립싱크가 3~4프레임(~130ms) 어긋나고, 모캡-영상 간 동기화도 불안정.',
        solution: 'NAS를 NTP 서버로 지정하여 전체 장비의 시계를 중앙 동기화. ATEM REF OUT으로 DeckLink/HyperDeck에 Genlock 공급. iPhone은 NTP 수동 설정 + LiveLink Time Offset 보정. ATEM Fairlight Audio Delay ~100ms로 립싱크 보정. 방송 전 박수 테스트로 캘리브레이션.',
        insight: 'NTP(소프트웨어 동기화)와 Genlock(하드웨어 동기화)은 역할이 다르다. NTP는 ms 단위 시계 통일, Genlock은 프레임 정확(frame-accurate) 동기화. 두 계층을 조합해야 모캡-영상-오디오가 완전히 일치한다.',
        arch: `NAS (NTP Server) ─── 로컬 네트워크 타임 마스터
├── NTP → Vicon Tracker PC
├── NTP → MotionBuilder PC
├── NTP → UE5 PC (DeckLink)
├── NTP → iPhone (LiveLink Face)
└── 수동시계 → ATEM Constellation
                  ├── REF OUT → DeckLink (Genlock)
                  ├── REF OUT → HyperDeck (Genlock)
                  └── Fairlight Delay ~100ms (립싱크)`
    },
    {
        id: 'notion-osc',
        tag: 'Broadcast',
        title: 'Stream Deck 하나로 멀티 PC 동시 제어 — OSC 원격 방송 시스템',
        problem: '라이브 방송 중 카메라 전환과 캐릭터 의상 변경을 여러 대의 PC(메인/백업)에서 동시에 실행해야 한다. 각 PC에 직접 접근하면 지연이 발생하고, 한 대만 명령이 빠지면 화면이 불일치.',
        solution: 'UE5에 OSC 서버(포트 8000)를 구현하고 Stream Deck에서 버튼 하나로 여러 PC에 동시 명령 전송. 채널별 카메라 소스 전환(/bgritz/channel/{1-4}/source)과 캐릭터별 의상 세트 변경(/bgritz/costume/{name}/set)을 OSC 경로로 매핑.',
        insight: '방송 현장에서는 "1개 버튼 = 1개 동작"이 철칙이다. OSC의 멀티캐스트 특성을 이용하면 메인/백업 서버를 동시에 제어할 수 있어 화면 불일치 사고를 원천 차단한다.',
        arch: `Stream Deck → OSC Multicast
├── UE5 Main Server (port 8000)
│     ├── /bgritz/channel/1/source 2  → Camera Switch
│     └── /bgritz/costume/all/set 3   → Costume Change
└── UE5 Backup Server (port 8000)
      └── (동일 명령 동시 수신)`
    },
    // ── Rendering ──
    {
        id: 'notion-cvm',
        tag: 'Rendering',
        title: 'GT7 CVM 톤매퍼 — 밝은 빨강이 노란색으로 변하는 문제 해결',
        problem: 'UE5 기본 Film 톤매퍼는 밝은 빨강 하이라이트에서 Hue Shift가 발생하여 노란색으로 변한다. 버추얼 아이돌의 빨간 의상이나 조명에서 의도하지 않은 색상 변화가 나타남.',
        solution: 'Gran Turismo 7의 Color Volume Mapping(CVM) 톤매퍼를 엔진에 구현. ICtCp 색공간에서 Chroma를 보존하는 톤매핑으로 Hue Shift 방지. LUT 생성 시에만 연산하여 per-pixel 추가 비용 제로. BlendRatio CVar로 Film↔CVM 블렌딩 가능.',
        insight: 'Film 톤매퍼의 Hue Shift는 RGB 공간에서 채도를 보존하려다 발생한다. 지각적 색공간(ICtCp)에서 처리하면 밝기가 올라가도 색상이 유지된다 — 연산 위치를 LUT로 한정하면 런타임 비용은 0이다.',
        arch: `Film Tonemapper (기본)
  RGB → Filmic Curve → Hue Shift 발생

GT7 CVM Tonemapper (구현)
  RGB → ICtCp 변환 → Chroma 보존 톤매핑
      → ChromaFade(Start/End) → Hue 안정
      → LUT 생성 시에만 연산 (per-pixel 비용 0)`
    },
    {
        id: 'notion-rt-shadow',
        tag: 'Rendering',
        title: 'RT Shadow 채널 분리 — 얼굴에 머리카락 그림자가 지지 않게',
        problem: '캐릭터 얼굴에 머리카락 그림자가 레이트레이싱으로 드리워지면 셀 셰이딩 미감이 깨진다. Raster Shadow뿐 아니라 RT Shadow 경로에서도 선택적으로 그림자를 필터링해야 했다.',
        solution: 'ShadowReceiveChannel 기반 채널 필터링을 Raster와 RT Shadow 양쪽에 구현. RT 경로에서는 AnyHitShader에 ShadowCastChannel/ReceiveChannel 비트 AND 비교 로직 추가. 얼굴(Channel=0)은 모든 그림자 무시, 바디(Channel=1)는 머리카락 그림자 정상 수신.',
        insight: 'NPR에서 그림자는 "물리적 정확성"이 아니라 "미적 제어"가 목적이다. 채널 기반 필터링으로 아티스트가 어떤 오브젝트가 어디에 그림자를 드리울지 완전히 제어할 수 있어야 한다.',
        arch: `Shadow Channel Filtering
Face  (Receive=0): Shadow = 1.0 (항상 밝음)
Body  (Receive=1): Hair Shadow 정상 수신
Hair  (Cast=1):    Face에는 그림자 안 드리움

RT Path: AnyHitShader → CastChannel & ReceiveChannel 비트 비교
Raster:  DeferredLight → SurfaceShadow/TransmissionShadow = 1.0`
    },
    {
        id: 'notion-mrt-limit',
        tag: 'Rendering',
        title: 'D3D12 MRT 8장 제한 vs Toon 전용 버퍼 3개 — 아키텍처 선택',
        problem: 'D3D12에서 MRT(Multiple Render Targets)는 최대 8개. Toon 전용 데이터를 위해 MRT8(ToonDataA) + MRT9(ToonDataC)를 추가하면 UE5의 Substrate 머티리얼 시스템과 렌더타겟이 충돌.',
        solution: 'Substrate와 Toon은 동시 사용 불가함을 확인하고, Substrate 미사용 조건에서만 MRT8/9를 활성화하도록 분기. 별도 ToonBufferPass를 시도했으나 풀 머티리얼 재평가 비용이 너무 높아 롤백 → 베이스패스 MRT 출력에 ToonDataA/C를 통합.',
        insight: 'MRT를 추가하는 것보다 "기존 패스에서 데이터를 함께 출력"하는 것이 거의 항상 효율적이다. 별도 패스 = 머티리얼 재평가 비용. 같은 패스에 MRT 추가 = 대역폭 비용만. 후자가 압도적으로 싸다.',
        arch: `시도 1: ToonBufferPass (별도 패스)
  → 머티리얼 전체 재평가 필요 → 비용 과다 → 롤백

시도 2: BasePass MRT 확장 (채택)
  MRT0-7: 기존 GBuffer (Substrate 미사용 시)
  MRT8:   ToonDataA (Cast/Receive/ToonModel/SCF/HairOffset)
  MRT9:   ToonDataC (RGBA 4채널 자유 사용)
  CustomData: ToonDataB (Specular Smooth/Offset + Outline)`
    },
    // ── Pipeline ──
    {
        id: 'notion-dashboard',
        tag: 'Pipeline',
        title: 'WPF 런처의 한계를 넘어 — 웹 기반 파이프라인 대시보드',
        problem: 'PowerShell WPF 런처의 비동기 처리가 불안정하고, 한글 인코딩 충돌(CP949 vs UTF-8), 실시간 상태 확인이 불가능. 30인 조직에 배포하기엔 안정성이 부족.',
        solution: 'HTML/JS 웹 대시보드 + PowerShell HttpListener 백엔드로 전면 전환. Git 3개 저장소 + SVN 2개 상태를 실시간 JSON API로 수집. 파이프라인 스크립트 10개를 원클릭 실행 + 500ms 폴링 로그 스트리밍. 역할별(Developer/Character/Level/Viewer) UI 필터링.',
        insight: 'WPF는 단일 사용자 도구에 적합하지만, 팀 전체에 배포하려면 웹이 유일한 답이다. 브라우저는 인코딩, OS 호환성, 업데이트 문제를 한 번에 해결한다.',
        arch: `Browser ← HTTP → DashboardServer.ps1
├── GET /api/status  → Git×3 + SVN×2 상태 JSON
├── GET /api/scripts → 실행 가능한 파이프라인 목록
├── POST /api/run/:s → bat 스크립트 비동기 실행
├── GET /api/log     → 500ms 폴링 실시간 로그
└── POST /api/stop   → 프로세스 종료`
    },
    {
        id: 'notion-python-pipeline',
        tag: 'Pipeline',
        title: 'bat/ps1 스크립트 전량 삭제 — Python 패키지로 파이프라인 일원화',
        problem: 'bat와 PowerShell 스크립트가 혼재하면서 인코딩 충돌(LF/CRLF, UTF-8/CP949), 환경변수 미전파, em-dash 파싱 에러 등 셸 간 호환성 문제가 반복 발생.',
        solution: 'bat/ps1 스크립트를 전량 삭제하고 bgritz Python 패키지로 일원화. setup-developer/character/level/viewer 4개 원클릭 명령으로 역할별 셋업 분리. pip install로 설치, Cross-platform 호환.',
        insight: '셸 스크립트는 빠르게 만들 수 있지만 조직에 배포하면 OS/인코딩/버전 차이가 모든 장점을 상쇄한다. Python 패키지는 초기 투자가 크지만 "한 번 만들면 어디서나 동일하게 동작"한다.',
        arch: null
    },
    {
        id: 'notion-prebuilt-100gb',
        tag: 'Pipeline',
        title: '프리컴파일 엔진 50GB → 100GB — 누락된 것들의 발견',
        problem: '프리컴파일 엔진을 5개 핵심 폴더만 패키징(~50GB)해서 아티스트에게 보냈더니, Generated 파일(자동생성 헤더), 서드파티 라이브러리(.lib/.dll), 플러그인 헤더(.hpp/.h) 누락으로 빌드/실행 실패.',
        solution: 'Generated 폴더, 서드파티 라이브러리, 플러그인 헤더/라이브러리를 모두 포함하도록 패키징 범위 확대. ElectronicNodes 플러그인이 .cpp를 #include하는 비표준 패턴 → 화이트리스트 예외 처리. 최종 ~100GB이지만 아티스트 PC에서 정상 동작.',
        insight: '프리컴파일 배포에서 "컴파일된 바이너리만 주면 된다"는 착각이 가장 위험하다. Generated 헤더, 서드파티 링크 라이브러리, 플러그인 퍼블릭 헤더까지 포함해야 실제로 동작한다.',
        arch: `v1 패키징 (~50GB) — 실패
├── Binaries/   ✓
├── Content/    ✓
├── Plugins/    (바이너리만)
├── Generated/  ✗ ← 자동생성 헤더 누락
└── ThirdParty/ ✗ ← .lib/.dll 누락

v2 패키징 (~100GB) — 성공
├── Binaries/   ✓
├── Content/    ✓
├── Plugins/    ✓ (헤더 + 라이브러리 + 화이트리스트)
├── Generated/  ✓
└── ThirdParty/ ✓`
    },
    // ── DevOps ──
    {
        id: 'notion-docker-nas',
        tag: 'DevOps',
        title: 'NAS에 Docker로 팀 서버 배포 — 중앙 인증과 배포 관리',
        problem: '15인 이상의 아티스트에게 SVN 계정 관리, 파이프라인 업데이트 알림, 접속 현황 모니터링을 수동으로 처리. 개발자가 빠지면 관리가 중단되는 SPOF 구조.',
        solution: 'Synology NAS에 PHP+Apache Docker 컨테이너로 TeamServer API를 배포. 도메인 기반 역방향 프록시 구성. SVN 계정 기반 로그인/회원가입 + 관리자 승인 시스템. 12개 API 엔드포인트(checkin, user_login, approve, online, release_check 등)로 팀 상태 자동 관리.',
        insight: 'NAS는 단순 파일 서버가 아니라 Docker를 돌릴 수 있는 상시 운영 서버다. 소규모 팀에서 AWS 비용 없이 팀 인프라를 유지하려면 NAS Docker가 최적의 선택지다.',
        arch: `Synology NAS
├── Docker: PHP 8.2 + Apache (TeamServer API)
│     ├── /checkin     — 출근 체크인
│     ├── /user_login  — SVN 계정 인증
│     ├── /approve     — 관리자 승인
│     ├── /online      — 접속 현황
│     └── /release_*   — 업데이트 관리
├── Reverse Proxy: api.dnable.synology.me
└── SVN Server: 프로젝트 + 엔진 빌드`
    },
    // ── Animation ──
    {
        id: 'notion-foot-fix',
        tag: 'MoCap',
        title: '모캡 까치발 보정 — Pelvis 이동에서 Mesh 위치로 전환한 이유',
        problem: 'Vicon 모캡 데이터에서 퍼포머와 캐릭터 간 체형 차이로 까치발(Tiptoe) 문제 발생. 초기에 Pelvis 본을 이동하여 높이를 보정했으나 다리가 늘어나는 부작용 발생.',
        solution: 'Pelvis 본 이동 대신 Mesh 자체의 위치를 조절하여 전체 높이 보정(다리 늘어남 없음). FootTiptoeFixComponent + AnimNode로 발목/발가락 회전 오프셋을 실시간 조절. Link Both Feet 모드로 양발 동시 조절, Blend Weight + Smoothing Factor로 급격한 변화 방지.',
        insight: '본 이동은 IK 체인에 영향을 미치지만 Mesh 이동은 렌더링 공간에서만 작용한다. 높이 보정은 "본 계층구조 밖에서" 처리해야 다리 길이에 영향을 주지 않는다.',
        arch: `v1: Pelvis Bone Move → 다리 IK 체인 영향 → 다리 늘어남
v2: Mesh Position Offset → IK 체인 무관 → 정상 비율 유지

FootTiptoeFixComponent
├── Height Offset     (-30~+30cm, Mesh 위치)
├── Foot Rotation     (Pitch/Roll/Yaw ±45°)
├── Toe Rotation      (Pitch/Roll/Yaw ±45°)
├── Link Both Feet    (양발 동시 조절)
└── Blend Weight      (보정 강도 + 스무딩)`
    }
];
