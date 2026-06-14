// ============================================
// Global Configuration & Shared Constants
// ============================================

/** @type {string} Current environment ('development' | 'production') */
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE;

/** @type {string} Google Apps Script backend endpoint (per-environment via .env) */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/** @type {string} Pre-computed SHA-256 of the unlock password (per-environment via .env) */
export const EXPECTED_HASH = import.meta.env.VITE_UNLOCK_HASH ?? '';

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
