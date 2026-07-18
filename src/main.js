// ============================================
// Portfolio — Entry Point (Vite)
// ============================================
// Architecture: ES Modules bundled by Vite. dev/prod separated via .env.
// Module boundaries follow the same "context-based separation"
// principle used in production UE5 projects (400-line class limit).
//
// Module map (src/modules/):
//   config.js           — Env-driven constants, crypto utilities
//   canvas-renderer.js  — Base class for canvas animation lifecycle
//   spatial-hash.js     — O(n) grid-based neighbor lookup
//   lock-screen.js      — SHA-256 auth + wireframe canvas
//   particle-renderer.js — Hero constellation with spatial hashing
//   ui.js               — Navigation, scroll, popups, blog cards
//   backend.js          — Google Apps Script integration (no-cors)
// Data (src/data/) is dynamically imported in ui.js on section entry.

import { initParticleRenderer } from './modules/particle-renderer.js';
import { initUI } from './modules/ui.js';
import { sendVisitNotification, loadVisitorCount, initContactForm } from './modules/backend.js';

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lock screen removed — send visit notification immediately
    sendVisitNotification();

    // Canvas particle system
    if (!prefersReducedMotion) initParticleRenderer();

    // All UI interactions
    initUI();

    // Backend
    loadVisitorCount();
    initContactForm();
});
