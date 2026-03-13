// ============================================
// UI Interactions — Nav, Scroll, Typing, Counters, Popups
// ============================================

/**
 * Initializes all non-canvas UI behaviors:
 * navigation, typing effect, scroll reveal, counters, code popups,
 * blog cards, deep-dive toggles.
 */
export function initUI() {
    // --- Navigation ---
    const nav = document.getElementById('nav');
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

    // --- Typing Effect ---
    const typedName = document.getElementById('typed-name');
    if (typedName) {
        const name = 'kim98828';
        let charIndex = 0;
        function typeChar() {
            if (charIndex < name.length) {
                typedName.textContent += name[charIndex++];
                setTimeout(typeChar, 150);
            }
        }
        setTimeout(typeChar, 800);
    }

    // --- Counter Animation (eased) ---
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            element.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // --- Scroll Reveal (IntersectionObserver) ---
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Stats counter — trigger once when hero stats enter viewport
    let statsAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                document.querySelectorAll('.stat-number').forEach(num => animateCounter(num));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    // --- Scroll: Nav Effect + Active Link ---
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        nav.classList.toggle('scrolled', currentScroll > 50);

        const scrollY = currentScroll + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (navLink) {
                navLink.style.color = (scrollY >= top && scrollY < top + height)
                    ? 'var(--text-primary)' : '';
            }
        });
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- Code Popup (Skill Hover) ---
    initCodePopup(observer);

    // --- Blog Cards ---
    initBlogCards(observer);

    // --- Deep Dive Toggles ---
    document.querySelectorAll('.deepdive-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = document.getElementById(btn.dataset.target);
            if (!content) return;
            btn.classList.toggle('active');
            content.classList.toggle('open');
        });
    });
}

// --- Code Popup ---
function initCodePopup(observer) {
    const popup = document.getElementById('code-popup');
    if (!popup) return;

    const popupLabel = document.getElementById('code-popup-label');
    const popupLang = document.getElementById('code-popup-lang');
    const popupDesc = document.getElementById('code-popup-desc');
    const popupCode = document.getElementById('code-popup-code');
    const popupClose = document.getElementById('code-popup-close');
    let activeSkill = null;
    let hideTimeout = null;

    function showPopup(el, key) {
        if (typeof codeData === 'undefined') return;
        const data = codeData[key];
        if (!data) return;
        popupLabel.textContent = data.label;
        popupLang.textContent = data.lang;
        popupDesc.textContent = data.desc;
        popupCode.innerHTML = data.code;

        const rect = el.getBoundingClientRect();
        popup.classList.add('active');

        if (window.innerWidth > 768) {
            const popupRect = popup.getBoundingClientRect();
            let top = rect.bottom + 10;
            let left = rect.left;
            if (left + popupRect.width > window.innerWidth - 20) left = window.innerWidth - popupRect.width - 20;
            if (left < 10) left = 10;
            if (top + popupRect.height > window.innerHeight - 20) top = rect.top - popupRect.height - 10;
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
        item.addEventListener('mouseenter', () => { clearTimeout(hideTimeout); showPopup(item, item.dataset.code); });
        item.addEventListener('mouseleave', () => { hideTimeout = setTimeout(hidePopup, 200); });
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            activeSkill === item ? hidePopup() : showPopup(item, item.dataset.code);
        });
    });

    popup.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    popup.addEventListener('mouseleave', () => { hideTimeout = setTimeout(hidePopup, 200); });
    popupClose.addEventListener('click', hidePopup);
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !e.target.closest('.skill-item[data-code]')) hidePopup();
    });
}

// --- Blog Cards ---
function initBlogCards(observer) {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid || typeof blogData === 'undefined') return;

    const FEATURED_COUNT = 3;
    const featured = blogData.slice(0, FEATURED_COUNT);
    const rest = blogData.slice(FEATURED_COUNT);

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

    blogGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        if (card) card.classList.toggle('expanded');
    });
}
