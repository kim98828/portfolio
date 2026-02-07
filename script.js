// ============================================
// Portfolio - Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Backend URL (Google Apps Script 배포 후 여기에 URL 입력) ----
    const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwjybNykq_dgtRSKpq5eVd2xEplXI0cx92e9Xau7ehIwDmWnYvhiW-rnxxvGU0yYt22Rw/exec';

    // ---- Password Lock ----
    const PASS_HASH = '5e26e73e8eaborting'; // placeholder replaced below
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-password');
    const lockSubmit = document.getElementById('lock-submit');
    const lockError = document.getElementById('lock-error');

    // Simple hash to avoid plaintext password in source
    async function sha256(text) {
        const data = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Pre-computed SHA-256 of the password
    const EXPECTED = 'ab6b0c493017fb5b5195a89d9e235a2cce22e5ce2eb605e3b2b642efa4bd2851';

    function isUnlocked() {
        return sessionStorage.getItem('portfolio_unlocked') === 'true';
    }

    if (isUnlocked()) {
        lockScreen.classList.add('unlocked');
        document.body.classList.remove('locked');
    } else {
        document.body.classList.add('locked');
    }

    async function tryUnlock() {
        const value = lockInput.value.trim();
        if (!value) return;
        const hash = await sha256(value);
        if (hash === EXPECTED) {
            sessionStorage.setItem('portfolio_unlocked', 'true');
            lockScreen.classList.add('unlocked');
            document.body.classList.remove('locked');
            lockError.classList.remove('show');
            // 방문자 알림 전송
            sendVisitNotification();
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

    // ============================================
    // Lock Screen — Wireframe Geometry + Aurora
    // ============================================
    const lockCanvas = document.getElementById('lock-canvas');
    if (lockCanvas && !isUnlocked()) {
        const lctx = lockCanvas.getContext('2d');
        let lw, lh, lockAnimId;
        let time = 0;

        function lockResize() {
            lw = lockCanvas.width = window.innerWidth;
            lh = lockCanvas.height = window.innerHeight;
        }
        lockResize();
        window.addEventListener('resize', lockResize);

        // 3D wireframe shapes
        const shapes = [];
        const lockMobile = window.innerWidth <= 768;
        const SHAPE_COUNT = lockMobile ? 3 : 6;

        class WireShape {
            constructor() {
                this.x = Math.random() * lw;
                this.y = Math.random() * lh;
                this.z = Math.random() * 200 + 50;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.rotSpeed = (Math.random() - 0.5) * 0.008;
                this.rot = Math.random() * Math.PI * 2;
                this.sides = Math.floor(Math.random() * 3) + 3; // 3~5 sides
                this.size = Math.random() * 40 + 25;
                const t = Math.random();
                this.color = t < 0.5
                    ? { r: 99, g: 102, b: 241 }  // indigo
                    : { r: 6, g: 182, b: 212 };   // cyan
                this.alpha = Math.random() * 0.15 + 0.05;
            }
            update() {
                this.rot += this.rotSpeed;
                this.x += this.vx;
                this.y += this.vy;
                // Float with sine
                this.y += Math.sin(time * 0.5 + this.x * 0.01) * 0.15;

                if (this.x < -100) this.x = lw + 100;
                if (this.x > lw + 100) this.x = -100;
                if (this.y < -100) this.y = lh + 100;
                if (this.y > lh + 100) this.y = -100;
            }
            draw() {
                const { r, g, b } = this.color;
                const scale = 300 / (300 + this.z);
                const s = this.size * scale;

                lctx.save();
                lctx.translate(this.x, this.y);
                lctx.rotate(this.rot);

                // Outer shape
                lctx.beginPath();
                for (let i = 0; i <= this.sides; i++) {
                    const angle = (i / this.sides) * Math.PI * 2;
                    const px = Math.cos(angle) * s;
                    const py = Math.sin(angle) * s;
                    if (i === 0) lctx.moveTo(px, py);
                    else lctx.lineTo(px, py);
                }
                lctx.closePath();
                lctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
                lctx.lineWidth = 0.8;
                lctx.stroke();

                // Inner shape (rotated)
                lctx.beginPath();
                const innerSize = s * 0.55;
                for (let i = 0; i <= this.sides; i++) {
                    const angle = (i / this.sides) * Math.PI * 2 + Math.PI / this.sides;
                    const px = Math.cos(angle) * innerSize;
                    const py = Math.sin(angle) * innerSize;
                    if (i === 0) lctx.moveTo(px, py);
                    else lctx.lineTo(px, py);
                }
                lctx.closePath();
                lctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha * 0.6})`;
                lctx.lineWidth = 0.5;
                lctx.stroke();

                // Connect inner to outer
                for (let i = 0; i < this.sides; i++) {
                    const outerAngle = (i / this.sides) * Math.PI * 2;
                    const innerAngle = (i / this.sides) * Math.PI * 2 + Math.PI / this.sides;
                    lctx.beginPath();
                    lctx.moveTo(Math.cos(outerAngle) * s, Math.sin(outerAngle) * s);
                    lctx.lineTo(Math.cos(innerAngle) * innerSize, Math.sin(innerAngle) * innerSize);
                    lctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha * 0.3})`;
                    lctx.lineWidth = 0.4;
                    lctx.stroke();
                }

                lctx.restore();
            }
        }

        for (let i = 0; i < SHAPE_COUNT; i++) {
            shapes.push(new WireShape());
        }

        // Floating micro particles
        const microParticles = [];
        const MICRO_COUNT = lockMobile ? 20 : 50;
        for (let i = 0; i < MICRO_COUNT; i++) {
            microParticles.push({
                x: Math.random() * lw,
                y: Math.random() * lh,
                r: Math.random() * 1 + 0.3,
                vx: (Math.random() - 0.5) * 0.15,
                vy: -Math.random() * 0.3 - 0.05,
                alpha: Math.random() * 0.4 + 0.1,
                color: Math.random() < 0.5 ? '99,102,241' : '6,182,212'
            });
        }

        function drawAurora() {
            // Soft aurora bands
            for (let i = 0; i < 3; i++) {
                const yOff = lh * 0.3 + Math.sin(time * 0.3 + i * 2) * lh * 0.15;
                const grad = lctx.createRadialGradient(
                    lw * 0.5 + Math.sin(time * 0.2 + i) * lw * 0.2, yOff, 0,
                    lw * 0.5 + Math.sin(time * 0.2 + i) * lw * 0.2, yOff, lw * 0.4
                );
                const isIndigo = i % 2 === 0;
                grad.addColorStop(0, isIndigo ? 'rgba(99,102,241,0.04)' : 'rgba(6,182,212,0.03)');
                grad.addColorStop(0.5, isIndigo ? 'rgba(99,102,241,0.015)' : 'rgba(6,182,212,0.01)');
                grad.addColorStop(1, 'transparent');
                lctx.fillStyle = grad;
                lctx.fillRect(0, 0, lw, lh);
            }
        }

        function drawScanline() {
            const scanY = (time * 40) % (lh + 200) - 100;
            const grad = lctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, 'rgba(99,102,241,0.025)');
            grad.addColorStop(1, 'transparent');
            lctx.fillStyle = grad;
            lctx.fillRect(0, scanY - 60, lw, 120);
        }

        function lockAnimate() {
            time += 0.016;
            lctx.clearRect(0, 0, lw, lh);

            drawAurora();
            drawScanline();

            // Wireframe shapes
            for (const s of shapes) {
                s.update();
                s.draw();
            }

            // Micro particles
            for (const p of microParticles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) { p.y = lh + 10; p.x = Math.random() * lw; }
                if (p.x < -10) p.x = lw + 10;
                if (p.x > lw + 10) p.x = -10;

                lctx.beginPath();
                lctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                lctx.fillStyle = `rgba(${p.color},${p.alpha})`;
                lctx.fill();
            }

            // Horizontal grid lines (subtle)
            lctx.strokeStyle = 'rgba(99,102,241,0.015)';
            lctx.lineWidth = 0.5;
            for (let y = 0; y < lh; y += 80) {
                const wave = Math.sin(time * 0.5 + y * 0.01) * 3;
                lctx.beginPath();
                lctx.moveTo(0, y + wave);
                lctx.lineTo(lw, y + wave);
                lctx.stroke();
            }

            if (!lockScreen.classList.contains('unlocked')) {
                lockAnimId = requestAnimationFrame(lockAnimate);
            }
        }

        lockAnimate();

        // Stop when unlocked
        const lockObs = new MutationObserver(() => {
            if (lockScreen.classList.contains('unlocked')) {
                cancelAnimationFrame(lockAnimId);
                lockObs.disconnect();
            }
        });
        lockObs.observe(lockScreen, { attributes: true, attributeFilter: ['class'] });
    }

    // ---- Navigation Scroll Effect ----
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ---- Mobile Navigation Toggle ----
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    // ---- Typing Effect ----
    const typedName = document.getElementById('typed-name');
    const name = 'kim98828';
    let charIndex = 0;

    function typeChar() {
        if (charIndex < name.length) {
            typedName.textContent += name[charIndex];
            charIndex++;
            setTimeout(typeChar, 150);
        }
    }

    setTimeout(typeChar, 800);

    // ---- Counter Animation ----
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ---- Scroll Reveal ----
    const revealElements = document.querySelectorAll('.reveal');
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Stats counter observer
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(num => animateCounter(num));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // ---- Active Navigation Link ----
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLink.style.color = 'var(--text-primary)';
                } else {
                    navLink.style.color = '';
                }
            }
        });
    });

    // ---- Smooth Scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // Interactive Particle Constellation Renderer
    // ============================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles, mouse, animId;
        const isMobile = window.innerWidth <= 768;
        const PARTICLE_COUNT = isMobile ? 35 : 80;
        const CONNECT_DIST = isMobile ? 100 : 150;
        const MOUSE_RADIUS = isMobile ? 140 : 200;

        mouse = { x: -9999, y: -9999 };

        function resize() {
            const hero = document.getElementById('hero');
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
                this.baseAlpha = Math.random() * 0.5 + 0.2;
                this.alpha = this.baseAlpha;
                // Color: mix between indigo and cyan
                const t = Math.random();
                this.r = Math.floor(99 + (6 - 99) * t);
                this.g = Math.floor(102 + (182 - 102) * t);
                this.b = Math.floor(241 + (212 - 241) * t);
            }
            update() {
                // Mouse repulsion / attraction
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    const angle = Math.atan2(dy, dx);
                    // Gentle orbit: push outward + slight tangential
                    this.vx += Math.cos(angle) * force * 0.02 + Math.cos(angle + 1.57) * force * 0.008;
                    this.vy += Math.sin(angle) * force * 0.02 + Math.sin(angle + 1.57) * force * 0.008;
                    this.alpha = Math.min(1, this.baseAlpha + force * 0.6);
                } else {
                    this.alpha += (this.baseAlpha - this.alpha) * 0.02;
                }

                // Damping
                this.vx *= 0.99;
                this.vy *= 0.99;

                this.x += this.vx;
                this.y += this.vy;

                // Wrap edges
                if (this.x < -20) this.x = w + 20;
                if (this.x > w + 20) this.x = -20;
                if (this.y < -20) this.y = h + 20;
                if (this.y > h + 20) this.y = -20;
            }
            draw() {
                // Glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.08})`;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
                ctx.fill();
            }
        }

        function init() {
            resize();
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECT_DIST) {
                        const alpha = (1 - dist / CONNECT_DIST) * 0.15;
                        // Gradient line
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
            for (let i = 0; i < particles.length; i++) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS) {
                    const alpha = (1 - dist / MOUSE_RADIUS) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        }

        function drawMouseGlow() {
            if (mouse.x < 0) return;
            const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
            gradient.addColorStop(0, 'rgba(99,102,241,0.06)');
            gradient.addColorStop(0.5, 'rgba(6,182,212,0.02)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(mouse.x - MOUSE_RADIUS, mouse.y - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2);
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            drawMouseGlow();
            drawConnections();
            for (const p of particles) {
                p.update();
                p.draw();
            }
            animId = requestAnimationFrame(animate);
        }

        // Mouse & touch tracking on hero section
        const heroEl = document.getElementById('hero');
        heroEl.addEventListener('mousemove', (e) => {
            const rect = heroEl.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        heroEl.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });
        heroEl.addEventListener('touchmove', (e) => {
            const rect = heroEl.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }, { passive: true });
        heroEl.addEventListener('touchend', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        window.addEventListener('resize', () => {
            resize();
        });

        // Start when unlocked or immediately
        if (isUnlocked()) {
            init();
            animate();
        } else {
            const obs = new MutationObserver(() => {
                if (lockScreen.classList.contains('unlocked')) {
                    init();
                    animate();
                    obs.disconnect();
                }
            });
            obs.observe(lockScreen, { attributes: true, attributeFilter: ['class'] });
        }

        // Pause when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else {
                animate();
            }
        });
    }

    // ============================================
    // Code Popup on Skill Hover
    // ============================================
    const codeData = {
        hlsl: {
            label: 'DNABLE — Custom Toon Shader',
            lang: 'HLSL',
            desc: 'Anisotropy 값으로 NPR(셀 셰이딩)과 PBR(물리 기반 렌더링)을 실시간 블렌딩하는 커스텀 BxDF',
            code: `<span class="code-type">FDirectLighting</span> <span class="code-fn">SelShaderBxDF</span>(<span class="code-type">FGBufferData</span> GBuffer, <span class="code-type">half3</span> N, V, L,
                              <span class="code-type">float</span> Falloff, <span class="code-type">half</span> NoL) {
    <span class="code-type">BxDFContext</span> Context;
    Init(Context, N, V, L);
    Context.NoV = <span class="code-fn">saturate</span>(<span class="code-fn">abs</span>(Context.NoV) + <span class="code-num">1e-5</span>);

    <span class="code-comment">// NPR: Raw NoL for cel shading</span>
    Lighting.Diffuse = Falloff * NoL;

    <span class="code-comment">// PBR: DiffuseColor/PI + GGX Specular</span>
    <span class="code-type">float3</span> PBRDiffuse = FalloffColor * GBuffer.DiffuseColor * TOON_INV_PI;
    <span class="code-type">float3</span> PBRSpecular = FalloffColor * <span class="code-fn">CalculatePBRSpecular</span>(
        GBuffer.Roughness, GBuffer.Metallic, GBuffer.BaseColor, N, V, L);

    <span class="code-comment">// Anisotropy 기반 NPR ↔ PBR 블렌드</span>
    <span class="code-type">half</span> Blend = <span class="code-fn">saturate</span>(GBuffer.Anisotropy);
    <span class="code-key">return</span> <span class="code-fn">lerp</span>(NPRResult, PBRResult, Blend);
}`
        },
        cpp: {
            label: 'DNABLE — Arm Collision IK',
            lang: 'C++',
            desc: '캡슐-포인트 충돌 검출 기반 팔 관통 방지 IK. 로컬 좌표 변환 후 밀어내기 벡터 계산',
            code: `<span class="code-type">bool</span> <span class="code-fn">CheckCapsuleCollision</span>(<span class="code-key">const</span> <span class="code-type">FVector</span>&amp; Point,
    <span class="code-key">const</span> <span class="code-type">FCapsuleCollisionData</span>&amp; Capsule, <span class="code-type">FVector</span>&amp; OutPush) {

    <span class="code-comment">// 월드 → 캡슐 로컬 좌표 변환</span>
    <span class="code-type">FVector</span> Local = Capsule.WorldRotation.<span class="code-fn">UnrotateVector</span>(
        Point - Capsule.WorldCenter);
    <span class="code-type">float</span> ClampedZ = <span class="code-fn">FMath::Clamp</span>(Local.Z,
        -Capsule.HalfHeight, Capsule.HalfHeight);

    <span class="code-type">FVector</span> ToPoint = Local - <span class="code-type">FVector</span>(<span class="code-num">0</span>, <span class="code-num">0</span>, ClampedZ);
    <span class="code-type">float</span> Dist = ToPoint.<span class="code-fn">Size2D</span>();

    <span class="code-key">if</span> (Dist &lt; Capsule.Radius + PushOutDistance) {
        <span class="code-comment">// 밀어내기 벡터 → 월드 좌표로 복원</span>
        <span class="code-type">FVector</span> Dir = <span class="code-type">FVector</span>(ToPoint.X, ToPoint.Y, <span class="code-num">0</span>).<span class="code-fn">GetSafeNormal</span>();
        OutPush = Capsule.WorldRotation.<span class="code-fn">RotateVector</span>(Dir * (Radius - Dist));
        <span class="code-key">return true</span>;
    }
    <span class="code-key">return false</span>;
}`
        },
        shading: {
            label: 'XROOM — GPU Color Conversion',
            lang: 'HLSL',
            desc: 'NDI 방송 송출을 위한 BGRA → UYVY 실시간 GPU 색공간 변환 (4:2:2 크로마 서브샘플링)',
            code: `<span class="code-type">void</span> <span class="code-fn">NDIIOBGRAtoUYVYPS</span>(<span class="code-type">float4</span> InPosition : SV_POSITION,
                       <span class="code-type">float2</span> InUV : TEXCOORD0,
                       <span class="code-key">out</span> <span class="code-type">float4</span> OutColor : SV_Target0) {
    <span class="code-type">float3x3</span> RGBToYCbCrMat = {
        <span class="code-num">0.183</span>,  <span class="code-num">0.614</span>,  <span class="code-num">0.062</span>,
       <span class="code-num">-0.101</span>, <span class="code-num">-0.339</span>,  <span class="code-num">0.439</span>,
        <span class="code-num">0.439</span>, <span class="code-num">-0.399</span>, <span class="code-num">-0.040</span>  };

    <span class="code-comment">// 인접 2픽셀 샘플링 → YCbCr 변환</span>
    <span class="code-type">float3</span> YUV0 = <span class="code-fn">mul</span>(RGBToYCbCrMat, RGB0) + RGBToYCbCrVec;
    <span class="code-type">float3</span> YUV1 = <span class="code-fn">mul</span>(RGBToYCbCrMat, RGB1) + RGBToYCbCrVec;

    OutColor.xz = (YUV0.zy + YUV1.zy) / <span class="code-num">2.0</span>;  <span class="code-comment">// Cb, Cr 평균</span>
    OutColor.y  = YUV0.x;   <span class="code-comment">// Y0</span>
    OutColor.w  = YUV1.x;   <span class="code-comment">// Y1</span>
}`
        },
        arkit: {
            label: 'DNABLE — ARKit Facial MoCap',
            lang: 'C++',
            desc: '52개 ARKit Blend Shape 실시간 리매핑. 스레드 안전 스냅샷 패턴으로 데이터 경합 방지',
            code: `<span class="code-type">void</span> <span class="code-type">UARKitFacialPreProcessor</span>::<span class="code-fn">UpdateWorkerSnapshot</span>() {
    <span class="code-comment">// Atomic swap — 이전 워커는 기존 데이터로 계속 동작</span>
    <span class="code-type">TSharedPtr</span>&lt;<span class="code-type">FWorker</span>, <span class="code-type">ESPMode</span>::ThreadSafe&gt; NewWorker =
        <span class="code-fn">MakeShared</span>&lt;<span class="code-type">FWorker</span>, <span class="code-type">ESPMode</span>::ThreadSafe&gt;();

    <span class="code-key">for</span> (<span class="code-key">const</span> <span class="code-type">FName</span>&amp; Name : <span class="code-fn">GetARKitBlendShapeNames</span>()) {
        <span class="code-key">const</span> <span class="code-type">FRemap</span>* Data = RemapSettings-&gt;<span class="code-fn">GetBlendShapeRemap</span>(Name);
        <span class="code-key">if</span> (Data) NewWorker-&gt;Snapshot.<span class="code-fn">Add</span>(Name, *Data);
    }
    WorkerInstance = NewWorker;  <span class="code-comment">// 원자적 교체</span>
}

<span class="code-comment">// 커브 기반 리매핑 파이프라인</span>
Value *= RemapData-&gt;Multiplier;
Value += RemapData-&gt;Offset;
Value = <span class="code-fn">FMath::Clamp</span>(Value, MinLimit, MaxLimit);
<span class="code-key">if</span> (RemapData-&gt;bUseCurveRemap)
    Value = RemapData-&gt;RemapCurve.<span class="code-fn">Eval</span>(Value);`
        },
        ndi: {
            label: 'DNABLE — NDI Double-Buffer',
            lang: 'C++',
            desc: 'GPU→CPU 비동기 텍스처 리드백 이중 버퍼. 파이프라인 지연 최소화',
            code: `<span class="code-key">class</span> <span class="code-type">MappedTextureASyncSender</span> {
    <span class="code-type">MappedTexture</span> MappedTextures[<span class="code-num">2</span>];  <span class="code-comment">// 이중 버퍼</span>
    <span class="code-type">int32</span> CurrentIndex = <span class="code-num">0</span>;
<span class="code-key">public</span>:
    <span class="code-type">void</span> <span class="code-fn">Resolve</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
                 <span class="code-type">FRHITexture</span>* Source, <span class="code-key">const</span> <span class="code-type">FResolveRect</span>&amp; Rect);
    <span class="code-type">void</span> <span class="code-fn">Map</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
             <span class="code-type">int32</span>&amp; W, <span class="code-type">int32</span>&amp; H, <span class="code-type">int32</span>&amp; Stride);
    <span class="code-type">void</span> <span class="code-fn">Send</span>(<span class="code-type">FRHICommandListImmediate</span>&amp; RHICmdList,
              <span class="code-type">NDIlib_send_instance_t</span> p_send,
              <span class="code-type">NDIlib_video_frame_v2_t</span>&amp; frame);
};

<span class="code-comment">// Letterbox / Pillarbox 비율 보정</span>
<span class="code-type">float</span> FrameRatio  = FrameSize.X / (<span class="code-type">float</span>)FrameSize.Y;
<span class="code-type">float</span> TargetRatio = TargetSize.X / (<span class="code-type">float</span>)TargetSize.Y;
<span class="code-key">if</span> (TargetRatio &gt; FrameRatio)
    NewSize.Y = <span class="code-fn">FMath::RoundToInt</span>(FrameSize.X / TargetRatio);`
        },
        audio: {
            label: 'XROOM — Audio Channel Mixing',
            lang: 'C++',
            desc: 'NDI 수신 오디오 채널 자동 다운믹스/업믹스. Float32 → Int16 변환 포함',
            code: `<span class="code-type">int32</span> <span class="code-fn">GeneratePCMData</span>(<span class="code-type">uint8</span>* PCMData, <span class="code-type">int32</span> SamplesNeeded) {
    <span class="code-fn">NDIlib_framesync_capture_audio</span>(p_framesync, &amp;audio_frame,
        requested_rate, <span class="code-num">0</span>, <span class="code-fn">FMath::Min</span>(available, requested));

    <span class="code-key">if</span> (req_ch &lt; audio_frame.no_channels) {
        <span class="code-comment">// 다운믹스: 초과 채널 → 기존 채널에 합산</span>
        <span class="code-key">for</span> (<span class="code-type">int32</span> src = req_ch; src &lt; no_ch; ++src)
            <span class="code-key">for</span> (<span class="code-type">int32</span> dst = <span class="code-num">0</span>; dst &lt; req_ch; ++dst)
                <span class="code-key">for</span> (<span class="code-type">int32</span> i = <span class="code-num">0</span>; i &lt; no_samples; ++i)
                    dst_data[i] += src_data[i];
    } <span class="code-key">else if</span> (req_ch &gt; audio_frame.no_channels) {
        <span class="code-comment">// 업믹스: 소스 채널 평균으로 빈 채널 채우기</span>
        sample_value /= audio_frame.no_channels;
        <span class="code-type">int16</span> sample = <span class="code-fn">FMath::Clamp</span>(
            <span class="code-fn">FMath::RoundToInt</span>(value * <span class="code-num">32767.0f</span>), INT16_MIN, INT16_MAX);
    }
}`
        }
    };

    const popup = document.getElementById('code-popup');
    const popupLabel = document.getElementById('code-popup-label');
    const popupLang = document.getElementById('code-popup-lang');
    const popupDesc = document.getElementById('code-popup-desc');
    const popupCode = document.getElementById('code-popup-code');
    const popupClose = document.getElementById('code-popup-close');
    let activeSkill = null;
    let hideTimeout = null;

    function showPopup(el, key) {
        const data = codeData[key];
        if (!data) return;
        popupLabel.textContent = data.label;
        popupLang.textContent = data.lang;
        popupDesc.textContent = data.desc;
        popupCode.innerHTML = data.code;

        const rect = el.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        popup.classList.add('active');

        if (!isMobile) {
            const popupRect = popup.getBoundingClientRect();
            let top = rect.bottom + 10;
            let left = rect.left;

            if (left + popupRect.width > window.innerWidth - 20) {
                left = window.innerWidth - popupRect.width - 20;
            }
            if (left < 10) left = 10;
            if (top + popupRect.height > window.innerHeight - 20) {
                top = rect.top - popupRect.height - 10;
            }

            popup.style.top = top + 'px';
            popup.style.left = left + 'px';
        }

        activeSkill = el;
    }

    function hidePopup() {
        popup.classList.remove('active');
        activeSkill = null;
    }

    document.querySelectorAll('.skill-item[data-code]').forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            showPopup(item, item.dataset.code);
        });
        item.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(hidePopup, 200);
        });
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeSkill === item) {
                hidePopup();
            } else {
                showPopup(item, item.dataset.code);
            }
        });
    });

    popup.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    popup.addEventListener('mouseleave', () => { hideTimeout = setTimeout(hidePopup, 200); });
    popupClose.addEventListener('click', hidePopup);
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !e.target.closest('.skill-item[data-code]')) {
            hidePopup();
        }
    });

    // ============================================
    // Backend Integration
    // ============================================

    // ---- 방문자 알림 전송 ----
    function sendVisitNotification() {
        try {
            fetch(BACKEND_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    type: 'visit',
                    browser: navigator.userAgent.split(' ').slice(-1)[0] || navigator.userAgent,
                    platform: navigator.platform || 'Unknown',
                    language: navigator.language || 'Unknown',
                    screen: `${screen.width}x${screen.height}`,
                    referrer: document.referrer || 'Direct'
                })
            });
        } catch (e) {
            // 알림 실패 시 무시
        }
    }

    // ---- 방문자 수 로드 ----
    function loadVisitorCount() {
        const countEl = document.getElementById('visitor-count');
        if (!countEl) return;
        fetch(`${BACKEND_URL}?action=count`)
            .then(res => res.json())
            .then(data => {
                if (data.count !== undefined) {
                    countEl.textContent = data.count.toLocaleString();
                }
            })
            .catch(() => {
                countEl.textContent = '-';
            });
    }

    loadVisitorCount();

    // ---- 메시지 폼 전송 ----
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('msg-name');
            const emailInput = document.getElementById('msg-email');
            const textInput = document.getElementById('msg-text');
            const submitBtn = document.getElementById('msg-submit');
            const btnText = document.getElementById('msg-btn-text');
            const btnLoading = document.getElementById('msg-btn-loading');
            const statusEl = document.getElementById('msg-status');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = textInput.value.trim();

            if (!name || !email || !message) return;

            // 전송 중 UI
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            statusEl.textContent = '';
            statusEl.className = 'msg-status';

            try {
                await fetch(BACKEND_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        type: 'message',
                        name: name,
                        email: email,
                        message: message
                    })
                });

                // no-cors 모드에서는 응답을 읽을 수 없으므로 전송 성공으로 처리
                statusEl.textContent = 'Message sent successfully!';
                statusEl.classList.add('success');
                nameInput.value = '';
                emailInput.value = '';
                textInput.value = '';
            } catch (err) {
                statusEl.textContent = 'Network error. Please try again.';
                statusEl.classList.add('error');
            }

            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        });
    }

});
