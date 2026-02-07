![header](https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:06b6d4&height=250&section=header&text=kim98828&fontSize=50&fontColor=ffffff&fontAlignY=35&desc=Unreal%20Engine%20|%20AI%20|%20Web%20|%20Mobile%20Developer&descSize=20&descAlignY=55&animation=fadeIn)

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=%F0%9F%8E%AE+Game+Dev+%7C+%F0%9F%A4%96+AI+%7C+%F0%9F%8C%90+Web+%7C+%F0%9F%93%B1+Mobile;Building+Ideas+Into+Reality)](https://github.com/kim98828)

</div>

---

## :bust_in_silhouette: About Me

```yaml
Name: kim98828
Role: Full-Stack Developer & Game Developer
Interests:
  - Unreal Engine Game Development
  - AI / Machine Learning / ComfyUI Workflows
  - Web Frontend & Backend Development
  - Cross-Platform Mobile Apps
Currently Learning: AI-Powered Creative Tools
```

---

## :rocket: Tech Stack

<div align="center">

### :video_game: Game Engine
![Unreal Engine 5](https://img.shields.io/badge/Unreal%20Engine%205-0E1128?style=for-the-badge&logo=unrealengine&logoColor=white)
![Unity](https://img.shields.io/badge/Unity-000000?style=for-the-badge&logo=unity&logoColor=white)
![Blueprint](https://img.shields.io/badge/Blueprint-137CBD?style=for-the-badge&logo=unrealengine&logoColor=white)

### :computer: Languages
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![C#](https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=csharp&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HLSL](https://img.shields.io/badge/HLSL-5C2D91?style=for-the-badge&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### :art: Graphics / Rendering
![DirectX 12](https://img.shields.io/badge/DirectX%2012-217346?style=for-the-badge&logo=microsoft&logoColor=white)
![Lumen](https://img.shields.io/badge/Lumen-0E1128?style=for-the-badge&logo=unrealengine&logoColor=white)
![Ray Tracing](https://img.shields.io/badge/Ray%20Tracing-76B900?style=for-the-badge&logo=nvidia&logoColor=white)

### :movie_camera: Motion Capture / Broadcast
![MotionBuilder](https://img.shields.io/badge/MotionBuilder-0696D7?style=for-the-badge&logo=autodesk&logoColor=white)
![ARKit](https://img.shields.io/badge/ARKit-000000?style=for-the-badge&logo=apple&logoColor=white)
![VICON](https://img.shields.io/badge/VICON-1A1A1A?style=for-the-badge&logoColor=white)
![LiveLink](https://img.shields.io/badge/LiveLink-0E1128?style=for-the-badge&logo=unrealengine&logoColor=white)
![NDI](https://img.shields.io/badge/NDI-1B998B?style=for-the-badge&logoColor=white)
![BlackMagic](https://img.shields.io/badge/BlackMagic-1A1A1A?style=for-the-badge&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

### :robot: AI / Automation
![ComfyUI](https://img.shields.io/badge/ComfyUI-222222?style=for-the-badge&logoColor=white)
![Stable Diffusion](https://img.shields.io/badge/Stable%20Diffusion-412991?style=for-the-badge&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=anthropic&logoColor=white)

### :globe_with_meridians: Web
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)

### :wrench: Infra / Tools
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![SVN](https://img.shields.io/badge/SVN-809CC9?style=for-the-badge&logo=subversion&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Steam](https://img.shields.io/badge/Steam-000000?style=for-the-badge&logo=steam&logoColor=white)
![Visual Studio](https://img.shields.io/badge/Visual%20Studio-5C2D91?style=for-the-badge&logo=visualstudio&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)

</div>

---

## :fire: Code Highlights from Projects

### :art: Custom NPR/PBR Blend Toon Shader — DNABLE
Anisotropy 값으로 NPR(셀 셰이딩)과 PBR(물리 기반 렌더링)을 실시간 블렌딩하는 커스텀 셰이더. SDF 기반 얼굴 그림자 포함.
```hlsl
FDirectLighting SelShaderBxDF(FGBufferData GBuffer, half3 N, half3 V, half3 L,
                              float Falloff, half NoL, FAreaLight AreaLight, FShadowTerms Shadow)
{
    BxDFContext Context;
    Init(Context, N, V, L);
    Context.NoV = saturate(abs(Context.NoV) + 1e-5);

    FDirectLighting Lighting;
    Lighting.Diffuse = Falloff * NoL;

    float3 FalloffColor = AreaLight.FalloffColor * (Falloff * NoL);
    float3 PBRDiffuse = FalloffColor * GBuffer.DiffuseColor * TOON_INV_PI;
    float3 PBRSpecular = FalloffColor * CalculatePBRSpecular(
        GBuffer.Roughness, GBuffer.Metallic, GBuffer.BaseColor, N, V, L);
    Lighting.Specular = PBRDiffuse + PBRSpecular;
    return Lighting;
}

// Anisotropy로 NPR ↔ PBR 블렌드
half BlendFactor = saturate(GBuffer.Anisotropy);
half3 Result = lerp(NPRResult, PBRResult, BlendFactor);
```

---

### :movie_camera: BGRA → UYVY GPU Color Conversion
NDI 방송 송출을 위한 GPU 기반 실시간 색공간 변환 셰이더. 4:2:2 크로마 서브샘플링 처리.
```hlsl
void NDIIOBGRAtoUYVYPS(float4 InPosition : SV_POSITION,
                       float2 InUV : TEXCOORD0,
                       out float4 OutColor : SV_Target0)
{
    float3x3 RGBToYCbCrMat = {
        0.18300, 0.61398, 0.06201,
       -0.10101,-0.33899, 0.43900,
        0.43902,-0.39900,-0.04001
    };
    float3 RGBToYCbCrVec = { 0.06302, 0.50198, 0.50203 };

    // 인접 2픽셀 샘플링 → 크로마 평균
    float3 YUV0 = mul(RGBToYCbCrMat, RGB0) + RGBToYCbCrVec;
    float3 YUV1 = mul(RGBToYCbCrMat, RGB1) + RGBToYCbCrVec;

    OutColor.xz = (YUV0.zy + YUV1.zy) / 2.f;  // Cb, Cr 평균
    OutColor.y  = YUV0.x;                        // Y0
    OutColor.w  = YUV1.x;                        // Y1
}
```

---

### :arrows_counterclockwise: NDI Async Double-Buffer Streaming — DNABLE
GPU → CPU 비동기 텍스처 리드백을 이중 버퍼로 처리. 한 프레임이 전송되는 동안 다음 프레임을 준비하여 파이프라인 지연 최소화.
```cpp
class MappedTextureASyncSender {
    MappedTexture MappedTextures[2];
    int32 CurrentIndex = 0;
public:
    void Resolve(FRHICommandListImmediate& RHICmdList, FRHITexture* SourceTextureRHI,
                 const FResolveRect& Rect, const FResolveRect& DestRect);
    void Map(FRHICommandListImmediate& RHICmdList, int32& OutWidth, int32& OutHeight, int32& OutLineStride);
    void Send(FRHICommandListImmediate& RHICmdList, NDIlib_send_instance_t p_send_instance,
              NDIlib_video_frame_v2_t& p_video_data);
};
```

---

### :performing_arts: ARKit Facial MoCap Thread-Safe Preprocessing — DNABLE
52개 ARKit Blend Shape의 실시간 리매핑. 스레드 안전한 스냅샷 패턴으로 게임 스레드와 애니메이션 스레드 간 데이터 경합 방지.
```cpp
void UARKitFacialPreProcessor::UpdateWorkerSnapshot()
{
    // Atomic swap — 이전 워커는 기존 데이터로 계속 동작
    TSharedPtr<FARKitFacialPreProcessorWorker, ESPMode::ThreadSafe> NewWorker =
        MakeShared<FARKitFacialPreProcessorWorker, ESPMode::ThreadSafe>();

    for (const FName& BlendShapeName : FARKitBlendShapeHelper::GetARKitBlendShapeNames()) {
        const FFacialBlendShapeRemap* RemapData = RemapSettings->GetBlendShapeRemap(BlendShapeName);
        if (RemapData)
            NewWorker->RemapSettingsSnapshot.Add(BlendShapeName, *RemapData);
    }

    WorkerInstance = NewWorker;  // 원자적 교체
}

// 커브 기반 리매핑
Value *= RemapData->Multiplier;
Value += RemapData->Offset;
Value = FMath::Clamp(Value, RemapData->MinLimit, RemapData->MaxLimit);
if (RemapData->bUseCurveRemap && RemapData->RemapCurve.GetRichCurveConst())
    Value = RemapData->RemapCurve.GetRichCurveConst()->Eval(Value);
```

---

### :tv: DeckLink 4-Channel SDI Broadcast Output — DNABLE
DeckLink SDK 직접 연동 4채널 SDI 동시 출력. 채널별 독립 RenderTarget + Genlock 프레임 동기화.
```cpp
void UBroadcastOutputManager::InitializeChannels(int32 NumChannels) {
    for (int32 i = 0; i < NumChannels; ++i) {
        FOutputChannel& Ch = OutputChannels.AddDefaulted_GetRef();
        Ch.DeviceIndex = i;

        // 채널별 독립 RenderTarget 생성
        Ch.RenderTarget = NewObject<UTextureRenderTarget2D>();
        Ch.RenderTarget->InitCustomFormat(
            Resolutions[i].X, Resolutions[i].Y,
            EPixelFormat::PF_B8G8R8A8, false);

        // Genlock Reference 프레임 동기화
        if (bUseGenlock && GenlockSource) {
            Ch.SyncMode = EDeckLinkSync::Genlock;
            Ch.ReferenceSource = GenlockSource;
        }

        // DeckLink SDK Output 초기화
        Ch.DeckLinkOutput = CreateDeckLinkOutput(i);
        Ch.DeckLinkOutput->EnableVideoOutput(
            bmdModeHD1080p60, bmdVideoOutputFlagDefault);
    }
}
```

---

### :speaker: Intelligent Multi-Channel Audio Mixing
NDI 수신 오디오의 채널 수가 출력과 다를 때 자동으로 다운믹스/업믹스 처리. Float32 → Int16 변환 포함.
```cpp
// 다운믹스: 초과 채널을 기존 채널에 합산 후 정규화
for (int32 src = requested_no_channels; src < audio_frame.no_channels; ++src) {
    for (int32 dst = 0; dst < requested_no_channels; ++dst) {
        for (int32 i = 0; i < audio_frame.no_samples; ++i)
            dst_data[i] += src_data[i];
    }
}
// 업믹스: 소스 채널 평균으로 빈 채널 채우기
sample_value /= audio_frame.no_channels;
int16 sample = FMath::Clamp(FMath::RoundToInt(sample_value * 32767.0f), INT16_MIN, INT16_MAX);
```

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:06b6d4&height=150&section=footer)
