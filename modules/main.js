// ============================================
// Portfolio — Entry Point
// ============================================
// Architecture: ES Modules, zero build tools, zero frameworks.
// Deliberate choice — a static portfolio doesn't need React or Vite.
// Module boundaries follow the same "context-based separation"
// principle used in production UE5 projects (400-line class limit).
//
// Module map:
//   config.js           — Shared constants, crypto utilities
//   canvas-renderer.js  — Base class for canvas animation lifecycle
//   spatial-hash.js     — O(n) grid-based neighbor lookup
//   lock-screen.js      — SHA-256 auth + wireframe canvas
//   particle-renderer.js — Hero constellation with spatial hashing
//   ui.js               — Navigation, scroll, popups, blog cards
//   backend.js          — Google Apps Script integration (no-cors)

import { initParticleRenderer } from './particle-renderer.js';
import { initUI } from './ui.js';
import { sendVisitNotification, loadVisitorCount, initContactForm } from './backend.js';

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
