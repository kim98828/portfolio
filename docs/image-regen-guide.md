# 포트폴리오 이미지 재생성 가이드 (Gemini)

> 목적: `public/images/` 의 이미지에서 **실제 프로젝트·회사·개인 명칭을 익명화**하고, 뭉개진 원본 보드 스샷을 깔끔한 인포그래픽으로 교체한다.
> 사용법: 아래 프롬프트를 Google AI Studio / Gemini 앱에 붙여넣는다. **편집형**은 원본 이미지를 첨부하고, **재생성형**은 프롬프트만 붙여넣는다.
> 권장 모델: **Nano Banana Pro (Gemini 3 Pro Image)** — 한글 텍스트·인포그래픽 품질이 가장 좋음. 일반 모델은 한글이 깨질 수 있으니 결과의 글자를 반드시 확인.
> 출력 후: PNG로 받은 뒤 `public/images/<원래파일명>.webp` 로 교체 (webp 변환은 sharp로 처리 가능 — 아래 마지막 섹션 참고).

---

## 🔑 명칭 매핑 (모든 이미지 공통 — 반드시 적용)

| 실제 명칭 (이미지에 박힌 것) | → 교체 표기 |
|------------------------------|-------------|
| `XROOM`, `XAM` | **XR 프로덕션** (XAM은 "실시간 협업 모듈" 또는 생략) |
| `SoulX`, `Souix`, `소울엑스` | **XR 프로덕션** (초기 스튜디오 맥락) |
| `BGRITZ`, `BGR1TZ`, `BEGRITZ` | **버추얼 아이돌 프로젝트** |
| `DNABLE`, `디네이블`, `DnableCorp` | **버추얼 아이돌 프로젝트** |
| 엔진 수정 마커 `// BGRITZ Engine Start/End` | **`// Custom Engine Start/End`** |
| `김민섭` (실명), `kafues511` (깃허브 핸들) | **완전 삭제** (표시하지 않음) |
| `HeavenWave` 등 내부 코드네임 | **삭제 / 일반 명칭** |
| `localhost:8081`, IP, 실제 저장소 경로, 브라우저 탭 | **삭제** |
| 실제 인물 얼굴 사진 (보드/썸네일) | **삭제 / 일러스트로 대체** |

> 유지해도 되는 것: `UE5`, `NDI`, `DeckLink`, `SDI`, `SRT`, `OSC`, `WebRTC`, `Lumen`, `Notion`, `n8n`, `Epic`, `Claude Code`, `CES 혁신상`, `에디슨 어워드` 등 공개 기술·제품·수상명.

---

## 🎨 공통 스타일 가이드 (재생성형에 붙여 쓰기)

```
스타일: 다크 네이비/딥블루 그라디언트 배경의 테크 인포그래픽.
발광하는 아웃라인 아이콘 + 플랫/아이소메트릭 일러스트. 부드러운 글로우.
라벨은 한글 메인 + 영어 보조(괄호). 큰 제목은 상단 중앙.
액센트 컬러: 입력=시안/블루, 출력·하드웨어=오렌지/앰버, 성공=그린, 핵심 모듈=퍼플, AI=핑크.
비율 16:9, 고해상도, 텍스트 매우 선명하고 정확하게. 여백 균형.
```

---

# A. 편집형 (원본 첨부 + 명칭만 교체)

> 공통 지시문: **"첨부한 인포그래픽의 레이아웃·색상·아이콘·구도·나머지 모든 텍스트를 그대로 유지하고, 아래 명칭만 정확히 교체해 다시 그려줘. 한글 폰트 스타일 유지, 글자 깨짐 없이."**

### 1. `problem-solving-map.webp`
```
첨부한 인포그래픽을 레이아웃·색상·아이콘·구도·나머지 텍스트 100% 그대로 유지하고,
다음 텍스트만 교체해서 다시 그려줘:
- 제목 "BGRITZ · XROOM 문제 해결의 거대한 여정" → "버추얼 아이돌 프로젝트 · XR 프로덕션 문제 해결의 거대한 여정"
- 중앙 "Problem Solving BGRITZ · XROOM Projects" → "Problem Solving Virtual Idol · XR Production"
- "Compositing: XROOM" → "Compositing: XR 프로덕션"
- "XROOM & DNABLE 공통" → "XR 프로덕션 & 버추얼 아이돌 공통"
- 본문의 "DNABLE" → "버추얼 아이돌", "XROOM" → "XR 프로덕션"
한글 폰트 스타일 유지, 글자 깨짐 없이.
```

### 2. `about-growth-map.webp`
```
첨부한 커리어 성장 인포그래픽을 레이아웃·색상·화살표·나머지 텍스트 그대로 유지하고,
다음만 교체:
- "System Architect (SoulX 후반 - 디네이블)" → "System Architect (XR 프로덕션 후반 - 버추얼 아이돌 프로젝트)"
- "Core Developer (SoulX - 1인 개발)" → "Core Developer (XR 프로덕션 - 1인 개발)"
- "Engineering Lead (디네이블 - 현재)" → "Engineering Lead (버추얼 아이돌 프로젝트 - 현재)"
- 나머지 "SoulX" → "XR 프로덕션", "디네이블" → "버추얼 아이돌 프로젝트"
"CES 혁신상", "에디슨 어워드", "파라과이" 등은 그대로 유지. 한글 글자 깨짐 없이.
```

### 3. `dnable-ai-automation.webp`
```
첨부한 "AI 코딩 자동화" 인포그래픽을 그대로 유지하고, 코드 패널의 엔진 마커만 교체:
- "// BGR1TZ Engine Start" → "// Custom Engine Start"
- "// BGR1TZ End YYYY-MM-DD" → "// Custom Engine End YYYY-MM-DD"
- "// BGR1TZ Engine End" → "// Custom Engine End"
나머지 텍스트·아이콘·레이아웃은 100% 동일. 한글 글자 깨짐 없이.
```

### 4. `dnable-prebuilt-engine.webp`
```
첨부한 "프리컴파일 엔진 배포" 인포그래픽을 그대로 유지하고, Source Code 패널만 교체:
- "// BGRITZ Engine Start" → "// Custom Engine Start"
- "// BGRITZ End YYYY-MM-DD" → "// Custom Engine End YYYY-MM-DD"
- "// BGRITZ Engine End" → "// Custom Engine End"
나머지는 100% 동일. 한글 글자 깨짐 없이.
```

### 5. `dnable-clearcoat-custom.webp`
```
첨부한 인포그래픽을 그대로 유지하고, 제목만 교체:
"DNABLE: Clear Coat 하이잭에서 커스텀 엔진까지"
→ "버추얼 아이돌 프로젝트: Clear Coat 하이잭에서 커스텀 엔진까지"
나머지 텍스트·다이어그램·색상 100% 동일. 한글 글자 깨짐 없이.
```

### 6. `xroom-multi-protocol.webp`
```
첨부한 인포그래픽을 그대로 유지하고 다음만 교체:
- 제목 "XROOM — 멀티 프로토콜 방송..." → "XR 프로덕션 — 멀티 프로토콜 방송..."
- "XROOM & DNABLE 공통" (두 곳) → "XR 프로덕션 & 버추얼 아이돌 공통"
나머지(칩, 아이콘, 좌측 항목) 100% 동일. 한글 글자 깨짐 없이.
```

### 7. `xroom-viewport-compositing.webp`
```
첨부한 인포그래픽을 그대로 유지하고 다음만 교체:
- 제목 "XROOM — Viewport Overload 기반 실시간 컴포지팅" → "XR 프로덕션 — Viewport Overload 기반 실시간 컴포지팅"
- "DNABLE 기술 확장 및 스튜디오 맵 준비" → "버추얼 아이돌 기술 확장 및 스튜디오 맵 준비"
나머지 100% 동일. 한글 글자 깨짐 없이.
```

### 8. `dnable-debug-ui.webp`
```
첨부한 언리얼 에디터 Debug Settings 패널 스크린샷을 그대로 유지하고 다음만 교체:
- 타이틀바/헤딩 "BGRITZ Debug Settings" → "Custom Debug Settings"
- "전체 BGRITZ 로그 활성화" → "전체 로그 활성화"
나머지 체크박스·항목·다크 UI 100% 동일. 글자 깨짐 없이.
```

> ✅ **손댈 필요 없음 (명칭 유출 없음):** `dnable-cell-shading.webp`, `dnable-ndi-sdi.webp`, `dnable-thread-safety.webp`
> ✅ **사이트 미사용 (무시):** `xroom-arch.webp`, `xroom-arch3.webp`, `xroomlite.webp`, `dnable-cell-shading.jpg`

---

# B. 재생성형 (프롬프트만 붙여넣기 — 뭉개진 보드 스샷 교체)

> 각 프롬프트 앞/뒤에 위 **공통 스타일 가이드**를 붙이면 톤이 일관됩니다. 실명·핸들·실제 얼굴은 절대 포함하지 말 것.

### 9. `dnable-dashboard.webp` → 파이프라인 대시보드 (웹 UI 목업)
```
다크 테마 웹 대시보드 UI 목업 인포그래픽. 제목 "파이프라인 대시보드 (Pipeline Dashboard)".
상단바: 로고 + "Build" "Push" "Refresh" "Docs" 버튼 (사용자명·실명 없음).
Branch Flow 섹션: main / dev / feature 브랜치 타임라인, 버전 태그 v0.0.1, "synced" 뱃지.
Pipeline Steps: 01 Sync / 02 Build / 03 Update / 04 Build / 09 Push / Upload 카드 그리드.
하단 Asset Audit: 큰 숫자 통계 (Assets, Violations, Prefix, Suffix, Folder) 배지.
깔끔한 다크 네이비 UI, 시안·퍼플 액센트. 텍스트 선명. 실제 이름·깃허브 핸들·브라우저 탭·URL 없음.
16:9, 고해상도.
```

### 10. `xroom-ai-webrtc.webp` → AI + WebRTC 3D 웨비나 아키텍처
```
테크 아키텍처 인포그래픽. 제목 "XR 프로덕션 — AI + WebRTC 실시간 3D 웨비나 플랫폼".
좌→우 플로우:
[3D 웹 클라이언트] --WebRTC--> [실시간 협업 서버] --> [AI 서비스 레이어]
AI 레이어 박스: OpenAI API (GPT / Embeddings / Moderation / TTS), Mediapipe SDK
(Pose landmark, Face landmark, Image segmentation).
하단: "다자간 통신 · 화면 공유 · 화면 녹화 · 모션 캡처 · 캐릭터 이식" 기능 태그.
다크 네이비 배경, 시안(WebRTC)·퍼플(서버)·핑크(AI) 액센트, 발광 아이콘.
실제 회사명·서버명·인물 얼굴 없음. 16:9, 텍스트 선명.
```

### 11. `bci-process.webp` → 뇌파(EEG) × 언리얼 실시간 인터랙션
```
테크 프로세스 인포그래픽. 제목 "Brain-Wave × Unreal — EEG 신호 실시간 인터랙션".
좌→우 파이프라인 (각 단계 발광 아이콘):
[EEG 헤드셋 (뇌파 측정)] → [OpenViBE 신호 처리] → [OSC 전송] → [UE5 실시간 반응]
→ [버추얼 아이돌 캐릭터 인터랙션 / 파티클·라이팅 반응].
하단 캡션: "집중도·이완도 등 뇌파 상태를 실시간 비주얼로 변환".
다크 네이비 배경, 시안→퍼플→핑크 그라디언트 플로우, 뇌파 파형 모티프.
실제 인물 얼굴·내부 코드네임 없음. 16:9, 텍스트 선명.
```

### 12. `xroom-arch2.webp` → XR 프로덕션 시스템 아키텍처
```
소프트웨어 시스템 아키텍처 인포그래픽. 제목 "XR 프로덕션 — 모듈 아키텍처".
계층 구조:
- 입력 레이어: 카메라 트래킹 / LiveLink 모캡 / 미디어 소스
- 코어 엔진: 통합 방송 엔진 (Compositing, Save/Load, 카메라 시스템, LookDev)
- 출력 레이어: SDI / NDI / SRT / WebRTC / OSC
- 확장 모듈: PPT 시퀀서, 미디어플레인, 멀티플레이어
박스+화살표 다이어그램, 다크 네이비 배경, 퍼플(코어)·시안(입력)·오렌지(출력) 액센트.
실제 제품명(XROOM/XAM/SoulX) 대신 위 일반 명칭 사용. 16:9, 텍스트 선명, 뭉개짐 없이.
```

---

# C. 신규 이미지 (사이트 신규 카드용)

### 13. `org-process-codification.webp` → 조직 운영 능력 (프로세스 분해→코드화)
> index.html "Technical Depth" 섹션의 신규 insight-card("도구가 아니라 프로세스 — 팀 업무를 시스템으로 코드화하는 조직 운영 능력")에 첨부됨. 5.7 엔진 포팅과 **별개**인 **조직 운영/관리 능력**을 설명하는 이미지.
```
테크 인포그래픽. 제목 "프로세스를 코드로 (Process → Code)". 좌→우 3단계 흐름.

[1단계 · 좌] 뒤엉킨 팀 업무 (Before):
여러 사람 아이콘 + 채팅 말풍선 + 흩어진 문서 + 구두 지시 화살표가 얽힌 혼란스러운 모습.
라벨 "사람·구두·채팅 의존 → 누락·중복·병목".

[2단계 · 중] 분해·분류 (Decompose & Classify):
업무를 최소 단위 블록으로 쪼갠 모습 — "요청 / 작업 시작 / 제출 / 컨펌 / 리테이크 / 위반"
칩들과 그 사이 상태 전이 화살표(상태 머신). 형태소를 쪼개듯 정렬되는 느낌.

[3단계 · 우] 정규화 & 코드화 (Normalize & Codify):
정규화 모델 다이어그램 "순수 리스트 ↔ 작업목록 ↔ 위반목록" +
검증 게이트(자물쇠) + 무인 스케줄러(톱니/시계) 아이콘.
하단에 교체 가능한 도구 로고 자리 표시(일반 아이콘): Notion·Google·n8n·API — "도구는 표면".

하단 캡션: "사람의 성실함이 아니라 시스템으로 굴러가는 조직".
스타일: 다크 네이비 배경, 좌측=혼란(붉은/회색), 우측=질서(시안·퍼플·그린) 대비.
발광 아이콘, 한글 메인 라벨 + 영어 보조. 16:9, 텍스트 선명. 실제 회사·제품·인물명 없음.
```

## 🛠 webp 변환 (선택)

Gemini가 PNG로 주면, 원본과 같은 webp로 변환해 교체:

```bash
# sharp 는 이미 설치돼 있음 (devDependency)
node -e "const s=require('sharp'); s('다운로드.png').webp({quality:82}).toFile('public/images/problem-solving-map.webp').then(()=>console.log('done'))"
```

권장 크기: 히어로/맵류는 가로 1408px, 일반 카드류는 원본 비율 유지. 교체 후 `npm run build` 로 확인.
