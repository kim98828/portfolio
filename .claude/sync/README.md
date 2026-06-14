# 개발내용 동기화 하네스 (회사 소스 → 포트폴리오)

회사 소스 프로젝트의 개발 활동을 **익명화**해 포트폴리오 콘텐츠(`src/data/blogData.js`, `src/data/codeData.js`)에 반영하는 워크플로우입니다. 실제 내부 명칭/경로는 커밋되는 파일에 절대 두지 않습니다.

## 사용법

1. 회사 소스 프로젝트에서 개발/커밋을 진행.
2. 포트폴리오 세션에서 **"개발내용 최신화"** / **"소스 업데이트"** / **`/sync-dev`** 라고 말함.
3. 하네스가 신규 활동을 수집 → 익명화 초안 제시 → **승인 후** 반영 → 커밋 제안.

> 원칙: **초안 제안 후 승인.** 실제 내부 명칭은 절대 포트폴리오에 노출하지 않음.

## 최초 1회 설정 (둘 다 로컬 전용 — gitignore됨)

```bash
cp .claude/sync/source.example.txt        .claude/sync/source.txt          # 소스 저장소 로컬 경로 기입
cp .claude/sync/anonymize-map.example.tsv .claude/sync/anonymize-map.tsv   # 실제명칭<TAB>포트폴리오표기 기입
```

`anonymize-map.tsv` 왼쪽(실제명칭)은 `check-secrets`/`check-anon` 이 커밋·작성 시 자동 차단합니다.

## 구성

| 파일 | 역할 | 커밋? |
|------|------|-------|
| `collect-source.sh` | 마지막 동기화 이후 소스 개발 활동 수집(커밋/릴리즈/변경영역/문서). 원자재 출력 | ✅ |
| `anonymize.sh` | stdin 텍스트에 매핑 적용(실명→표기). Python(UTF-8) | ✅ |
| `check-anon.sh` | 파일/텍스트에서 미익명화 실제명칭 탐지 → exit 2. 작성 직전 게이트 | ✅ |
| `source-cursor.json` | 증분 동기화 커서(마지막 SHA/버전/날짜, 코드명 비저장) | ✅ |
| `source.example.txt` / `anonymize-map.example.tsv` | 템플릿(플레이스홀더만) | ✅ |
| `source.txt` / `anonymize-map.tsv` | 실제 경로·매핑(내부정보) | ❌ gitignore |

명령 절차: `.claude/commands/sync-dev.md`. 매칭은 모두 Python(UTF-8) — git-bash `grep -i` 는 한글에서 abort 함.
