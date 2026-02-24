/* =====================================================
   PESCAMPO — SCRIPT
   ===================================================== */

'use strict';

/* ── Header: scroll shadow ───────────────────────── */
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

// Close on nav-link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on outside click
document.addEventListener('click', e => {
  if (navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)) {
    closeMenu();
  }
});

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}


/* ── Active nav link (IntersectionObserver) ──────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));


/* ── Scroll animations ───────────────────────────── */
const animateObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    // Stagger siblings inside same parent
    const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
    let delay = 0;
    siblings.forEach((el, idx) => {
      if (el === entry.target) delay = idx * 90;
    });
    setTimeout(() => {
      entry.target.classList.add('in-view');
    }, delay);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.10 });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));


/* ── Counter animation ───────────────────────────── */
function animateCounter(el, target, duration = 1600) {
  let startTime = null;
  const step = timestamp => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // ease-out-cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString('es-CO');
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString('es-CO') + '+';
    }
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = parseInt(entry.target.dataset.count, 10);
    if (!isNaN(target)) animateCounter(entry.target, target);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));


/* ── Calculator ──────────────────────────────────── */
const calcBtn    = document.getElementById('calcBtn');
const calcResult = document.getElementById('calcResult');
const calcPrice  = document.getElementById('calcPrice');
const calcSavings= document.getElementById('calcSavings');

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function shakeInvalid(el) {
  el.style.borderColor = 'var(--coral)';
  el.style.animation = 'shake 0.35s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  setTimeout(() => { el.style.borderColor = ''; }, 1800);
  el.focus();
}

calcBtn.addEventListener('click', () => {
  const productSelect = document.getElementById('calcProduct');
  const qtyInput      = document.getElementById('calcQty');
  const selectedOpt   = productSelect.options[productSelect.selectedIndex];
  const pricePerKg    = parseInt(selectedOpt.dataset.price || '0', 10);
  const qty           = parseFloat(qtyInput.value) || 0;

  if (!pricePerKg) { shakeInvalid(productSelect); return; }
  if (qty <= 0)    { shakeInvalid(qtyInput); return; }

  const total   = pricePerKg * qty;
  const saving  = total * 0.25;   // ~25% savings vs. intermediarios

  calcPrice.textContent   = COP.format(total);
  calcSavings.textContent = `Ahorro estimado vs. intermediario: ${COP.format(saving)}`;

  calcResult.classList.add('visible');
  setTimeout(() => {
    calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
});

// Add shake keyframe via JS (no extra CSS needed)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);


/* ── Contact form ────────────────────────────────── */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // Basic validation
  const name  = this.querySelector('#fname');
  const email = this.querySelector('#femail');
  let valid = true;

  if (!name.value.trim())   { shakeInvalid(name);  valid = false; }
  if (!email.value.trim() || !email.value.includes('@')) {
    shakeInvalid(email); valid = false;
  }
  if (!valid) return;

  const btn      = this.querySelector('[type="submit"]');
  const original = btn.textContent;
  btn.disabled   = true;
  btn.textContent = 'Enviando…';

  // ── Replace this setTimeout with your real API / form service ──
  setTimeout(() => {
    btn.textContent          = '✓ Mensaje enviado';
    btn.style.backgroundColor = 'var(--green)';
    btn.style.boxShadow      = '0 8px 24px rgba(34,197,94,0.35)';
    this.reset();

    setTimeout(() => {
      btn.textContent           = original;
      btn.style.backgroundColor = '';
      btn.style.boxShadow       = '';
      btn.disabled              = false;
    }, 4000);
  }, 1300);
});


/* ── Smooth anchor scroll (Safari fallback) ──────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
