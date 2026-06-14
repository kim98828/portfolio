// ============================================
// Interactive Particle Constellation Renderer
// ============================================
// Uses CanvasRenderer base for lifecycle + SpatialHash for O(n) connections.
// Mouse interaction: repulsion + tangential orbit (angle + PI/2).

import { isMobile } from './config.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { SpatialHash } from './spatial-hash.js';
// lock-screen import removed

/** Physics & rendering constants — extracted for tuning and documentation */
const PHYSICS = {
    particleCount:  isMobile() ? 35 : 80,
    connectDist:    isMobile() ? 100 : 150,
    mouseRadius:    isMobile() ? 140 : 200,
    repulsionForce: 0.02,
    orbitForce:     0.008,
    damping:        0.99,
    baseVelocity:   0.4,
    wrapMargin:     20,
    connectionAlpha: 0.15,
    mouseAlpha:     0.3,
    glowMultiplier: 4,
    glowAlpha:      0.08,
};

class Particle {
    constructor(w, h) { this.reset(w, h); }

    reset(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * PHYSICS.baseVelocity;
        this.vy = (Math.random() - 0.5) * PHYSICS.baseVelocity;
        this.radius = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.alpha = this.baseAlpha;
        // Indigo-to-cyan gradient via linear interpolation
        const t = Math.random();
        this.r = Math.floor(99 + (6 - 99) * t);
        this.g = Math.floor(102 + (182 - 102) * t);
        this.b = Math.floor(241 + (212 - 241) * t);
    }

    update(mouse, w, h) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PHYSICS.mouseRadius) {
            const force = (PHYSICS.mouseRadius - dist) / PHYSICS.mouseRadius;
            const angle = Math.atan2(dy, dx);
            // Repulsion + tangential orbit (perpendicular component)
            this.vx += Math.cos(angle) * force * PHYSICS.repulsionForce
                     + Math.cos(angle + 1.57) * force * PHYSICS.orbitForce;
            this.vy += Math.sin(angle) * force * PHYSICS.repulsionForce
                     + Math.sin(angle + 1.57) * force * PHYSICS.orbitForce;
            this.alpha = Math.min(1, this.baseAlpha + force * 0.6);
        } else {
            this.alpha += (this.baseAlpha - this.alpha) * 0.02;
        }

        this.vx *= PHYSICS.damping;
        this.vy *= PHYSICS.damping;
        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges
        const m = PHYSICS.wrapMargin;
        if (this.x < -m) this.x = w + m;
        if (this.x > w + m) this.x = -m;
        if (this.y < -m) this.y = h + m;
        if (this.y > h + m) this.y = -m;
    }

    draw(ctx) {
        // Glow halo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * PHYSICS.glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha * PHYSICS.glowAlpha})`;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
        ctx.fill();
    }
}

/**
 * Initializes and runs the hero section particle constellation.
 * Waits for unlock if the lock screen is active.
 */
export function initParticleRenderer() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const heroEl = document.getElementById('hero');
    const renderer = new CanvasRenderer(canvas, () => heroEl);
    const spatialHash = new SpatialHash(PHYSICS.connectDist);

    let particles = [];
    const mouse = { x: -9999, y: -9999 };

    renderer.onInit = (w, h) => {
        particles = [];
        for (let i = 0; i < PHYSICS.particleCount; i++) {
            particles.push(new Particle(w, h));
        }
    };

    renderer.onDraw = (ctx, w, h) => {
        // Update all particles
        for (const p of particles) p.update(mouse, w, h);

        // Mouse glow
        if (mouse.x >= 0) {
            const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, PHYSICS.mouseRadius);
            gradient.addColorStop(0, 'rgba(99,102,241,0.06)');
            gradient.addColorStop(0.5, 'rgba(6,182,212,0.02)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(mouse.x - PHYSICS.mouseRadius, mouse.y - PHYSICS.mouseRadius,
                         PHYSICS.mouseRadius * 2, PHYSICS.mouseRadius * 2);
        }

        // Rebuild spatial hash each frame
        spatialHash.clear();
        for (let i = 0; i < particles.length; i++) {
            spatialHash.insert(i, particles[i].x, particles[i].y);
        }

        // Draw connections using spatial hash — O(n) average instead of O(n²)
        const visited = new Set();
        for (let i = 0; i < particles.length; i++) {
            const neighbors = spatialHash.queryNear(particles[i].x, particles[i].y);
            for (const j of neighbors) {
                if (j <= i) continue;
                const pairKey = i * 10000 + j;
                if (visited.has(pairKey)) continue;
                visited.add(pairKey);

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < PHYSICS.connectDist) {
                    const alpha = (1 - dist / PHYSICS.connectDist) * PHYSICS.connectionAlpha;
                    const grad = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    grad.addColorStop(0, `rgba(${particles[i].r},${particles[i].g},${particles[i].b},${alpha})`);
                    grad.addColorStop(1, `rgba(${particles[j].r},${particles[j].g},${particles[j].b},${alpha})`);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Mouse connections
        for (const p of particles) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < PHYSICS.mouseRadius) {
                const alpha = (1 - dist / PHYSICS.mouseRadius) * PHYSICS.mouseAlpha;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }
        }

        // Draw particles on top of connections
        for (const p of particles) p.draw(ctx);
    };

    // Mouse & touch tracking relative to hero section
    heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    heroEl.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    heroEl.addEventListener('touchmove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    heroEl.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; });

    // Lock screen removed — start immediately
    renderer.init();
    renderer.start();
}
