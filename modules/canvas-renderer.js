// ============================================
// CanvasRenderer — Shared base for canvas animations
// ============================================
// Why a shared base instead of two independent animation loops:
// Lock screen and hero particle system share identical patterns
// (resize → init → RAF loop → visibility pause → cleanup).
// Extracting this removes duplication and mirrors the compositing
// pipeline architecture used in the actual production work.

/**
 * Base canvas renderer with lifecycle management.
 * Subclass behavior via onInit/onDraw/shouldStop hooks.
 */
export class CanvasRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - Target canvas element
     * @param {Function} [containerFn] - Returns the sizing container element (defaults to canvas.parentElement)
     */
    constructor(canvas, containerFn) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.containerFn = containerFn || (() => canvas.parentElement);
        this.w = 0;
        this.h = 0;
        this.time = 0;
        this.animId = null;
        this.running = false;

        /** @type {Function} Called after resize with (w, h) — use for particle init */
        this.onInit = () => {};
        /** @type {Function} Called each frame with (ctx, w, h, time) */
        this.onDraw = () => {};
        /** @type {Function} Return true to auto-stop the loop */
        this.shouldStop = () => false;

        this._onResize = this._resize.bind(this);
        this._onVisibility = this._handleVisibility.bind(this);
    }

    /** Measure container and resize canvas to match */
    _resize() {
        const container = this.containerFn();
        if (!container) return;
        // Use window dimensions for full-screen canvases, element dimensions otherwise
        this.w = this.canvas.width = container.offsetWidth || window.innerWidth;
        this.h = this.canvas.height = container.offsetHeight || window.innerHeight;
    }

    /** Pause when tab is hidden, resume when visible — saves GPU cycles */
    _handleVisibility() {
        if (document.hidden) {
            this._cancelFrame();
        } else if (this.running) {
            this._frame();
        }
    }

    _cancelFrame() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    _frame() {
        this.time += 0.016;
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.onDraw(this.ctx, this.w, this.h, this.time);

        if (this.shouldStop()) {
            this.stop();
            return;
        }
        this.animId = requestAnimationFrame(() => this._frame());
    }

    /** Initialize canvas size and call onInit hook */
    init() {
        this._resize();
        this.onInit(this.w, this.h);
        window.addEventListener('resize', this._onResize);
        document.addEventListener('visibilitychange', this._onVisibility);
    }

    /** Start the animation loop */
    start() {
        this.running = true;
        this._frame();
    }

    /** Stop animation and remove listeners */
    stop() {
        this.running = false;
        this._cancelFrame();
        window.removeEventListener('resize', this._onResize);
        document.removeEventListener('visibilitychange', this._onVisibility);
    }
}
