포트폴리오 콘텐츠를 업데이트합니다.

사용자의 요청에 따라 아래 영역을 수정합니다:

1. **프로젝트 카드** (index.html #projects)
   - project-card 구조: visual + info + features + deepdive + tags
   - 새 프로젝트 추가 시 기존 카드 구조 복제

2. **기술 인사이트** (index.html #insights)
   - insight-card 구조: icon + title + body + comparison
   - "왜 ~했는가" 형식의 기술 의사결정 설명

3. **경력** (index.html #career)
   - timeline-item 구조: marker + content + tasks

4. **스킬** (index.html #skills)
   - skill-category + skill-item[data-code] 구조
   - 새 스킬 추가 시 codeData.js에도 코드 예제 추가

5. **코드 데이터** (codeData.js)
   - label, lang, desc, code 필드
   - code 내 HTML은 span class로 하이라이팅
