// ============================================
// Backend Integration — Google Apps Script
// ============================================
// Why no-cors mode:
// Google Apps Script web apps redirect on POST, making standard CORS
// requests fail. no-cors mode fires the request successfully but returns
// an opaque response — acceptable here since we only need fire-and-forget
// for visit notifications, and optimistic UI for the contact form.

import { BACKEND_URL } from './config.js';

/**
 * Send a visit notification to the backend (fire-and-forget).
 * Collects minimal browser metadata for analytics.
 */
export function sendVisitNotification() {
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
                referrer: document.referrer || 'Direct',
            }),
        });
    } catch {
        // Visit tracking is non-critical — silent failure is acceptable
    }
}

/** Load and display the visitor count from the backend */
export function loadVisitorCount() {
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

/** Initialize the contact form submission handler */
export function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

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

        // Loading state
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
                body: JSON.stringify({ type: 'message', name, email, message }),
            });

            // Optimistic success — no-cors returns opaque response
            statusEl.textContent = 'Message sent successfully!';
            statusEl.classList.add('success');
            nameInput.value = '';
            emailInput.value = '';
            textInput.value = '';
        } catch {
            statusEl.textContent = 'Network error. Please try again.';
            statusEl.classList.add('error');
        }

        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    });
}
