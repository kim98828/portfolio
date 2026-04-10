// ============================================
// Code Popup Data — Extracted from script.js
// ============================================
const codeData = {
    ue5: {
        label: 'UE5 Project Architecture',
        lang: 'Workflow',
        desc: 'UE5.3~5.5 기반 버추얼 프로덕션 + 실시간 방송 플랫폼 개발. 엔진 소스 수정 포함',
        code: `<span class="code-comment">// 버추얼 프로덕션 (UE 5.5)</span>
Engine Source Mod → Custom Toon Shading Model
                 → SDF Face Shadow Pipeline
                 → GranTurismo Tonemapper

<span class="code-comment">// 실시간 방송 플랫폼 (UE 5.3)</span>
NDI Send/Receive → Multi-Camera Compositor
LiveLink MoCap   → VRM Avatar Retarget
SceneCapture     → HDR + Ray Tracing Output
OSC Control      → Remote Parameter Sync

<span class="code-comment">// 공통</span>
Custom AnimGraph Nodes (IK, Spring Bone)
Pixel Streaming Infrastructure
Steam Build &amp; Distribution`
    },
    unity: {
        label: 'Seesaw — Unity Mobile App',
        lang: 'Workflow',
        desc: 'Unity 기반 크로스플랫폼 모바일 앱 개발',
        code: `<span class="code-comment">// Unity Project Pipeline</span>
Scene Management → Addressable Assets
UI Toolkit      → Responsive Layout
C# Scripts      → MVVM Architecture
Build Pipeline  → Android / iOS Export

<span class="code-comment">// 최적화</span>
Object Pooling, LOD, Occlusion Culling
Texture Compression (ASTC / ETC2)`
    },
    blueprint: {
        label: 'DNABLE — MoCap → Render Pipeline',
        lang: 'Blueprint',
        desc: 'ARKit/VICON 모캡 데이터 수신부터 최종 NDI 송출까지의 블루프린트 워크플로우',
        code: `<span class="code-comment">// Live Production Blueprint Flow</span>

[ARKit iPhone]──LiveLink──→[Face Retarget]
[VICON Suit]───LiveLink──→[Body Retarget]
                                 │
                          [VRM Character]
                                 │
                    ┌────────────┼────────────┐
                [Camera 1]  [Camera 2]  [Camera 3]
                    │            │            │
              [SceneCapture + PostProcess + DOF]
                    │            │            │
                    └────────────┼────────────┘
                          [NDI Compositor]
                                 │
                          [NDI Output]──→ OBS/vMix`
    },
    csharp: {
        label: 'DeepNestPort — Nesting Algorithm',
        lang: 'C#',
        desc: '2D 파트 네스팅(배치 최적화) 알고리즘 C# 포팅. NFP(No-Fit Polygon) 기반 최적 배치',
        code: `<span class="code-key">public</span> <span class="code-type">NestResult</span> <span class="code-fn">PlaceParts</span>(<span class="code-type">List</span>&lt;<span class="code-type">NFP</span>&gt; parts, <span class="code-type">Sheet</span> sheet) {
    <span class="code-key">foreach</span> (<span class="code-key">var</span> part <span class="code-key">in</span> parts.<span class="code-fn">OrderByDescending</span>(p =&gt; p.Area)) {
        <span class="code-type">double</span> minX = <span class="code-type">double</span>.MaxValue;
        <span class="code-type">Point</span> bestPos = <span class="code-key">null</span>;

        <span class="code-comment">// NFP 순회: 겹치지 않는 최적 위치 탐색</span>
        <span class="code-key">foreach</span> (<span class="code-key">var</span> nfp <span class="code-key">in</span> <span class="code-fn">ComputeNFPs</span>(placed, part)) {
            <span class="code-key">foreach</span> (<span class="code-key">var</span> pt <span class="code-key">in</span> nfp.Points) {
                <span class="code-key">if</span> (pt.X &lt; minX &amp;&amp; <span class="code-fn">IsInsideSheet</span>(pt, sheet)) {
                    minX = pt.X;
                    bestPos = pt;
                }
            }
        }
        <span class="code-key">if</span> (bestPos != <span class="code-key">null</span>) placed.<span class="code-fn">Add</span>(part.<span class="code-fn">Place</span>(bestPos));
    }
}`
    },
    js: {
        label: 'Portfolio — Canvas Particle System',
        lang: 'JavaScript',
        desc: '마우스 반응형 파티클 시스템. 반발 + 접선 궤도 물리, 그라디언트 연결선 실시간 렌더링',
        code: `<span class="code-fn">update</span>() {
    <span class="code-key">const</span> dx = <span class="code-key">this</span>.x - mouse.x;
    <span class="code-key">const</span> dy = <span class="code-key">this</span>.y - mouse.y;
    <span class="code-key">const</span> dist = <span class="code-type">Math</span>.<span class="code-fn">sqrt</span>(dx * dx + dy * dy);

    <span class="code-key">if</span> (dist &lt; MOUSE_RADIUS) {
        <span class="code-key">const</span> force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        <span class="code-key">const</span> angle = <span class="code-type">Math</span>.<span class="code-fn">atan2</span>(dy, dx);
        <span class="code-comment">// 반발력 + 접선 궤도 (angle + PI/2)</span>
        <span class="code-key">this</span>.vx += <span class="code-type">Math</span>.<span class="code-fn">cos</span>(angle) * force * <span class="code-num">0.02</span>
                 + <span class="code-type">Math</span>.<span class="code-fn">cos</span>(angle + <span class="code-num">1.57</span>) * force * <span class="code-num">0.008</span>;
        <span class="code-key">this</span>.vy += <span class="code-type">Math</span>.<span class="code-fn">sin</span>(angle) * force * <span class="code-num">0.02</span>
                 + <span class="code-type">Math</span>.<span class="code-fn">sin</span>(angle + <span class="code-num">1.57</span>) * force * <span class="code-num">0.008</span>;
    }
    <span class="code-key">this</span>.vx *= <span class="code-num">0.99</span>; <span class="code-comment">// damping</span>
    <span class="code-key">this</span>.vy *= <span class="code-num">0.99</span>;
}`
    },
    dx12: {
        label: 'DNABLE — Custom Render Pipeline',
        lang: 'Workflow',
        desc: 'UE5 엔진 소스 수정을 통한 커스텀 렌더 파이프라인. Shading Model 추가 + Tonemapper 교체',
        code: `<span class="code-comment">// Engine Source Modification Pipeline</span>

ShadingCommon.ush  → SHADINGMODELID_TOON 추가
DeferredShadingCommon.ush → GBuffer Encoding
ToonShadingModel.ush → NPR/PBR 하이브리드 BxDF

<span class="code-comment">// Custom Post Process</span>
GranTurismo Tonemapper (GT Tonemap)
 ├─ P  = <span class="code-num">1.0</span>   (max brightness)
 ├─ a  = <span class="code-num">1.0</span>   (contrast)
 ├─ m  = <span class="code-num">0.22</span>  (linear section start)
 ├─ l  = <span class="code-num">0.4</span>   (linear section length)
 └─ c,b = <span class="code-num">1.33</span>, <span class="code-num">0.0</span>

<span class="code-comment">// 결과: 영화적 톤 + 셀 셰이딩 공존</span>`
    },
    lumen: {
        label: 'Virtual Production Lighting',
        lang: 'Workflow',
        desc: 'Lumen GI + Hardware Ray Tracing 조합으로 실시간 가상 프로덕션 라이팅 구현',
        code: `<span class="code-comment">// Lumen Global Illumination Setup</span>

r.Lumen.Enabled = <span class="code-num">1</span>
r.Lumen.TraceMeshSDFs = <span class="code-num">1</span>
r.Lumen.HardwareRayTracing = <span class="code-num">1</span>

<span class="code-comment">// SceneCapture 연동</span>
CaptureSource = SCS_FinalToneCurveHDR
bUseRayTracingIfEnabled = <span class="code-key">true</span>
TargetGamma = <span class="code-num">2.2</span>

<span class="code-comment">// 결과물</span>
SceneCapture → RenderTarget (1920x1080)
           → PostProcess (DOF + Bloom)
           → NDI Output (실시간 방송)`
    },
    rt: {
        label: 'Ray Traced Scene Capture',
        lang: 'C++',
        desc: 'Ray Tracing이 적용된 SceneCapture 컴포넌트. DOF, HDR 톤매핑, 블룸 포함',
        code: `<span class="code-type">URTSceneCaptureComponent</span>::<span class="code-fn">URTSceneCaptureComponent</span>() {
    CaptureSource = <span class="code-type">ESceneCaptureSource</span>::SCS_FinalToneCurveHDR;

    PostProcessSettings.bOverride_DepthOfFieldFstop = <span class="code-key">true</span>;
    PostProcessSettings.bOverride_DepthOfFieldFocalDistance = <span class="code-key">true</span>;
    PostProcessSettings.AutoExposureBias = <span class="code-num">1.0f</span>;
    bUseRayTracingIfEnabled = <span class="code-key">true</span>;
    ShowFlags.MotionBlur = <span class="code-key">true</span>;

    RenderTarget-&gt;<span class="code-fn">InitCustomFormat</span>(
        <span class="code-num">1920</span>, <span class="code-num">1080</span>,
        <span class="code-type">EPixelFormat</span>::PF_B8G8R8A8, <span class="code-key">false</span>);
    RenderTarget-&gt;TargetGamma = <span class="code-num">2.2f</span>;
    RenderTarget-&gt;bNeedsTwoCopies = <span class="code-key">true</span>;
}`
    },
    mobu: {
        label: 'DNABLE — MotionBuilder Retarget',
        lang: 'Workflow',
        desc: 'MotionBuilder에서 VICON 모캡 데이터를 VRM 캐릭터에 리타겟팅하는 파이프라인',
        code: `<span class="code-comment">// MotionBuilder Retarget Pipeline</span>

[VICON Optical Markers]
        │
   Labeling → Skeleton Solve
        │
  [Actor (Source)]
        │
  Characterize → T-Pose Mapping
        │
  [Character (Target: VRM)]
        │
  Retarget Setting
   ├─ Reach T/R per bone
   ├─ Pull / Stiffness
   └─ IK Blend (Hands/Feet)
        │
  Plot to Control Rig
        │
  FBX Export → UE5 LiveLink`
    },
    vicon: {
        label: 'DNABLE — Full Body Tracking',
        lang: 'Workflow',
        desc: 'VICON 광학식 모션캡처 + ARKit 페이셜을 결합한 풀바디 트래킹 시스템',
        code: `<span class="code-comment">// VICON + ARKit Hybrid MoCap System</span>

[VICON Vantage Cameras x12]
   ├─ 120fps Optical Tracking
   ├─ Marker Set: 53 points
   └─ Shogun Live → Skeleton Stream
          │
[ARKit TrueDepth Camera]
   ├─ 60fps Facial Tracking
   ├─ 52 Blend Shapes
   └─ LiveLink Face → BS Stream
          │
     ┌────┴────┐
  [Body Data] [Face Data]
     └────┬────┘
    UE5 LiveLink
          │
   [VRM Character]
    Full Body + Face Animation`
    },
    livelink: {
        label: 'LiveLink Camera Control',
        lang: 'C++',
        desc: 'LiveLink 데이터를 CineCamera에 실시간 적용. Mars Mode로 가상 카메라 제어',
        code: `<span class="code-type">void</span> <span class="code-type">ULiveLinkCameraController</span>::<span class="code-fn">SetMarsMode</span>(
    <span class="code-type">bool</span> MarsModeOn,
    <span class="code-type">AA_MarsPoint</span>* InMarsPoint,
    <span class="code-type">TSubclassOf</span>&lt;<span class="code-type">ULiveLinkRole</span>&gt; InRoleClass,
    <span class="code-type">UCineCameraComponent</span>* InCamera) {

    MarsPoint = InMarsPoint;
    MarsPoint-&gt;SaveMars.MarsMode = MarsModeOn;
    MarsMode = MarsModeOn;
    bAutoActivate = MarsModeOn;
    bEvaluateLiveLink = MarsModeOn;

    <span class="code-comment">// LiveLink Role → CineCamera 바인딩</span>
    <span class="code-fn">SetControlledComponent</span>(InRoleClass, InCamera);
}`
    },
    bmd: {
        label: 'BlackMagic Video I/O',
        lang: 'Workflow',
        desc: 'BlackMagic DeckLink을 통한 외부 비디오 입출력. SDI/HDMI 캡처 및 키/필 출력',
        code: `<span class="code-comment">// BlackMagic DeckLink Integration</span>

<span class="code-comment">[Input]</span>
SDI/HDMI Camera → DeckLink Capture
              → MediaTexture (UE5)
              → Virtual Set Background

<span class="code-comment">[Output]</span>
UE5 Render → DeckLink Output
   ├─ Fill: Final Composite (1080p60)
   ├─ Key:  Alpha Matte
   └─ Format: YUV 4:2:2 10bit

<span class="code-comment">[Sync]</span>
Genlock Reference → Frame-accurate sync
DeckLink + NDI 동시 출력 가능`
    },
    claude: {
        label: 'Portfolio — AI-Assisted Dev',
        lang: 'Workflow',
        desc: 'Claude Code를 활용한 AI 페어 프로그래밍. 이 포트폴리오도 Claude Code로 제작',
        code: `<span class="code-comment">// AI-Assisted Development Workflow</span>

[Requirements] → Claude Code CLI
     │
  Architecture Design
  Code Generation
  Real-time Debugging
     │
[This Portfolio]
  ├─ Canvas Particle Renderer
  ├─ SHA-256 Password Lock
  ├─ Google Apps Script Backend
  ├─ Telegram Bot Integration
  └─ Responsive Design

<span class="code-comment">// 활용 영역</span>
UE5 C++ Boilerplate 생성
Python Tool 자동화 스크립트
Web Frontend/Backend 풀스택`
    },
    comfyui: {
        label: 'DNABLE — AI Image Pipeline',
        lang: 'Workflow',
        desc: 'ComfyUI 노드 기반 AI 이미지 생성 파이프라인. 캐릭터 텍스처/배경 자동 생성',
        code: `<span class="code-comment">// ComfyUI Node Workflow</span>

[Checkpoint: AnimeModel_v3]
        │
  [KSampler]
   ├─ Steps: <span class="code-num">28</span>
   ├─ CFG: <span class="code-num">7.0</span>
   ├─ Sampler: euler_ancestral
   └─ Scheduler: karras
        │
  [ControlNet]
   ├─ OpenPose (캐릭터 포즈)
   ├─ Depth (깊이맵)
   └─ Canny (엣지 가이드)
        │
  [VAE Decode] → [Upscale 2x]
        │
  [Face Restore] → [Final Output]
        │
  UE5 Texture Import (자동화)`
    },
    sd: {
        label: 'DNABLE — Character Texture Gen',
        lang: 'Workflow',
        desc: 'Stable Diffusion + LoRA로 버추얼 아이돌 캐릭터 텍스처 및 의상 생성',
        code: `<span class="code-comment">// Stable Diffusion Texture Pipeline</span>

[Base Model] + [Character LoRA]
        │
  Prompt Engineering
   ├─ Positive: character sheet, T-pose,
   │   cel shading, clean lines
   └─ Negative: blurry, deformed
        │
  img2img (기존 텍스처 기반 변형)
   ├─ Denoising: <span class="code-num">0.45</span>
   └─ ControlNet: Normal Map guide
        │
  [Post-Process]
   ├─ 배경 제거 (rembg)
   ├─ UV 영역 크롭
   └─ PBR 텍스처 분리
        │
  UE5 Material Import`
    },
    n8n: {
        label: 'DNABLE — Automation Pipeline',
        lang: 'Workflow',
        desc: 'n8n 기반 자동화 워크플로우. 빌드 알림, 에셋 동기화, 슬랙 연동',
        code: `<span class="code-comment">// n8n Automation Workflows</span>

<span class="code-comment">[1] Build Notification</span>
UE5 Build Complete
  → Webhook Trigger
  → Parse Build Log
  → Telegram/Slack Alert
  → Google Sheets Log

<span class="code-comment">[2] Asset Sync</span>
Google Drive Watch
  → New Asset Detected
  → Download + Convert
  → Git Commit + Push
  → Team Notification

<span class="code-comment">[3] Daily Report</span>
Cron (09:00 KST)
  → GitHub API (commits)
  → Jira API (tickets)
  → Summary → Slack Channel`
    },
    react: {
        label: 'SoulxHomePage — Company Website',
        lang: 'TypeScript',
        desc: 'React + TypeScript 기반 회사 웹사이트. 반응형 디자인 + 다국어 지원',
        code: `<span class="code-key">const</span> <span class="code-fn">SoulxHomePage</span>: <span class="code-type">FC</span> = () =&gt; {
    <span class="code-key">const</span> [locale, setLocale] = <span class="code-fn">useState</span>&lt;<span class="code-str">'ko'</span>|<span class="code-str">'en'</span>|<span class="code-str">'ja'</span>&gt;(<span class="code-str">'ko'</span>);
    <span class="code-key">const</span> sections = <span class="code-fn">useMemo</span>(() =&gt; [
        { id: <span class="code-str">'hero'</span>,     component: &lt;<span class="code-type">Hero</span> /&gt; },
        { id: <span class="code-str">'product'</span>,  component: &lt;<span class="code-type">ProductShowcase</span> /&gt; },
        { id: <span class="code-str">'tech'</span>,     component: &lt;<span class="code-type">TechStack</span> /&gt; },
        { id: <span class="code-str">'team'</span>,     component: &lt;<span class="code-type">TeamMembers</span> /&gt; },
        { id: <span class="code-str">'contact'</span>,  component: &lt;<span class="code-type">ContactForm</span> /&gt; },
    ], [locale]);

    <span class="code-key">return</span> (
        &lt;<span class="code-type">LocaleContext.Provider</span> value={locale}&gt;
            {sections.<span class="code-fn">map</span>(s =&gt;
                &lt;<span class="code-type">LazySection</span> key={s.id} id={s.id}&gt;
                    {s.component}
                &lt;/<span class="code-type">LazySection</span>&gt;)}
        &lt;/<span class="code-type">LocaleContext.Provider</span>&gt;
    );
};`
    },
    redux: {
        label: 'App Launcher — State Management',
        lang: 'TypeScript',
        desc: 'Redux 기반 앱 상태 관리. 다운로드 진행률, 설치 상태, 사용자 설정 관리',
        code: `<span class="code-key">interface</span> <span class="code-type">AppState</span> {
    type: <span class="code-type">SyncStatus</span>;  <span class="code-comment">// downloading | installing | done</span>
    isInstalled: <span class="code-type">boolean</span>;
    installPath: <span class="code-type">string</span>;
    progress: { downloaded: <span class="code-type">number</span>; total: <span class="code-type">number</span> };
    programSize: { downloadSize: <span class="code-type">string</span>; installSize: <span class="code-type">string</span> };
}

<span class="code-key">const</span> appReducer = (<span class="code-key">state</span>, action) =&gt; {
    <span class="code-key">switch</span> (action.type) {
        <span class="code-key">case</span> <span class="code-str">'SET_CONFIGS'</span>:
            <span class="code-key">return</span> { ...state, ...action.payload };
        <span class="code-key">case</span> <span class="code-str">'UPDATE_PROGRESS'</span>:
            <span class="code-key">return</span> { ...state, progress: action.payload };
        <span class="code-key">case</span> <span class="code-str">'INSTALL_COMPLETE'</span>:
            <span class="code-key">return</span> { ...state, type: SyncStatus.done,
                     isInstalled: <span class="code-key">true</span> };
    }
};`
    },
    threejs: {
        label: 'BabylonJS — 3D Web Viewer',
        lang: 'TypeScript',
        desc: 'BabylonJS 기반 3D 웹 뷰어. Matterport SDK 연동으로 공간 시각화',
        code: `<span class="code-key">const</span> <span class="code-fn">initScene</span> = <span class="code-key">async</span> (canvas: <span class="code-type">HTMLCanvasElement</span>) =&gt; {
    <span class="code-key">const</span> engine = <span class="code-key">new</span> <span class="code-type">Engine</span>(canvas, <span class="code-key">true</span>);
    <span class="code-key">const</span> scene = <span class="code-key">new</span> <span class="code-type">Scene</span>(engine);

    <span class="code-comment">// PBR Environment</span>
    scene.environmentTexture = <span class="code-type">CubeTexture</span>
        .<span class="code-fn">CreateFromPrefilteredData</span>(envUrl, scene);

    <span class="code-comment">// Matterport SDK 공간 데이터 로드</span>
    <span class="code-key">const</span> sdk = <span class="code-key">await</span> <span class="code-fn">connectSdk</span>(iframeEl);
    <span class="code-key">const</span> modelData = <span class="code-key">await</span> sdk.Model.<span class="code-fn">getData</span>();

    <span class="code-comment">// 3D 공간 메쉬 생성</span>
    modelData.sweeps.<span class="code-fn">forEach</span>(sweep =&gt; {
        <span class="code-key">const</span> marker = <span class="code-type">MeshBuilder</span>.<span class="code-fn">CreateSphere</span>(
            sweep.id, { diameter: <span class="code-num">0.3</span> }, scene);
        marker.position = <span class="code-key">new</span> <span class="code-type">Vector3</span>(...sweep.position);
    });

    engine.<span class="code-fn">runRenderLoop</span>(() =&gt; scene.<span class="code-fn">render</span>());
};`
    },
    aws: {
        label: 'Cloud Infrastructure',
        lang: 'Workflow',
        desc: 'AWS 기반 서비스 인프라. EC2 + S3 + CloudFront 구성',
        code: `<span class="code-comment">// AWS Infrastructure</span>

[CloudFront CDN]
      │
  [S3 Bucket]
   ├─ App Installer (.zip)
   ├─ Patch Files (delta)
   └─ Static Assets

[EC2 Instance]
   ├─ Download Server (:4000)
   ├─ Version API
   └─ License Validation

<span class="code-comment">// Deployment Pipeline</span>
UE5 Package Build
  → ZIP Compress
  → S3 Upload (aws cli)
  → CloudFront Invalidation
  → Launcher Auto-Update Trigger`
    },
    git: {
        label: 'DNABLE — Git Branch Strategy',
        lang: 'Workflow',
        desc: 'UE5 대규모 프로젝트 Git 브랜치 전략. Git LFS + 브랜치 정책',
        code: `<span class="code-comment">// Git Branch Strategy (UE5 Project)</span>

main ──────────────────────────────→
  │
  ├─ develop ──────────────────────→
  │    ├─ feature/toon-shader
  │    ├─ feature/ndi-output
  │    ├─ feature/arkit-mocap
  │    └─ fix/arm-collision
  │
  └─ release/1.0 ─────────────────→

<span class="code-comment">// Git LFS Tracking</span>
*.uasset, *.umap, *.fbx, *.png
*.wav, *.mp4, *.exr

<span class="code-comment">// Commit Convention</span>
[Feature] Add toon shading model
[Fix] Resolve arm IK collision
[Shader] Update SDF face shadow`
    },
    svn: {
        label: 'DNABLE — Perforce/SVN Asset Pipeline',
        lang: 'Workflow',
        desc: 'UE5 바이너리 에셋 관리를 위한 SVN/Perforce 병행 운용',
        code: `<span class="code-comment">// Asset Version Control Strategy</span>

[Git] ← Source Code (.cpp, .h, .cs)
       ← Configs (.ini, .json)
       ← Shaders (.usf, .ush)

[SVN/Perforce] ← Binary Assets
   ├─ Content/Characters/   (*.uasset)
   ├─ Content/Maps/         (*.umap)
   ├─ Content/Textures/     (*.png, *.exr)
   ├─ Content/Animations/   (*.fbx)
   └─ Content/Audio/        (*.wav)

<span class="code-comment">// Lock 정책</span>
*.umap → Exclusive Lock (맵 충돌 방지)
*.uasset → Advisory Lock`
    },
    steam: {
        label: 'Steam Distribution',
        lang: 'Workflow',
        desc: 'Steam 빌드 및 배포 파이프라인. Steamworks SDK 연동',
        code: `<span class="code-comment">// Steam Build & Deploy Pipeline</span>

[UE5 Package]
  → Shipping Build (Win64)
  → Steam Content Builder
      │
  app_build.vdf
   ├─ AppID: <span class="code-num">XXXXXX</span>
   ├─ Depot: content\\*
   └─ Branch: default / beta

<span class="code-comment">// Steamworks Integration</span>
SteamAPI_Init()
  ├─ Achievement Unlock
  ├─ Cloud Save (UserData)
  ├─ Workshop (UGC)
  └─ Rich Presence

<span class="code-comment">// Deploy</span>
steamcmd +login +run_app_build
  → SteamPipe Upload
  → Set Live Branch
  → Release Note 작성`
    },
    hlsl: {
        label: 'DNABLE — Custom Toon Shader',
        lang: 'HLSL',
        desc: 'Anisotropy 값으로 NPR(셀 셰이딩)과 PBR(물리 기반 렌더링)을 실시간 블렌딩하는 커스텀 BxDF',
        code: `<span class="code-type">FDirectLighting</span> <span class="code-fn">SelShaderBxDF</span>(<span class="code-type">FGBufferData</span> GBuffer, <span class="code-type">half3</span> N, V, L,
                              <span class="code-type">float</span> Falloff, <span class="code-type">half</span> NoL) {
    <span class="code-type">BxDFContext</span> Context;
    Init(Context, N, V, L);
    Context.NoV = <span class="code-fn">saturate</span>(<span class="code-fn">abs</span>(Context.NoV) + <span class="code-num">1e-5</span>);

    <span class="code-comment">// NPR: Raw NoL for cel shading</span>
    Lighting.Diffuse = Falloff * NoL;

    <span class="code-comment">// PBR: DiffuseColor/PI + GGX Specular</span>
    <span class="code-type">float3</span> PBRDiffuse = FalloffColor * GBuffer.DiffuseColor * TOON_INV_PI;
    <span class="code-type">float3</span> PBRSpecular = FalloffColor * <span class="code-fn">CalculatePBRSpecular</span>(
        GBuffer.Roughness, GBuffer.Metallic, GBuffer.BaseColor, N, V, L);

    <span class="code-comment">// Anisotropy 기반 NPR ↔ PBR 블렌드</span>
    <span class="code-type">half</span> Blend = <span class="code-fn">saturate</span>(GBuffer.Anisotropy);
    <span class="code-key">return</span> <span class="code-fn">lerp</span>(NPRResult, PBRResult, Blend);
}`
    },
    cpp: {
        label: 'DNABLE — DeckLink Multi-Channel Output',
        lang: 'C++',
        desc: 'DeckLink SDK 직접 연동 4채널 SDI 동시 출력. 채널별 독립 RenderTarget + Genlock 프레임 동기화',
        code: `<span class="code-type">void</span> <span class="code-type">UBroadcastOutputManager</span>::<span class="code-fn">InitializeChannels</span>(
    <span class="code-type">int32</span> NumChannels) {
    <span class="code-key">for</span> (<span class="code-type">int32</span> i = <span class="code-num">0</span>; i &lt; NumChannels; ++i) {
        <span class="code-type">FOutputChannel</span>&amp; Ch = OutputChannels.<span class="code-fn">AddDefaulted_GetRef</span>();
        Ch.DeviceIndex = i;

        <span class="code-comment">// 채널별 독립 RenderTarget 생성</span>
        Ch.RenderTarget = <span class="code-fn">NewObject</span>&lt;<span class="code-type">UTextureRenderTarget2D</span>&gt;();
        Ch.RenderTarget-&gt;<span class="code-fn">InitCustomFormat</span>(
            Resolutions[i].X, Resolutions[i].Y,
            <span class="code-type">EPixelFormat</span>::PF_B8G8R8A8, <span class="code-key">false</span>);

        <span class="code-comment">// Genlock Reference 프레임 동기화</span>
        <span class="code-key">if</span> (bUseGenlock &amp;&amp; GenlockSource) {
            Ch.SyncMode = <span class="code-type">EDeckLinkSync</span>::Genlock;
            Ch.ReferenceSource = GenlockSource;
        }

        <span class="code-comment">// DeckLink SDK Output 초기화</span>
        Ch.DeckLinkOutput = <span class="code-fn">CreateDeckLinkOutput</span>(i);
        Ch.DeckLinkOutput-&gt;<span class="code-fn">EnableVideoOutput</span>(
            bmdModeHD1080p60, bmdVideoOutputFlagDefault);
    }
}`
    },
    shading: {
        label: 'GPU Color Conversion',
        lang: 'HLSL',
        desc: 'NDI 방송 송출을 위한 BGRA → UYVY 실시간 GPU 색공간 변환 (4:2:2 크로마 서브샘플링)',
        code: `<span class="code-type">void</span> <span class="code-fn">NDIIOBGRAtoUYVYPS</span>(<span class="code-type">float4</span> InPosition : SV_POSITION,
                       <span class="code-type">float2</span> InUV : TEXCOORD0,
                       <span class="code-key">out</span> <span class="code-type">float4</span> OutColor : SV_Target0) {
    <span class="code-type">float3x3</span> RGBToYCbCrMat = {
        <span class="code-num">0.183</span>,  <span class="code-num">0.614</span>,  <span class="code-num">0.062</span>,
       <span class="code-num">-0.101</span>, <span class="code-num">-0.339</span>,  <span class="code-num">0.439</span>,
        <span class="code-num">0.439</span>, <span class="code-num">-0.399</span>, <span class="code-num">-0.040</span>  };

    <span class="code-comment">// 인접 2픽셀 샘플링 → YCbCr 변환</span>
    <span class="code-type">float3</span> YUV0 = <span class="code-fn">mul</span>(RGBToYCbCrMat, RGB0) + RGBToYCbCrVec;
    <span class="code-type">float3</span> YUV1 = <span class="code-fn">mul</span>(RGBToYCbCrMat, RGB1) + RGBToYCbCrVec;

    OutColor.xz = (YUV0.zy + YUV1.zy) / <span class="code-num">2.0</span>;  <span class="code-comment">// Cb, Cr 평균</span>
    OutColor.y  = YUV0.x;   <span class="code-comment">// Y0</span>
    OutColor.w  = YUV1.x;   <span class="code-comment">// Y1</span>
}`
    },
    arkit: {
        label: 'DNABLE — ARKit Facial MoCap',
        lang: 'C++',
        desc: '52개 ARKit Blend Shape 실시간 리매핑. 스레드 안전 스냅샷 패턴으로 데이터 경합 방지',
        code: `<span class="code-type">void</span> <span class="code-type">UARKitFacialPreProcessor</span>::<span class="code-fn">UpdateWorkerSnapshot</span>() {
    <span class="code-comment">// Atomic swap — 이전 워커는 기존 데이터로 계속 동작</span>
    <span class="code-type">TSharedPtr</span>&lt;<span class="code-type">FWorker</span>, <span class="code-type">ESPMode</span>::ThreadSafe&gt; NewWorker =
        <span class="code-fn">MakeShared</span>&lt;<span class="code-type">FWorker</span>, <span class="code-type">ESPMode</span>::ThreadSafe&gt;();

    <span class="code-key">for</span> (<span class="code-key">const</span> <span class="code-type">FName</span>&amp; Name : <span class="code-fn">GetARKitBlendShapeNames</span>()) {
        <span class="code-key">const</span> <span class="code-type">FRemap</span>* Data = RemapSettings-&gt;<span class="code-fn">GetBlendShapeRemap</span>(Name);
        <span class="code-key">if</span> (Data) NewWorker-&gt;Snapshot.<span class="code-fn">Add</span>(Name, *Data);
    }
    WorkerInstance = NewWorker;  <span class="code-comment">// 원자적 교체</span>
}

<span class="code-comment">// 커브 기반 리매핑 파이프라인</span>
Value *= RemapData-&gt;Multiplier;
Value += RemapData-&gt;Offset;
Value = <span class="code-fn">FMath::Clamp</span>(Value, MinLimit, MaxLimit);
<span class="code-key">if</span> (RemapData-&gt;bUseCurveRemap)
    Value = RemapData-&gt;RemapCurve.<span class="code-fn">Eval</span>(Value);`
    },
    ndi: {
        label: 'DNABLE — NDI Double-Buffer',
        lang: 'C++',
        desc: 'GPU→CPU 비동기 텍스처 리드백 이중 버퍼. 파이프라인 지연 최소화',
        code: `<span class="code-key">class</span> <span class="code-type">MappedTextureASyncSender</span> {
    <span class="code-type">MappedTexture</span> MappedTextures[<span class="code-num">2</span>];  <span class="code-comment">// 이중 버퍼</span>
    <span class="code-type">int32</span> CurrentIndex = <span class="code-num">0</span>;
<span class="code-key">public</span>:
    <span class="code-type">void</span> <span class="code-fn">Resolve</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
                 <span class="code-type">FRHITexture</span>* Source, <span class="code-key">const</span> <span class="code-type">FResolveRect</span>&amp; Rect);
    <span class="code-type">void</span> <span class="code-fn">Map</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
             <span class="code-type">int32</span>&amp; W, <span class="code-type">int32</span>&amp; H, <span class="code-type">int32</span>&amp; Stride);
    <span class="code-type">void</span> <span class="code-fn">Send</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
              <span class="code-type">NDIlib_send_instance_t</span> p_send,
              <span class="code-type">NDIlib_video_frame_v2_t</span>&amp; frame);
};

<span class="code-comment">// Letterbox / Pillarbox 비율 보정</span>
<span class="code-type">float</span> FrameRatio  = FrameSize.X / (<span class="code-type">float</span>)FrameSize.Y;
<span class="code-type">float</span> TargetRatio = TargetSize.X / (<span class="code-type">float</span>)TargetSize.Y;
<span class="code-key">if</span> (TargetRatio &gt; FrameRatio)
    NewSize.Y = <span class="code-fn">FMath::RoundToInt</span>(FrameSize.X / TargetRatio);`
    },
    audio: {
        label: 'NDI Audio Channel Mixing',
        lang: 'C++',
        desc: 'NDI 수신 오디오 채널 자동 다운믹스/업믹스. Float32 → Int16 변환 포함',
        code: `<span class="code-type">int32</span> <span class="code-fn">GeneratePCMData</span>(<span class="code-type">uint8</span>* PCMData, <span class="code-type">int32</span> SamplesNeeded) {
    <span class="code-fn">NDIlib_framesync_capture_audio</span>(p_framesync, &amp;audio_frame,
        requested_rate, <span class="code-num">0</span>, <span class="code-fn">FMath::Min</span>(available, requested));

    <span class="code-key">if</span> (req_ch &lt; audio_frame.no_channels) {
        <span class="code-comment">// 다운믹스: 초과 채널 → 기존 채널에 합산</span>
        <span class="code-key">for</span> (<span class="code-type">int32</span> src = req_ch; src &lt; no_ch; ++src)
            <span class="code-key">for</span> (<span class="code-type">int32</span> dst = <span class="code-num">0</span>; dst &lt; req_ch; ++dst)
                <span class="code-key">for</span> (<span class="code-type">int32</span> i = <span class="code-num">0</span>; i &lt; no_samples; ++i)
                    dst_data[i] += src_data[i];
    } <span class="code-key">else if</span> (req_ch &gt; audio_frame.no_channels) {
        <span class="code-comment">// 업믹스: 소스 채널 평균으로 빈 채널 채우기</span>
        sample_value /= audio_frame.no_channels;
        <span class="code-type">int16</span> sample = <span class="code-fn">FMath::Clamp</span>(
            <span class="code-fn">FMath::RoundToInt</span>(value * <span class="code-num">32767.0f</span>), INT16_MIN, INT16_MAX);
    }
}`
    },
    electron: {
        label: 'Electron App Launcher',
        lang: 'TypeScript',
        desc: 'IPC 기반 다운로드 → ZIP 압축해제 → 설치 파이프라인. 진행률 실시간 전송',
        code: `<span class="code-fn">ipcMain</span>.<span class="code-fn">handle</span>(<span class="code-str">'install-app'</span>, (event, configs) =&gt; {
    <span class="code-type">http</span>.<span class="code-fn">get</span>(<span class="code-str">'http://127.0.0.1:4000/download'</span>, res =&gt; {
        <span class="code-key">const</span> fileName = res.headers[<span class="code-str">'filename'</span>].<span class="code-fn">toString</span>();
        <span class="code-key">const</span> file = <span class="code-type">fs</span>.<span class="code-fn">createWriteStream</span>(fileName);
        configs.progress.total = <span class="code-fn">parseInt</span>(res.headers[<span class="code-str">'content-length'</span>]);
        res.<span class="code-fn">pipe</span>(file);

        <span class="code-comment">// 다운로드 진행률 → Renderer IPC 전송</span>
        res.<span class="code-fn">on</span>(<span class="code-str">'data'</span>, chunk =&gt; {
            configs.progress.downloaded += chunk.length;
            event.sender.<span class="code-fn">send</span>(<span class="code-str">'set-app-configs'</span>, configs);
        });

        file.<span class="code-fn">on</span>(<span class="code-str">'finish'</span>, () =&gt; {
            file.<span class="code-fn">close</span>();
            <span class="code-comment">// ZIP 압축해제 → 설치</span>
            <span class="code-key">let</span> zip = <span class="code-key">new</span> <span class="code-type">AdmZip</span>(fileName);
            zip.<span class="code-fn">extractAllToAsync</span>(installPath, <span class="code-key">true</span>);
            configs.isInstalled = <span class="code-key">true</span>;
            <span class="code-type">fs</span>.<span class="code-fn">unlink</span>(fileName, err =&gt; {});
        });
    });
});`
    },
    python: {
        label: 'DNABLE — Face Shadow SDF Generator',
        lang: 'Python',
        desc: 'Euclidean Distance Transform 기반 SDF 생성. 바이너리 마스크 → 부호 거리장 → 텍스처 변환',
        code: `<span class="code-key">from</span> scipy <span class="code-key">import</span> ndimage
<span class="code-key">import</span> numpy <span class="code-key">as</span> np

<span class="code-key">def</span> <span class="code-fn">generate_sdf</span>(binary, max_dist):
    <span class="code-comment"># Euclidean Distance Transform</span>
    dist_outside = ndimage.<span class="code-fn">distance_transform_edt</span>(~binary)
    dist_inside  = ndimage.<span class="code-fn">distance_transform_edt</span>(binary)

    <span class="code-comment"># SDF: positive outside, negative inside</span>
    sdf = dist_outside - dist_inside

    <span class="code-comment"># Normalize to 0-255 grayscale texture</span>
    sdf_norm = (sdf / max_dist) * <span class="code-num">127.5</span> + <span class="code-num">127.5</span>
    sdf_norm = np.<span class="code-fn">clip</span>(sdf_norm, <span class="code-num">0</span>, <span class="code-num">255</span>).<span class="code-fn">astype</span>(np.uint8)

    <span class="code-key">return</span> Image.<span class="code-fn">fromarray</span>(sdf_norm)`
    },
    notion: {
        label: 'Notion API Automation',
        lang: 'Python',
        desc: 'Notion API를 통한 일일/주간 자동 보고 시스템. Markdown → Notion 블록 변환 포함',
        code: `<span class="code-comment"># Notion Daily Report Automation</span>
<span class="code-key">POST</span> /v1/pages → Create daily report page
<span class="code-key">PATCH</span> /v1/blocks/{id}/children → Append blocks

<span class="code-comment"># Markdown → Notion Block Converter</span>
## Heading   → heading_2 block
- List item  → bulleted_list_item
**bold**     → rich_text annotations
\`code\`      → inline code annotation

<span class="code-comment"># Workflow</span>
/done command
  → Collect today's commits (3 repos)
  → Convert to Markdown summary
  → POST to Notion daily page
  → Duplicate detection by date + category
  → Batch block ops (delete + create, 100/req)

<span class="code-comment"># Weekly Report</span>
Aggregate daily pages → weekly_report page
  → Category tags: [렌더링] [방송] [파이프라인]
  → Auto-link to daily detail pages`
    },
    pipeline: {
        label: 'BGRITZSetup — Studio Pipeline',
        lang: 'Python / YAML',
        desc: 'UE5 커스텀 엔진 빌드 → 프리컴파일 배포까지 자동화하는 스튜디오 파이프라인 설계',
        code: `<span class="code-comment"># config.toml — 통합 설정</span>
<span class="code-key">[git]</span>
vanilla_repo = <span class="code-str">"DnableCorp/VanillaUnrealEngine"</span>  <span class="code-comment"># branch: 5.5</span>
engine_repo  = <span class="code-str">"DnableCorp/BGRITZ_Engine"</span>       <span class="code-comment"># branch: bgritz-main</span>
project_repo = <span class="code-str">"DnableCorp/BGRITZProject"</span>       <span class="code-comment"># branch: main</span>

<span class="code-key">[pipeline]</span>
<span class="code-comment"># Role-based Setup Automation</span>
setup-developer  = [00, 01, 02, 03, 04, 05, 06, 09]
setup-character  = [00A, 10, 05, 06s]  <span class="code-comment"># no maps</span>
setup-level      = [00A, 10, 05, 06s, 08]
setup-viewer     = [00A, 10, 05, 06s]

<span class="code-comment"># Step 04: Build Engine</span>
<span class="code-comment"># Step 09: Push to GitHub</span>
<span class="code-comment"># Step 10: Sync Prebuilt from SVN NAS</span>

<span class="code-comment"># release.yml — Tag-triggered Release</span>
<span class="code-key">on:</span> push: tags: [<span class="code-str">'v*'</span>]
  → Create ZIP → GitHub Release → NAS deploy`
    },
    gitflow: {
        label: 'BGRITZ Gitflow Strategy',
        lang: 'Git',
        desc: '3개 레포에 걸친 Gitflow 브랜치 전략 및 엔진 업스트림 병합 워크플로우',
        code: `<span class="code-comment">// Engine Branch Model</span>
bgritz-main ← 안정 빌드 (프리컴파일 배포 대상)
    ↑ merge
  dev ← 통합 개발 브랜치
    ↑ merge
  feature/hun, feature/sub ← 개발자별 피처 브랜치

<span class="code-comment">// Upstream Merge Workflow</span>
VanillaUnrealEngine (5.5) → vanilla-sync
    → vanilla-merge → BGRITZ_Engine (bgritz-main)
    → 충돌 해결: // BGRITZ Engine Start 마커 기준

<span class="code-comment">// Commit Convention (Korean Tags)</span>
[기능]  새 기능 추가
[수정]  버그 수정
[문서]  문서 업데이트
[리팩터] 구조 개선
[렌더링] 셰이더/파이프라인 변경

<span class="code-comment">// Engine Source Modification Marker</span>
<span class="code-key">// ----BGRITZ Engine Start 2026-03-10----</span>
  modified code here...
<span class="code-key">// ----BGRITZ Engine End----</span>`
    },
    ghactions: {
        label: 'GitHub Actions CI/CD',
        lang: 'YAML',
        desc: 'Tag 기반 릴리스 자동화 및 배포 파이프라인',
        code: `<span class="code-comment"># BGRITZSetup release.yml</span>
<span class="code-key">name:</span> Release
<span class="code-key">on:</span>
  push:
    tags: [<span class="code-str">'v*'</span>]

<span class="code-key">jobs:</span>
  release:
    runs-on: ubuntu-latest
    steps:
      - <span class="code-key">uses:</span> actions/checkout@v4
      - <span class="code-key">run:</span> |
          VERSION=\${GITHUB_REF#refs/tags/v}
          <span class="code-comment"># Bundle pipeline package</span>
          mkdir -p release &amp;&amp; cp -r src/ release/
          cp pyproject.toml config.toml release/
          zip -r BGRITZSetup-v\$VERSION.zip release/
      - <span class="code-key">uses:</span> softprops/action-gh-release@v2
        with:
          files: BGRITZSetup-*.zip
          generate_release_notes: <span class="code-num">true</span>`
    },
    docker: {
        label: 'Docker & Container Deployment',
        lang: 'Docker / Shell',
        desc: 'NAS TeamServer Docker 배포 및 AWS ECR/ECS 컨테이너 배포 경험',
        code: `<span class="code-comment"># TeamServer — NAS Docker Deployment</span>
<span class="code-key">FROM</span> php:8.2-apache
<span class="code-key">COPY</span> api.php /var/www/html/
<span class="code-key">RUN</span> a2enmod rewrite
<span class="code-key">EXPOSE</span> 80

<span class="code-comment"># docker-compose.yml</span>
<span class="code-key">services:</span>
  teamserver:
    build: .
    ports: [<span class="code-str">"8080:80"</span>]
    volumes:
      - ./passwd:/etc/svn/passwd
    logging:
      options:
        max-size: <span class="code-str">"10m"</span>
        max-file: <span class="code-str">"3"</span>

<span class="code-comment"># Deploy to Synology NAS</span>
deploy-to-nas.ps1 → docker build → docker push
  → ssh nas "docker-compose up -d"`
    },
    fastapi: {
        label: 'BGRITZSetup Dashboard',
        lang: 'Python',
        desc: 'FastAPI 기반 팀 대시보드 — 파이프라인 실행, 인증, 상태 관리',
        code: `<span class="code-comment"># bgritz/dashboard/main.py</span>
<span class="code-key">from</span> fastapi <span class="code-key">import</span> FastAPI, Depends
<span class="code-key">from</span> bgritz.core <span class="code-key">import</span> git_ops, svn_ops

app = FastAPI(title=<span class="code-str">"BGRITZ Dashboard"</span>)

<span class="code-key">@app.post</span>(<span class="code-str">"/api/auth/login"</span>)
<span class="code-key">async def</span> <span class="code-fn">login</span>(creds: LoginRequest):
    <span class="code-comment"># SVN passwd 검증 via TeamServer API</span>
    verified = <span class="code-key">await</span> teamserver.<span class="code-fn">verify</span>(creds)
    <span class="code-key">return</span> {<span class="code-str">"token"</span>: create_session(verified)}

<span class="code-key">@app.post</span>(<span class="code-str">"/api/pipeline/{step}"</span>)
<span class="code-key">async def</span> <span class="code-fn">run_step</span>(step: str, user=Depends(auth)):
    <span class="code-comment"># Execute pipeline step (00~10)</span>
    result = <span class="code-key">await</span> pipeline.<span class="code-fn">execute</span>(step, user)
    <span class="code-key">return</span> {<span class="code-str">"status"</span>: <span class="code-str">"ok"</span>, <span class="code-str">"log"</span>: result}`
    }
};
