/* =====================================================
   PESCAMPO — SCRIPT
   ===================================================== */
'use strict';

/* ══════════════════════════════════════════════════════
   PRECIOS — Edita solo aquí para actualizar toda la web
   ══════════════════════════════════════════════════════ */
const PRECIOS = {
  bocachico: { nombre: 'Bocachico', precio: 12000, unidad: 'lb' },
  dorada:    { nombre: 'Dorada',    precio: 9000,  unidad: 'lb' },
  cachama:   { nombre: 'Cachama',   precio: 8000,  unidad: 'lb' },
};

const FMT = new Intl.NumberFormat('es-CO');

/* Aplica precios a las tarjetas de producto y al dropdown */
function aplicarPrecios() {
  // Tarjetas de producto: busca [data-producto="bocachico"] etc.
  Object.entries(PRECIOS).forEach(([key, data]) => {
    const card = document.querySelector(`[data-producto="${key}"] .product-card__price`);
    if (card) card.textContent = `$ ${FMT.format(data.precio)} /${data.unidad}`;
  });

  // Dropdown del simulador
  const menu = document.getElementById('calcDropdownMenu');
  if (menu) {
    menu.innerHTML = '';
    Object.entries(PRECIOS).forEach(([key, data]) => {
      const li = document.createElement('li');
      li.dataset.value = data.precio;
      li.textContent = data.nombre;
      menu.appendChild(li);
    });
  }
}
aplicarPrecios();

/* ── Header scroll ───────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── Mobile menu ─────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
document.addEventListener('click', e => {
  if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
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
const secObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
    if (a) a.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => secObs.observe(s));

/* ── Scroll animations ───────────────────────────── */
const animObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('in-view'), idx * 100);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.10 });
document.querySelectorAll('[data-animate]').forEach(el => animObs.observe(el));

/* ── Counter animation ───────────────────────────── */
function animCount(el, target, dur = 1500) {
  let t0 = null;
  const step = ts => {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target).toLocaleString('es-CO');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('es-CO') + '+';
  };
  requestAnimationFrame(step);
}
const cntObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const n = parseInt(entry.target.dataset.count, 10);
    if (!isNaN(n)) animCount(entry.target, n);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

/* ── Custom Dropdown ──────────────────────────────── */
const dropdown     = document.getElementById('calcDropdown');
const dropdownBtn  = document.getElementById('calcDropdownBtn');
const dropdownMenu = document.getElementById('calcDropdownMenu');
const dropdownLabel = document.getElementById('calcDropdownLabel');
const hiddenInput  = document.getElementById('calcEspecie');

function openDropdown() {
  dropdown.classList.add('open');
  const rect = dropdownBtn.getBoundingClientRect();
  dropdownMenu.style.left = rect.left + 'px';
  dropdownMenu.style.top = (rect.bottom + 6) + 'px';
  dropdownMenu.style.width = rect.width + 'px';
}
function closeDropdown() {
  dropdown.classList.remove('open');
}

dropdownBtn.addEventListener('click', e => {
  e.stopPropagation();
  dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
});

dropdownMenu.addEventListener('click', e => {
  e.stopPropagation();
  const li = e.target.closest('li');
  if (!li) return;
  dropdownMenu.querySelectorAll('li').forEach(i => i.classList.remove('selected'));
  li.classList.add('selected');
  hiddenInput.value = li.dataset.value;
  dropdownLabel.textContent = li.textContent;
  dropdownBtn.classList.add('has-value');
  closeDropdown();
});

document.addEventListener('click', closeDropdown);
window.addEventListener('scroll', closeDropdown, { passive: true });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDropdown(); });

/* ── Hero Calculator ─────────────────────────────── */
document.getElementById('calcBtn').addEventListener('click', () => {
  const price = parseInt(hiddenInput.value || '0', 10);
  const kg    = document.getElementById('calcKg');
  const out   = document.getElementById('calcPrecio');
  const qty   = parseFloat(kg.value) || 0;

  if (!price) { dropdownBtn.click(); return; }
  if (qty <= 0) { kg.focus(); return; }

  out.textContent = '$ ' + FMT.format(price * qty);
});

/* ── Contact form ────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name  = this.querySelector('#fname');
  const email = this.querySelector('#femail');

  if (!name.value.trim()) { name.focus(); return; }
  if (!email.value.includes('@')) { email.focus(); return; }

  const btn = this.querySelector('[type="submit"]');
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  // Reemplaza con tu API real
  setTimeout(() => {
    btn.textContent = '✓ Enviado';
    btn.style.background = '#22C55E';
    this.reset();
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 3500);
  }, 1200);
});

/* ── Smooth scroll ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
