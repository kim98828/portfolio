// ============================================
// Portfolio - Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Backend URL (Google Apps Script 배포 후 여기에 URL 입력) ----
    const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwjybNykq_dgtRSKpq5eVd2xEplXI0cx92e9Xau7ehIwDmWnYvhiW-rnxxvGU0yYt22Rw/exec';

    // ---- Send visit notification on load ----
    sendVisitNotification();

    // ---- Reduced Motion Check ----
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Navigation Scroll Effect ----
    const nav = document.getElementById('nav');

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

    // ---- Scroll: Nav Effect + Active Link ----
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Nav scrolled class
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Active nav link highlight
        const scrollY = currentScroll + 100;
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

    // ---- Smooth Scroll for anchor links (with View Transitions) ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                });
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // Interactive Particle Constellation Renderer
    // ============================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas && !prefersReducedMotion) {
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

        // Start immediately
        init();
        animate();

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
    // (codeData is loaded from codeData.js)
    // ============================================
    // codeData is loaded from external codeData.js
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
    // Blog Cards — Featured 3 + Title List
    // ============================================
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid && typeof blogData !== 'undefined') {
        const FEATURED_COUNT = 3;
        const featured = blogData.slice(0, FEATURED_COUNT);
        const rest = blogData.slice(FEATURED_COUNT);

        // Render featured 3 as full cards
        blogGrid.innerHTML = featured.map(card => `
            <div class="blog-card reveal" data-tag="${card.tag}" data-id="${card.id}">
                <div class="blog-card-header">
                    <span class="blog-tag" data-tag="${card.tag}">${card.tag}</span>
                    <h4 class="blog-card-title">${card.title}</h4>
                </div>
                <p class="blog-card-problem">${card.problem}</p>
                <div class="blog-card-expand">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    <span>Detail</span>
                </div>
                <div class="blog-card-detail">
                    <div class="blog-detail-label">Solution</div>
                    <p class="blog-detail-text">${card.solution}</p>
                    <div class="blog-detail-label">Key Insight</div>
                    <div class="blog-detail-insight">${card.insight}</div>
                    ${card.arch ? `<div class="blog-detail-label">Architecture</div><pre class="blog-detail-arch">${card.arch}</pre>` : ''}
                </div>
            </div>
        `).join('');

        blogGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Render rest as compact title list
        if (rest.length > 0) {
            const listEl = document.createElement('div');
            listEl.className = 'blog-preview-list reveal';
            listEl.innerHTML = `
                <div class="blog-preview-header">
                    <span class="blog-preview-plus">+${rest.length}</span>
                    <span>more Problem Solving cards</span>
                </div>
                <div class="blog-preview-grid">
                    ${rest.map(card => `
                        <div class="blog-preview-item">
                            <span class="blog-tag" data-tag="${card.tag}">${card.tag}</span>
                            <span class="blog-preview-title">${card.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            blogGrid.parentElement.appendChild(listEl);
            observer.observe(listEl);

            // CTA
            const cta = document.createElement('div');
            cta.className = 'blog-cta-overlay reveal';
            cta.innerHTML = `
                <div class="blog-cta-content">
                    <p class="blog-cta-count">총 ${blogData.length}개의 Problem Solving 카드</p>
                    <p class="blog-cta-text">상세 내용이 궁금하시면 연락해주세요</p>
                    <a href="#contact" class="btn btn-primary blog-cta-btn">Contact Me</a>
                </div>
            `;
            blogGrid.parentElement.appendChild(cta);
            observer.observe(cta);
        }

        // Card expand/collapse (featured only)
        blogGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.blog-card');
            if (!card) return;
            card.classList.toggle('expanded');
        });
    }

    // ============================================
    // Deep Dive Toggle
    // ============================================
    document.querySelectorAll('.deepdive-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const content = document.getElementById(targetId);
            if (!content) return;

            btn.classList.toggle('active');
            content.classList.toggle('open');
        });
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

    // ============================================
    // Domain Filter (Insights + Q&A)
    // ============================================
    document.querySelectorAll('.domain-filter').forEach(filterBar => {
        const targetId = filterBar.dataset.target;
        const grid = document.getElementById(targetId);
        if (!grid) return;

        const buttons = filterBar.querySelectorAll('.domain-filter-btn');
        const cards = grid.querySelectorAll('[data-domain]');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter cards
                let visibleCount = 0;
                cards.forEach(card => {
                    if (filter === 'all' || card.dataset.domain === filter) {
                        card.classList.remove('domain-hidden');
                        card.classList.add('domain-show');
                        visibleCount++;
                    } else {
                        card.classList.add('domain-hidden');
                        card.classList.remove('domain-show');
                    }
                });

                // Also hide/show the "Core Killing Features" sub-header if in insights
                if (targetId === 'insights-grid') {
                    const subHeaders = grid.parentElement.querySelectorAll('.section-header[style]');
                    subHeaders.forEach(sh => {
                        // Show sub-header only when "all" or "engine" is selected (killing features are all engine)
                        if (filter === 'all' || filter === 'engine') {
                            sh.style.display = '';
                        } else {
                            sh.style.display = 'none';
                        }
                    });
                    // Also filter the second insights-grid (killing features)
                    const killingGrid = grid.parentElement.querySelectorAll('.insights-grid');
                    if (killingGrid.length > 1) {
                        const killingCards = killingGrid[1].querySelectorAll('[data-domain]');
                        killingCards.forEach(card => {
                            if (filter === 'all' || card.dataset.domain === filter) {
                                card.classList.remove('domain-hidden');
                                card.classList.add('domain-show');
                            } else {
                                card.classList.add('domain-hidden');
                                card.classList.remove('domain-show');
                            }
                        });
                    }
                }
            });
        });
    });

    // ============================================
    // Expertise Hub — View Toggle
    // ============================================
    const expertiseTabs = document.querySelectorAll('.expertise-tab');
    const expertiseViews = document.querySelectorAll('.expertise-view');

    expertiseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = 'view-' + tab.dataset.view;

            // Update tabs
            expertiseTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update views
            expertiseViews.forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            // Re-trigger radar animation when switching to domain view
            if (tab.dataset.view === 'domain' && radarCanvas) {
                resizeRadar();
                animProgress = 0;
                drawRadar();
            }

            // Re-observe reveal elements in newly visible view
            if (target) {
                target.querySelectorAll('.reveal:not(.visible)').forEach(el => {
                    observer.observe(el);
                });
            }
        });
    });

    // ============================================
    // Expertise Hub — Radar Chart + Domain Cards
    // ============================================

    const radarCanvas = document.getElementById('radar-canvas');
    let resizeRadar = () => {};
    let drawRadar = () => {};
    let animProgress = 0;

    if (radarCanvas && !prefersReducedMotion) {
        const rctx = radarCanvas.getContext('2d');
        const domainCards = document.querySelectorAll('.domain-card');

        // Domain data: name, value (0-1), color
        const domains = [
            { name: 'Engine', value: 0.95, color: '#f59e0b', key: 'engine' },
            { name: 'Pipeline', value: 0.90, color: '#06b6d4', key: 'pipeline' },
            { name: 'AI', value: 0.85, color: '#ec4899', key: 'ai' },
            { name: 'Frontend', value: 0.75, color: '#6366f1', key: 'frontend' },
            { name: 'Backend', value: 0.70, color: '#10b981', key: 'backend' }
        ];

        const count = domains.length;
        let radarAnimId = null;
        let hoveredDomain = -1;

        function getCanvasSize() {
            const rect = radarCanvas.parentElement.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            return size;
        }

        resizeRadar = function() {
            const size = getCanvasSize();
            const dpr = window.devicePixelRatio || 1;
            radarCanvas.width = size * dpr;
            radarCanvas.height = size * dpr;
            radarCanvas.style.width = size + 'px';
            radarCanvas.style.height = size + 'px';
            rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        drawRadar = function() {
            const size = getCanvasSize();
            const cx = size / 2;
            const cy = size / 2;
            const maxR = size * 0.38;

            rctx.clearRect(0, 0, size, size);

            // Draw grid rings (5 levels)
            for (let level = 1; level <= 5; level++) {
                const r = maxR * (level / 5);
                rctx.beginPath();
                for (let i = 0; i <= count; i++) {
                    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    if (i === 0) rctx.moveTo(x, y);
                    else rctx.lineTo(x, y);
                }
                rctx.closePath();
                rctx.strokeStyle = 'rgba(255,255,255,0.06)';
                rctx.lineWidth = 0.8;
                rctx.stroke();
            }

            // Draw axis lines
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                rctx.beginPath();
                rctx.moveTo(cx, cy);
                rctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
                rctx.strokeStyle = 'rgba(255,255,255,0.08)';
                rctx.lineWidth = 0.6;
                rctx.stroke();
            }

            // Draw filled area (animated)
            const ease = 1 - Math.pow(1 - Math.min(animProgress, 1), 3);
            rctx.beginPath();
            for (let i = 0; i <= count; i++) {
                const idx = i % count;
                const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
                const r = maxR * domains[idx].value * ease;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) rctx.moveTo(x, y);
                else rctx.lineTo(x, y);
            }
            rctx.closePath();

            // Gradient fill
            const grad = rctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
            grad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
            grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
            grad.addColorStop(1, 'rgba(99, 102, 241, 0.03)');
            rctx.fillStyle = grad;
            rctx.fill();

            // Border
            rctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
            rctx.lineWidth = 1.5;
            rctx.stroke();

            // Draw vertices + labels
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                const r = maxR * domains[i].value * ease;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                const isHovered = hoveredDomain === i;

                // Vertex glow
                if (isHovered) {
                    rctx.beginPath();
                    rctx.arc(x, y, 12, 0, Math.PI * 2);
                    rctx.fillStyle = domains[i].color.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', '');
                    // Use hex to rgba
                    const hc = domains[i].color;
                    const hr = parseInt(hc.slice(1,3), 16);
                    const hg = parseInt(hc.slice(3,5), 16);
                    const hb = parseInt(hc.slice(5,7), 16);
                    rctx.fillStyle = `rgba(${hr},${hg},${hb},0.2)`;
                    rctx.fill();
                }

                // Vertex dot
                rctx.beginPath();
                rctx.arc(x, y, isHovered ? 6 : 4, 0, Math.PI * 2);
                rctx.fillStyle = domains[i].color;
                rctx.fill();

                // Label
                const labelR = maxR + 24;
                const lx = cx + Math.cos(angle) * labelR;
                const ly = cy + Math.sin(angle) * labelR;

                rctx.font = isHovered ? '600 13px Inter' : '500 12px Inter';
                rctx.fillStyle = isHovered ? domains[i].color : 'rgba(255,255,255,0.6)';
                rctx.textAlign = 'center';
                rctx.textBaseline = 'middle';
                rctx.fillText(domains[i].name, lx, ly);

                // Value percentage
                const pctR = maxR + 40;
                const px = cx + Math.cos(angle) * pctR;
                const py = cy + Math.sin(angle) * pctR;
                rctx.font = '500 10px Inter';
                rctx.fillStyle = isHovered ? domains[i].color : 'rgba(255,255,255,0.3)';
                rctx.fillText(Math.round(domains[i].value * 100) + '%', px, py);
            }

            // Animate
            if (animProgress < 1) {
                animProgress += 0.025;
                radarAnimId = requestAnimationFrame(drawRadar);
            }
        }

        // Mouse interaction on radar
        radarCanvas.addEventListener('mousemove', (e) => {
            const rect = radarCanvas.getBoundingClientRect();
            const size = getCanvasSize();
            const mx = (e.clientX - rect.left) * (size / rect.width);
            const my = (e.clientY - rect.top) * (size / rect.height);
            const cx = size / 2;
            const cy = size / 2;
            const maxR = size * 0.38;

            let closest = -1;
            let closestDist = Infinity;
            const ease = 1 - Math.pow(1 - Math.min(animProgress, 1), 3);

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                const r = maxR * domains[i].value * ease;
                const vx = cx + Math.cos(angle) * r;
                const vy = cy + Math.sin(angle) * r;
                const d = Math.sqrt((mx - vx) ** 2 + (my - vy) ** 2);
                if (d < 30 && d < closestDist) {
                    closest = i;
                    closestDist = d;
                }
            }

            if (hoveredDomain !== closest) {
                hoveredDomain = closest;
                drawRadar();
                // Highlight corresponding card
                domainCards.forEach(card => card.classList.remove('radar-hover'));
                if (closest >= 0) {
                    const key = domains[closest].key;
                    const card = document.querySelector(`.domain-card[data-domain="${key}"]`);
                    if (card) card.classList.add('radar-hover');
                }
            }
        });

        radarCanvas.addEventListener('mouseleave', () => {
            hoveredDomain = -1;
            drawRadar();
            domainCards.forEach(card => card.classList.remove('radar-hover'));
        });

        // Click on radar vertex → expand card
        radarCanvas.addEventListener('click', (e) => {
            if (hoveredDomain >= 0) {
                const key = domains[hoveredDomain].key;
                const card = document.querySelector(`.domain-card[data-domain="${key}"]`);
                if (card) {
                    card.classList.toggle('expanded');
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });

        // Start radar animation when visible
        const radarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    resizeRadar();
                    animProgress = 0;
                    drawRadar();
                    radarObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        radarObserver.observe(radarCanvas.parentElement);

        window.addEventListener('resize', () => {
            resizeRadar();
            drawRadar();
        });
    }

    // Domain card expand/collapse
    document.querySelectorAll('.domain-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking inside the detail panel links
            if (e.target.closest('.domain-detail a')) return;
            card.classList.toggle('expanded');
        });

        // Animate level bar on scroll
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        cardObserver.observe(card);
    });

});
