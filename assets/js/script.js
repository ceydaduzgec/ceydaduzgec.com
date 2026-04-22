'use strict';

document.getElementById('yr').textContent = new Date().getFullYear();

/* ── Custom Cursor ─────────────────────────────────────── */
const cur = document.getElementById('cur');
let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
  cur.classList.remove('hidden');
});
document.addEventListener('mouseleave', () => cur.classList.add('hidden'));

/* Grow cursor on interactive elements */
document.querySelectorAll('a, button, [data-mag], .job, .talk').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('big'));
  el.addEventListener('mouseleave', () => cur.classList.remove('big'));
});


/* ── Navigation ────────────────────────────────────────── */
const nav      = document.getElementById('nav');
const navMenu  = document.getElementById('navMenu');
const burger   = document.getElementById('burger');
const nlinks   = document.querySelectorAll('.nlink');
const secs     = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);

  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  nlinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`));
}, { passive: true });

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMenu.classList.remove('open');
  burger.classList.remove('open');
}));


/* ── Hero Text Reveal ──────────────────────────────────── */
/* Stagger the big name lines */
function triggerHeroReveal() {
  const delay = [0, 120, 260, 380, 500];
  document.querySelectorAll('.rt').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), delay[i] ?? i * 120);
  });
  document.querySelectorAll('.rt-sm').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 300 + i * 100);
  });
}
window.addEventListener('load', triggerHeroReveal);


/* ── Scroll Reveal ─────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up, .job, .edu-card, .sk-cell, .talk');

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const parent   = entry.target.closest('.job-list, .edu-row, .skills-grid, .talks, .pillars');
    const siblings = parent
      ? [...parent.querySelectorAll(':scope > .job, :scope > .edu-card, :scope > .sk-cell, :scope > .talk')]
      : [];
    const idx = siblings.indexOf(entry.target);
    const delay = idx >= 0 ? idx * 60 : 0;

    setTimeout(() => {
      entry.target.classList.add('in');
      entry.target.style.transitionDelay = '0s'; /* reset after stagger */
    }, delay);

    io.unobserve(entry.target);
  });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => io.observe(el));


/* ── Scroll indicator fade ─────────────────────────────── */
const heroScroll = document.getElementById('heroScroll');
if (heroScroll) {
  window.addEventListener('scroll', () => {
    heroScroll.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
}
