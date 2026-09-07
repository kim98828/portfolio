// src/resume.css 를 두 이력서 HTML 의 <style> 블록으로 주입한다.
//
// 이력서 페이지는 "파일 하나만 보내도 그대로 열리는" 자체 완결 문서여야 한다
// (메일 첨부·오프라인 열람·헤드리스 인쇄에서 외부 CSS 로딩 레이스가 없어야 함).
// 그래서 CSS 는 src/resume.css 한 곳에서만 관리하고, 빌드 전에 이 스크립트로 주입한다.
// 정규식 대신 문자열 인덱스로만 자르므로 마커에 어떤 문자가 들어와도 안전하다.
//
//   npm run resume:css   (npm run build 가 자동으로 먼저 실행)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/resume.css'), 'utf8').trimEnd();
const MARK = '<!-- resume.css injected by scripts/sync-resume-css.mjs — do not edit here -->';
const LINK = '<link rel="stylesheet" href="/src/resume.css">';
const END = '</style>';

for (const file of ['resume.html', 'resume-product.html']) {
    const path = resolve(root, file);
    const html = readFileSync(path, 'utf8');
    const block = `${MARK}\n<style>\n${css}\n${END}`;

    let head, tail;
    const at = html.indexOf(MARK);
    if (at !== -1) {
        const end = html.indexOf(END, at);
        if (end === -1) throw new Error(`${file}: 주입 블록이 ${END} 로 닫히지 않았습니다.`);
        head = html.slice(0, at);
        tail = html.slice(end + END.length);
    } else {
        const link = html.indexOf(LINK);
        if (link === -1) throw new Error(`${file}: 주입 지점(마커 또는 ${LINK})을 찾지 못했습니다.`);
        head = html.slice(0, link);
        tail = html.slice(link + LINK.length);
    }

    const next = head + block + tail;
    if (next !== html) writeFileSync(path, next);
    console.log(`[resume-css] ${file} ${next === html ? '= 변경 없음' : '← src/resume.css'} (${css.length} bytes)`);
}
