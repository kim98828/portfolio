// ============================================
// Google Apps Script - Portfolio Backend
// ============================================
// 배포 방법:
// 1. https://script.google.com 접속
// 2. 새 프로젝트 만들기
// 3. 이 코드 전체 복사 → 붙여넣기
// 4. 상단 메뉴 "배포" → "새 배포"
// 5. 유형: "웹 앱"
// 6. 실행 주체: "나" / 액세스: "모든 사용자"
// 7. 배포 → URL 복사
// 8. index.html의 BACKEND_URL에 붙여넣기
// ============================================

const TELEGRAM_TOKEN = '8595926887:AAGH29JaqiW5xXGKjDZwkfDSLGOg0dyd9Oo';
const CHAT_ID = '7329769268';
const SHEET_NAME = 'PortfolioLog';

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

// POST 요청 처리
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type;

    if (type === 'visit') {
      if (isRateLimited('visit', 30)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'rate_limited' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      handleVisit(data);
    } else if (type === 'message') {
      if (isRateLimited('message', 5)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'rate_limited' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      handleMessage(data);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS preflight 처리
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'count') {
    const count = getVisitCount();
    return ContentService.createTextOutput(JSON.stringify({ count: count }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- 방문자 처리 ----
function handleVisit(data) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const browser = sanitize(data.browser, 200) || 'Unknown';
  const platform = sanitize(data.platform, 100) || 'Unknown';
  const language = sanitize(data.language, 20) || 'Unknown';
  const screenRes = sanitize(data.screen, 20) || 'Unknown';
  const referrer = sanitize(data.referrer, 500) || 'Direct';

  // Google Sheets에 로그
  logToSheet([timestamp, 'VISIT', browser, platform, language, screenRes, referrer, '']);

  // 카운터 증가
  incrementVisitCounter();

  // Telegram 알림
  const msg = `🔓 <b>포트폴리오 열람!</b>\n\n`
    + `📅 시간: ${timestamp}\n`
    + `🌐 브라우저: ${browser}\n`
    + `💻 플랫폼: ${platform}\n`
    + `🔤 언어: ${language}\n`
    + `📐 해상도: ${screenRes}\n`
    + `🔗 유입: ${referrer}`;

  sendTelegram(msg);
}

// ---- 메시지 처리 ----
function handleMessage(data) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const name = sanitize(data.name, 100) || 'Anonymous';
  const email = sanitize(data.email, 200) || 'N/A';
  const message = sanitize(data.message, 2000) || '';

  if (!message) return;

  // Google Sheets에 로그
  logToSheet([timestamp, 'MESSAGE', '', '', '', '', '', name + ' | ' + email + ' | ' + message]);

  // Telegram 알림
  const msg = `💬 <b>새 메시지 도착!</b>\n\n`
    + `📅 시간: ${timestamp}\n`
    + `👤 이름: ${name}\n`
    + `📧 이메일: ${email}\n`
    + `💭 메시지:\n${message}`;

  sendTelegram(msg);
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
  const count = parseInt(props.getProperty('VISIT_COUNT') || '0', 10);
  return count;
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

// 기존 시트 데이터에서 카운터를 복구할 때 1회 실행
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

// ---- Telegram 전송 ----
function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: 'HTML'
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}
