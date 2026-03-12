GitHub Pages 배포 상태를 확인하고 푸시합니다.

1. `git status`로 커밋되지 않은 변경 확인
2. 미커밋 변경이 있으면 커밋 먼저 진행
3. `git push origin main`으로 배포
4. GitHub Pages는 main 브랜치 푸시 시 자동 배포
5. 배포 완료 확인: `gh api repos/{owner}/{repo}/pages/builds/latest`
