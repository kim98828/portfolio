// ============================================
// Lock Screen — Auth + Wireframe Canvas
// ============================================
// Why sessionStorage instead of localStorage:
// Each tab should require re-authentication. localStorage would persist
// across tabs, defeating the purpose of a per-visit access gate.

import { EXPECTED_HASH, sha256, isMobile } from './config.js';
import { CanvasRenderer } from './canvas-renderer.js';

/** Color palette shared across lock screen elements */
const PALETTE = {
    indigo: { r: 99, g: 102, b: 241 },
    cyan: { r: 6, g: 182, b: 212 },
};

/** @returns {boolean} Whether the portfolio is already unlocked in this session */
export function isUnlocked() {
    return sessionStorage.getItem('portfolio_unlocked') === 'true';
}

/**
 * Initializes password lock UI and wireframe canvas animation.
 * @param {Function} onUnlock - Callback fired on successful unlock
 */
export function initLockScreen(onUnlock) {
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-password');
    const lockSubmit = document.getElementById('lock-submit');
    const lockError = document.getElementById('lock-error');

    if (isUnlocked()) {
        lockScreen.classList.add('unlocked');
        document.body.classList.remove('locked');
        return;
    }

    document.body.classList.add('locked');

    async function tryUnlock() {
        const value = lockInput.value.trim().replace(/-/g, '');
        if (!value) return;
        const hash = await sha256(value);
        if (hash === EXPECTED_HASH) {
            sessionStorage.setItem('portfolio_unlocked', 'true');
            lockScreen.classList.add('unlocked');
            document.body.classList.remove('locked');
            lockError.classList.remove('show');
            onUnlock();
        } else {
            lockError.classList.add('show');
            lockInput.value = '';
            lockInput.focus();
        }
    }

    lockSubmit.addEventListener('click', tryUnlock);
    lockInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryUnlock();
    });

    // --- Wireframe canvas animation ---
    const lockCanvas = document.getElementById('lock-canvas');
    if (!lockCanvas) return;

    const renderer = new CanvasRenderer(lockCanvas, () => lockScreen);

    const mobile = isMobile();
    const SHAPE_COUNT = mobile ? 3 : 6;
    const MICRO_COUNT = mobile ? 20 : 50;
    const shapes = [];
    const microParticles = [];

    class WireShape {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * 200 + 50;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.rotSpeed = (Math.random() - 0.5) * 0.008;
            this.rot = Math.random() * Math.PI * 2;
            this.sides = Math.floor(Math.random() * 3) + 3;
            this.size = Math.random() * 40 + 25;
            this.color = Math.random() < 0.5 ? PALETTE.indigo : PALETTE.cyan;
            this.alpha = Math.random() * 0.15 + 0.05;
        }
        update(time, w, h) {
            this.rot += this.rotSpeed;
            this.x += this.vx;
            this.y += this.vy + Math.sin(time * 0.5 + this.x * 0.01) * 0.15;
            if (this.x < -100) this.x = w + 100;
            if (this.x > w + 100) this.x = -100;
            if (this.y < -100) this.y = h + 100;
            if (this.y > h + 100) this.y = -100;
        }
        draw(ctx) {
            const { r, g, b } = this.color;
            const scale = 300 / (300 + this.z);
            const s = this.size * scale;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);

            // Outer
            ctx.beginPath();
            for (let i = 0; i <= this.sides; i++) {
                const angle = (i / this.sides) * Math.PI * 2;
                const px = Math.cos(angle) * s, py = Math.sin(angle) * s;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Inner (phase-shifted)
            const innerSize = s * 0.55;
            ctx.beginPath();
            for (let i = 0; i <= this.sides; i++) {
                const angle = (i / this.sides) * Math.PI * 2 + Math.PI / this.sides;
                const px = Math.cos(angle) * innerSize, py = Math.sin(angle) * innerSize;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha * 0.6})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Spokes connecting inner ↔ outer
            for (let i = 0; i < this.sides; i++) {
                const oa = (i / this.sides) * Math.PI * 2;
                const ia = oa + Math.PI / this.sides;
                ctx.beginPath();
                ctx.moveTo(Math.cos(oa) * s, Math.sin(oa) * s);
                ctx.lineTo(Math.cos(ia) * innerSize, Math.sin(ia) * innerSize);
                ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha * 0.3})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    renderer.onInit = (w, h) => {
        shapes.length = 0;
        microParticles.length = 0;
        for (let i = 0; i < SHAPE_COUNT; i++) shapes.push(new WireShape(w, h));
        for (let i = 0; i < MICRO_COUNT; i++) {
            microParticles.push({
                x: Math.random() * w, y: Math.random() * h,
                r: Math.random() * 1 + 0.3,
                vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.3 - 0.05,
                alpha: Math.random() * 0.4 + 0.1,
                color: Math.random() < 0.5 ? '99,102,241' : '6,182,212',
            });
        }
    };

    renderer.onDraw = (ctx, w, h, time) => {
        // Aurora bands
        for (let i = 0; i < 3; i++) {
            const yOff = h * 0.3 + Math.sin(time * 0.3 + i * 2) * h * 0.15;
            const cx = w * 0.5 + Math.sin(time * 0.2 + i) * w * 0.2;
            const grad = ctx.createRadialGradient(cx, yOff, 0, cx, yOff, w * 0.4);
            const isIndigo = i % 2 === 0;
            grad.addColorStop(0, isIndigo ? 'rgba(99,102,241,0.04)' : 'rgba(6,182,212,0.03)');
            grad.addColorStop(0.5, isIndigo ? 'rgba(99,102,241,0.015)' : 'rgba(6,182,212,0.01)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        // Scanline
        const scanY = (time * 40) % (h + 200) - 100;
        const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(99,102,241,0.025)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 60, w, 120);

        // Wireframe shapes
        for (const s of shapes) { s.update(time, w, h); s.draw(ctx); }

        // Micro particles
        for (const p of microParticles) {
            p.x += p.vx; p.y += p.vy;
            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
            ctx.fill();
        }

        // Grid lines
        ctx.strokeStyle = 'rgba(99,102,241,0.015)';
        ctx.lineWidth = 0.5;
        for (let y = 0; y < h; y += 80) {
            const wave = Math.sin(time * 0.5 + y * 0.01) * 3;
            ctx.beginPath(); ctx.moveTo(0, y + wave); ctx.lineTo(w, y + wave); ctx.stroke();
        }
    };

    renderer.shouldStop = () => lockScreen.classList.contains('unlocked');

    renderer.init();
    renderer.start();

    // Stop animation on unlock
    const obs = new MutationObserver(() => {
        if (lockScreen.classList.contains('unlocked')) {
            renderer.stop();
            obs.disconnect();
        }
    });
    obs.observe(lockScreen, { attributes: true, attributeFilter: ['class'] });
}
