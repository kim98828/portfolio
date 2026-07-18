// ============================================
// Google Apps Script - Portfolio Backend
// ============================================
// 배포 방법:
// 1. https://script.google.com 접속
// 2. 새 프로젝트 만들기
// 3. 이 코드 전체 복사 → 붙여넣기
// 4. ⚙️ 프로젝트 설정 → "스크립트 속성"에 아래 두 값 추가:
//      TELEGRAM_TOKEN = <BotFather에서 발급한 토큰>
//      CHAT_ID        = <알림 받을 Chat ID>
//    (코드에 직접 토큰을 넣지 말 것 — 저장소에 비밀값이 새어나갑니다.)
// 5. 상단 메뉴 "배포" → "새 배포"
// 6. 유형: "웹 앱"
// 7. 실행 주체: "나" / 액세스: "모든 사용자"
// 8. 배포 → URL 복사
// 9. .env.production 의 VITE_BACKEND_URL 에 붙여넣기
// ============================================

const SHEET_NAME = 'PortfolioLog';

// ---- 비밀값 / 설정은 Script Properties 에서만 읽는다 ----
function getConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

// 스프레드시트 가져오기 (없으면 자동 생성)
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SHEET_ID');

  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // ID가 잘못됐으면 새로 생성
    }
  }

  // 새 스프레드시트 생성
  const ss = SpreadsheetApp.create('Portfolio Visitor Log');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

// ---- Rate Limiting ----
function isRateLimited(key, maxPerMinute) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'rl_' + key;
  const count = parseInt(cache.get(cacheKey) || '0', 10);
  if (count >= maxPerMinute) return true;
  cache.put(cacheKey, String(count + 1), 60);
  return false;
}

// ---- Input Sanitization ----
function sanitize(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').substring(0, maxLen || 500).trim();
}

// ---- Email 형식 검증 (느슨하지만 명백한 쓰레기는 차단) ----
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 표준 JSON 응답
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST 요청 처리
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type;

    if (type === 'visit') {
      if (isRateLimited('visit', 30)) {
        return jsonResponse({ status: 'rate_limited' });
      }
      handleVisit(data);
    } else if (type === 'message') {
      if (isRateLimited('message', 5)) {
        return jsonResponse({ status: 'rate_limited' });
      }
      const ok = handleMessage(data);
      if (!ok) {
        return jsonResponse({ status: 'rejected' });
      }
    } else {
      return jsonResponse({ status: 'rejected' });
    }

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    // 내부 에러 상세는 Stackdriver 로그에만 남기고, 클라이언트에는 일반 메시지만.
    console.error('doPost error: ' + (err && err.stack ? err.stack : err));
    return jsonResponse({ status: 'error' });
  }
}

// CORS preflight 처리
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'count') {
    return jsonResponse({ count: getVisitCount() });
  }

  return jsonResponse({ status: 'ok' });
}

// ---- 방문자 처리 ----
function handleVisit(data) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const browser = sanitize(data.browser, 200) || 'Unknown';
  const platform = sanitize(data.platform, 100) || 'Unknown';
  const language = sanitize(data.language, 20) || 'Unknown';
  const screenRes = sanitize(data.screen, 20) || 'Unknown';
  const referrer = sanitize(data.referrer, 500) || 'Direct';

  // 데이터 저장(핵심) → 카운터 → 알림(부가) 순서. 앞 단계 실패가 뒤로 전파되지 않도록 분리.
  logToSheet([timestamp, 'VISIT', browser, platform, language, screenRes, referrer, '']);
  incrementVisitCounter();

  const msg = `🔓 <b>포트폴리오 열람!</b>\n\n`
    + `📅 시간: ${timestamp}\n`
    + `🌐 브라우저: ${browser}\n`
    + `💻 플랫폼: ${platform}\n`
    + `🔤 언어: ${language}\n`
    + `📐 해상도: ${screenRes}\n`
    + `🔗 유입: ${referrer}`;

  sendTelegram(msg);
}

// ---- 메시지 처리 ---- (성공 여부 boolean 반환)
function handleMessage(data) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const name = sanitize(data.name, 100) || 'Anonymous';
  const rawEmail = sanitize(data.email, 200);
  const message = sanitize(data.message, 2000) || '';

  if (!message) return false;

  const email = isValidEmail(rawEmail) ? rawEmail : 'N/A (invalid)';

  // 데이터 저장(핵심) 먼저 — 알림이 실패해도 문의는 유실되지 않는다.
  logToSheet([timestamp, 'MESSAGE', '', '', '', '', '', name + ' | ' + email + ' | ' + message]);

  const msg = `💬 <b>새 메시지 도착!</b>\n\n`
    + `📅 시간: ${timestamp}\n`
    + `👤 이름: ${name}\n`
    + `📧 이메일: ${email}\n`
    + `💭 메시지:\n${message}`;

  sendTelegram(msg);
  return true;
}

// ---- Google Sheets 로그 ----
function logToSheet(rowData) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Type', 'Browser', 'Platform', 'Language', 'Screen', 'Referrer', 'Extra']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }

  sheet.appendRow(rowData);
}

// ---- 방문자 수 (카운터 셀 방식 — O(1)) ----
function getVisitCount() {
  const props = PropertiesService.getScriptProperties();
  return parseInt(props.getProperty('VISIT_COUNT') || '0', 10);
}

function incrementVisitCounter() {
  const props = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const count = parseInt(props.getProperty('VISIT_COUNT') || '0', 10);
    props.setProperty('VISIT_COUNT', String(count + 1));
  } finally {
    lock.releaseLock();
  }
}

// 시트의 VISIT 행 수를 단일 진실원으로 삼아 카운터를 재동기화한다.
// 정합성이 틀어졌을 때(또는 정기적으로) 수동 실행하면 카운터를 정확한 값으로 복구한다.
function migrateVisitCounter() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === 'VISIT') count++;
  }
  PropertiesService.getScriptProperties().setProperty('VISIT_COUNT', String(count));
}

// ---- Telegram 전송 (부가 기능 — 실패해도 요청 전체를 깨지 않는다) ----
function sendTelegram(text) {
  const token = getConfig('TELEGRAM_TOKEN');
  const chatId = getConfig('CHAT_ID');

  // 설정이 없으면 조용히 건너뛴다 (로깅/저장은 이미 끝난 상태).
  if (!token || !chatId) {
    console.error('sendTelegram skipped: TELEGRAM_TOKEN / CHAT_ID 스크립트 속성이 설정되지 않음');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  try {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true   // HTTP 오류로 예외가 던져지지 않게 → 호출부로 전파 차단
    });
    const code = res.getResponseCode();
    if (code < 200 || code >= 300) {
      console.error('Telegram API ' + code + ': ' + res.getContentText());
    }
  } catch (err) {
    // 네트워크/타임아웃 등 — 알림 실패는 치명적이지 않으므로 로그만 남기고 삼킨다.
    console.error('sendTelegram error: ' + (err && err.stack ? err.stack : err));
  }
}
