'use strict';

/* ============================================================
   NAV — scroll effect + active link + mobile toggle
   ============================================================ */
const nav         = document.getElementById('nav');
const navLinks    = document.querySelectorAll('.nav-link');
const navLinksEl  = document.getElementById('navLinks');
const navToggle   = document.getElementById('navToggle');
const sections    = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});
navLinks.forEach(l => l.addEventListener('click', () => navLinksEl.classList.remove('open')));


/* ============================================================
   TYPING ANIMATION
   ============================================================ */
const titles = [
  'Cloud & Platform Engineer',
  'AWS Solutions Architect',
  'Terraform Practitioner',
  'DevOps Enthusiast',
  'Python Developer',
];

let titleIdx = 0;
let charIdx  = 0;
let deleting = false;
const typingEl = document.getElementById('typingText');

function tick() {
  const word = titles[titleIdx];

  if (deleting) {
    typingEl.textContent = word.slice(0, --charIdx);
  } else {
    typingEl.textContent = word.slice(0, ++charIdx);
  }

  if (!deleting && charIdx === word.length) {
    setTimeout(() => { deleting = true; tick(); }, 2200);
    return;
  }
  if (deleting && charIdx === 0) {
    deleting  = false;
    titleIdx  = (titleIdx + 1) % titles.length;
  }

  setTimeout(tick, deleting ? 45 : 80);
}

setTimeout(tick, 1600);


/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
   ============================================================ */
const animateTargets = document.querySelectorAll(
  '.timeline-item, .edu-card, .skill-cat, .cert-card, .talk-card'
);

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      /* Stagger siblings within the same parent */
      const siblings = [...entry.target.parentElement.children].filter(
        el => el.hasAttribute('data-animate') || animateTargets.item
      );
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animateTargets.forEach(el => observer.observe(el));


/* ============================================================
   PARTICLE CANVAS
   ============================================================ */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let pts      = [];

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Pt {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.4 + 0.4;
    this.a  = Math.random() * 0.45 + 0.08;
  }
  step() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,212,255,${this.a})`;
    ctx.fill();
  }
}

function initPts() {
  pts = [];
  const n = Math.min(90, Math.floor((canvas.width * canvas.height) / 9500));
  for (let i = 0; i < n; i++) pts.push(new Pt());
}

function drawLines() {
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < 115) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - d / 115)})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }
}

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLines();
  pts.forEach(p => { p.step(); p.draw(); });
  requestAnimationFrame(frame);
}

resize();
initPts();
frame();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resize(); initPts(); }, 150);
}, { passive: true });
