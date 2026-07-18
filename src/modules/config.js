// ============================================
// Global Configuration & Shared Constants
// ============================================

/** @type {string} Current environment ('development' | 'production') */
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE;

/** @type {string} Google Apps Script backend endpoint (per-environment via .env) */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/** @type {number} Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 768;

/** @returns {boolean} Whether the viewport is mobile-sized */
export function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}
