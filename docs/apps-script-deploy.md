# Apps Script 자동 배포 설정

`backend.gs`를 main 푸시 시 [clasp](https://github.com/google/clasp)로 자동
push/deploy 한다. 워크플로우: `.github/workflows/appsscript-deploy.yml`.

`backend.gs` / `appsscript.json` / `.claspignore` 가 변경될 때만 트리거된다.

## 1회 설정 (최초 한 번)

### 1. 로컬에서 clasp 로그인
```bash
npm install -g @google/clasp@2.4.2
clasp login          # 브라우저에서 구글 인증 → ~/.clasprc.json 생성
```

### 2. 기존 Apps Script 프로젝트와 연결
이미 script.google.com 에 만든 프로젝트가 있으므로 ID 두 개가 필요하다.

- **Script ID**: Apps Script 편집기 → 프로젝트 설정 → "스크립트 ID"
- **Deployment ID**: 기존 웹앱 배포 ID. `modules/config.js` 의 `BACKEND_URL`
  안에 이미 들어 있다 — `.../macros/s/<여기가 배포 ID>/exec` 의 `AKfycb...` 부분.
  현재 값:
  ```
  AKfycbwjybNykq_dgtRSKpq5eVd2xEplXI0cx92e9Xau7ehIwDmWnYvhiW-rnxxvGU0yYt22Rw
  ```
  (확실치 않으면 `clasp deployments` 로 /exec 에 연결된 배포 ID 를 확인한다.)
  > 이 배포 ID 를 갱신해야 `modules/config.js` 의 `BACKEND_URL`(/exec)이 유지된다.
  > 새 배포를 만들면 URL 이 바뀌어 프론트가 깨진다.

### 3. GitHub Secrets 등록
저장소 → Settings → Secrets and variables → Actions → New repository secret

| 이름 | 값 |
|------|----|
| `CLASPRC_JSON` | 로컬 `~/.clasprc.json` 파일 **전체 내용** |
| `SCRIPT_ID` | 위 Script ID |
| `DEPLOYMENT_ID` | 위 Deployment ID |

## 배포

- `backend.gs` 수정 후 main 에 푸시 → 자동 push + deploy.
- 수동 실행: Actions 탭 → "Deploy Apps Script" → Run workflow.

## 주의

- `CLASPRC_JSON` 의 OAuth 토큰은 만료/폐기될 수 있다. 401/403 으로 실패하면
  로컬에서 `clasp login` 다시 한 뒤 시크릿을 갱신한다.
- `.claspignore` 가 `backend.gs` + `appsscript.json` 만 푸시하도록 제한한다.
  Apps Script 에 새 파일을 추가하려면 `.claspignore` 의 화이트리스트에 넣어야 한다.
