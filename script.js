/* =====================================================
   PESCAMPO — SCRIPT
   ===================================================== */

'use strict';

/* ── Header scroll ───────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });


/* ── Mobile menu ─────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', e => {
  if (navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)) closeMenu();
});

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}


/* ── Active nav link ─────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
    if (active) active.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe
// use forEach instead
;

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
    if (active) active.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObserver.observe(s));


/* ── Scroll animations ───────────────────────────── */
const animObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // Stagger siblings
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('in-view'), idx * 100);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.10 });

document.querySelectorAll('[data-animate]').forEach(el => animObs.observe(el));


/* ── Counter animation ───────────────────────────── */
function animateCount(el, target, duration = 1600) {
  let t0 = null;
  const step = ts => {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('es-CO');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('es-CO') + '+';
  };
  requestAnimationFrame(step);
}

new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const n = parseInt(entry.target.dataset.count, 10);
    if (!isNaN(n)) animateCount(entry.target, n);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.5 }).observe
;
// correct usage:
const counterObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const n = parseInt(entry.target.dataset.count, 10);
    if (!isNaN(n)) animateCount(entry.target, n);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));


/* ── Calculator ──────────────────────────────────── */
const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP',
  minimumFractionDigits: 0, maximumFractionDigits: 0,
});

function shakeEl(el) {
  el.style.borderColor = 'var(--coral)';
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(4px)' },
    { transform: 'translateX(0)' },
  ], { duration: 350, easing: 'ease' });
  setTimeout(() => el.style.borderColor = '', 1500);
  el.focus();
}

document.getElementById('calcBtn').addEventListener('click', () => {
  const prodSel  = document.getElementById('calcProduct');
  const qtyInput = document.getElementById('calcQty');
  const price    = parseInt(prodSel.options[prodSel.selectedIndex]?.dataset.price || '0', 10);
  const qty      = parseFloat(qtyInput.value) || 0;

  if (!price) { shakeEl(prodSel); return; }
  if (qty <= 0) { shakeEl(qtyInput); return; }

  const total  = price * qty;
  const saving = total * 0.25;

  document.getElementById('calcPrice').textContent   = COP.format(total);
  document.getElementById('calcSavings').textContent = `Ahorro estimado vs. intermediario: ${COP.format(saving)}`;

  const res = document.getElementById('calcResult');
  res.classList.add('visible');
  setTimeout(() => res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
});


/* ── Contact form ────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name  = this.querySelector('#fname');
  const email = this.querySelector('#femail');

  if (!name.value.trim()) { shakeEl(name); return; }
  if (!email.value.includes('@')) { shakeEl(email); return; }

  const btn = this.querySelector('[type="submit"]');
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  // Reemplaza con tu API / Formspree / EmailJS
  setTimeout(() => {
    btn.textContent = '✓ Mensaje enviado';
    btn.style.background = 'var(--green)';
    this.reset();
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  }, 1300);
});


/* ── Smooth scroll fallback (Safari) ────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
