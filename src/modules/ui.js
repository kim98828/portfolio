// ============================================
// UI Interactions — Nav, Scroll, Typing, Counters, Popups
// ============================================

import { archToSvg } from './arch-svg.js';

/** Render a blog card's "Architecture": SVG for trees, <pre> for flow/box. */
function renderArch(arch) {
    const svg = archToSvg(arch);
    return svg
        ? `<div class="arch-svg">${svg}</div>`
        : `<pre class="blog-detail-arch">${arch}</pre>`;
}

/** Run `loader` once when `target` first nears the viewport (300px margin). */
function lazyLoadOnView(target, loader) {
    if (!target) return;
    const io = new IntersectionObserver((entries, obs) => {
        if (entries.some(e => e.isIntersecting)) {
            obs.disconnect();
            loader();
        }
    }, { rootMargin: '300px' });
    io.observe(target);
}

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

    // --- Smooth Scroll (with View Transitions) ---
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

    // --- Lazy-load heavy data (blogData ~80KB, codeData ~48KB) ---
    // Defer until each consuming section approaches the viewport, then init.
    // Vite splits each dynamic import() into its own chunk, so the data is
    // fetched on demand rather than bundled into the initial payload.
    lazyLoadOnView(document.getElementById('blog-grid'), () =>
        import('../data/blogData.js').then(m => initBlogCards(observer, m.blogData, m.blogCategories)).catch(() => {}));

    lazyLoadOnView(document.getElementById('skills'), () =>
        import('../data/codeData.js').then(m => initCodePopup(observer, m.codeData)).catch(() => {}));

    // --- Deep Dive Toggles ---
    document.querySelectorAll('.deepdive-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = document.getElementById(btn.dataset.target);
            if (!content) return;
            btn.classList.toggle('active');
            content.classList.toggle('open');
        });
    });

    // --- Master Domain Filter (Technical Depth section) ---
    const masterFilter = document.getElementById('master-domain-filter');
    if (masterFilter) {
        const section = masterFilter.closest('section');
        const allCards = section.querySelectorAll('[data-domain]');
        const killingHeader = section.querySelector('.section-header[style]');
        const buttons = masterFilter.querySelectorAll('.domain-filter-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                allCards.forEach(card => {
                    if (filter === 'all' || card.dataset.domain === filter) {
                        card.classList.remove('domain-hidden');
                        card.classList.add('domain-show');
                    } else {
                        card.classList.add('domain-hidden');
                        card.classList.remove('domain-show');
                    }
                });

                if (killingHeader) {
                    killingHeader.style.display = (filter === 'all' || filter === 'engine') ? '' : 'none';
                }
            });
        });
    }
}

// --- Code Popup ---
function initCodePopup(observer, codeData) {
    const popup = document.getElementById('code-popup');
    if (!popup || !codeData) return;

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

// Category header icons (Feather-style line glyphs), keyed by category id.
// A new category adds its accent in blogData.js and its icon here.
const CAT_ICONS = {
    rendering: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    pipeline:  '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    broadcast: '<circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14M7.76 16.24a6 6 0 0 1 0-8.48M16.24 7.76a6 6 0 0 1 0 8.48M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    tool:      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    delivery:  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    mocap:     '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
};

// --- Blog Cards (role-lens filter × category sections) ---
function initBlogCards(observer, blogData, blogCategories) {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid || !blogData) return;

    const INITIAL_PER_CAT = 3;      // cards shown before "+N more"
    const parent = blogGrid.parentElement;
    const lensFilter = document.getElementById('blog-lens-filter');
    const cats = Array.isArray(blogCategories) ? blogCategories : [];

    // Switch the grid container into a vertical stack of category sections.
    blogGrid.classList.add('blog-grid--sections');

    const cardsForLens = (lens) => {
        if (lens === 'all') return blogData;
        const match = blogData.filter(c => Array.isArray(c.domains) && c.domains.includes(lens));
        // Cards whose PRIMARY domain is the lens lead (stable), so each lens
        // surfaces its most representative work before secondary-tagged cards.
        return [
            ...match.filter(c => c.domains[0] === lens),
            ...match.filter(c => c.domains[0] !== lens),
        ];
    };

    // Group a card pool into ordered category buckets. Any card whose tag is
    // unmapped falls into a trailing '기타' bucket so nothing silently drops.
    const tagToCat = new Map();
    cats.forEach(c => c.tags.forEach(t => tagToCat.set(t, c.id)));
    function groupByCategory(pool) {
        const buckets = new Map(cats.map(c => [c.id, []]));
        const misc = [];
        pool.forEach(card => {
            const cid = tagToCat.get(card.tag);
            (cid ? buckets.get(cid) : misc).push(card);
        });
        const out = cats
            .map(c => ({ id: c.id, name: c.name, accent: c.accent, cards: buckets.get(c.id) }))
            .filter(g => g.cards.length > 0);
        if (misc.length) out.push({ id: 'misc', name: '기타', cards: misc });
        return out;
    }

    const cardHTML = (card, extraClass = '') => `
        <div class="blog-card reveal${extraClass}" data-tag="${card.tag}" data-id="${card.id}">
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
                ${card.arch ? `<div class="blog-detail-label">Architecture</div>${renderArch(card.arch)}` : ''}
            </div>
        </div>
    `;

    const sectionHTML = (group) => {
        const cards = group.cards
            .map((card, i) => cardHTML(card, i >= INITIAL_PER_CAT ? ' blog-cat-hidden' : ''))
            .join('');
        const rest = Math.max(0, group.cards.length - INITIAL_PER_CAT);
        const more = rest > 0
            ? `<button class="blog-category-more" type="button"><span class="more-label">+${rest} more</span></button>`
            : '';
        const icon = CAT_ICONS[group.id] || '';
        const accentStyle = group.accent ? ` style="--cat-accent:${group.accent}"` : '';
        return `
            <section class="blog-category" data-cat="${group.id}"${accentStyle}>
                <header class="blog-category-head">
                    <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    ${icon ? `<span class="blog-category-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span>` : ''}
                    <span class="blog-category-name">${group.name}</span>
                    <span class="blog-category-count">${group.cards.length}</span>
                </header>
                <div class="blog-category-body">
                    <div class="blog-category-grid">${cards}</div>
                    ${more}
                </div>
            </section>`;
    };

    // reveal: on initial load animate via observer; on lens switch show immediately (already in view)
    function reveal(el, immediate) {
        if (immediate) el.classList.add('visible');
        else observer.observe(el);
    }

    function render(lens, immediate) {
        parent.querySelectorAll('.blog-cta-overlay').forEach(el => el.remove());

        const pool = cardsForLens(lens);
        blogGrid.innerHTML = groupByCategory(pool).map(sectionHTML).join('');

        // Visible cards animate in; cards behind "+N more" are pre-shown
        // (hidden by CSS) so they appear instantly when the section expands.
        blogGrid.querySelectorAll('.blog-card').forEach(el => {
            if (el.classList.contains('blog-cat-hidden')) el.classList.add('visible');
            else reveal(el, immediate);
        });

        const total = pool.length;
        const countText = (lens === 'all')
            ? `총 ${total}개의 Problem Solving 카드`
            : `이 렌즈에 해당하는 ${total}개 카드`;
        const cta = document.createElement('div');
        cta.className = 'blog-cta-overlay reveal';
        cta.innerHTML = `
            <div class="blog-cta-content">
                <p class="blog-cta-count">${countText}</p>
                <p class="blog-cta-text">상세 내용이 궁금하시면 연락해주세요</p>
                <a href="#contact" class="btn btn-primary blog-cta-btn">Contact Me</a>
            </div>
        `;
        blogGrid.insertAdjacentElement('afterend', cta);
        reveal(cta, immediate);
    }

    if (lensFilter) {
        const buttons = lensFilter.querySelectorAll('.domain-filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                render(btn.dataset.lens, true);
            });
        });
    }

    // Delegated clicks (attached once — blogGrid persists across re-renders):
    // category collapse, "+N more" expand, and per-card detail toggle.
    blogGrid.addEventListener('click', (e) => {
        const head = e.target.closest('.blog-category-head');
        if (head) { head.parentElement.classList.toggle('collapsed'); return; }

        const more = e.target.closest('.blog-category-more');
        if (more) {
            const cat = more.closest('.blog-category');
            const expanded = cat.classList.toggle('expanded-all');
            const hiddenCount = cat.querySelectorAll('.blog-cat-hidden').length;
            more.querySelector('.more-label').textContent = expanded ? '접기' : `+${hiddenCount} more`;
            return;
        }

        const card = e.target.closest('.blog-card');
        if (card) card.classList.toggle('expanded');
    });

    render('all', false);
}
