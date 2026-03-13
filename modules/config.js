// ============================================
// Global Configuration & Shared Constants
// ============================================

/** @type {string} Google Apps Script backend endpoint */
export const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwjybNykq_dgtRSKpq5eVd2xEplXI0cx92e9Xau7ehIwDmWnYvhiW-rnxxvGU0yYt22Rw/exec';

/** @type {string} Pre-computed SHA-256 of the unlock password */
export const EXPECTED_HASH = 'ab6b0c493017fb5b5195a89d9e235a2cce22e5ce2eb605e3b2b642efa4bd2851';

/** @type {number} Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 768;

/** @returns {boolean} Whether the viewport is mobile-sized */
export function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * SHA-256 hash using Web Crypto API.
 * Falls back gracefully if crypto.subtle is unavailable (e.g. non-HTTPS in older browsers).
 * @param {string} text - Plain text to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function sha256(text) {
    if (!crypto?.subtle) {
        console.warn('[config] Web Crypto API unavailable — SHA-256 hashing disabled');
        return '';
    }
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
