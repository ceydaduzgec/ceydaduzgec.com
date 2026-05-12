'use strict';

/* Theme management */
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-colorblind');
  if (theme.startsWith('colorblind-')) {
    document.body.classList.add('theme-colorblind');
    if (theme.endsWith('-light')) document.body.classList.add('theme-light');
  } else {
    if (theme === 'light') document.body.classList.add('theme-light');
    else document.body.classList.add('theme-dark');
  }
  localStorage.setItem('theme', theme);
}

/* Custom theme picker */
const themePicker = document.getElementById('themePicker');
const tpBtn       = document.getElementById('tpBtn');
const tpLabel     = document.getElementById('tpLabel');
const tpMenu      = document.getElementById('tpMenu');

const THEME_LABELS = {
  'dark':              'Dark',
  'light':             'Light',
  'colorblind-dark':   'CB Dark',
  'colorblind-light':  'CB Light',
};

function updatePicker(theme) {
  tpLabel.textContent = THEME_LABELS[theme] || theme;
  tpMenu.querySelectorAll('.tp-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.value === theme)
  );
}

function initTheme() {
  const saved = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  applyTheme(saved);
  updatePicker(saved);
}

tpBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = themePicker.classList.toggle('open');
  tpBtn.setAttribute('aria-expanded', open);
});

document.addEventListener('click', () => {
  themePicker.classList.remove('open');
  tpBtn.setAttribute('aria-expanded', 'false');
});

tpMenu.querySelectorAll('.tp-opt').forEach(opt => {
  opt.addEventListener('click', e => {
    e.stopPropagation();
    const val = opt.dataset.value;
    applyTheme(val);
    updatePicker(val);
    themePicker.classList.remove('open');
    tpBtn.setAttribute('aria-expanded', 'false');
  });
});

initTheme();

const currentYear = new Date().getFullYear();
document.getElementById('yr').textContent = currentYear;

/* Career start 2020, auto-updates each year */
const yearsEl = document.getElementById('statYears');
if (yearsEl) yearsEl.textContent = (currentYear - 2020) + '+';

/* ── Custom Cursor ─────────────────────────────────────── */
const cur = document.getElementById('cur');

document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px';
  cur.style.top  = e.clientY + 'px';
  cur.classList.remove('hidden');
});
document.addEventListener('mouseleave', () => cur.classList.add('hidden'));

document.querySelectorAll('a, button, [data-mag], .job, .blog-card, .tp-opt').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('big'));
  el.addEventListener('mouseleave', () => cur.classList.remove('big'));
});


/* ── Navigation ────────────────────────────────────────── */
const nav     = document.getElementById('nav');
const navMenu = document.getElementById('navMenu');
const burger  = document.getElementById('burger');
const nlinks  = document.querySelectorAll('.nlink');
const secs    = document.querySelectorAll('section[id]');

let secOffsets = [];
function updateSecOffsets() {
  secOffsets = [...secs].map(s => s.offsetTop);
}
requestAnimationFrame(updateSecOffsets);
window.addEventListener('resize', updateSecOffsets, { passive: true });

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  let active = '';
  secOffsets.forEach((top, i) => { if (window.scrollY >= top - 120) active = secs[i].id; });
  nlinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${active}`));
}, { passive: true });

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));


/* ── Hero Text Reveal ──────────────────────────────────── */
const delays = [0, 130, 280, 400, 520];
document.querySelectorAll('.rt').forEach((el, i) => {
  setTimeout(() => el.classList.add('in'), delays[i] ?? i * 130);
});
document.querySelectorAll('.rt-sm').forEach((el, i) => {
  setTimeout(() => el.classList.add('in'), 320 + i * 100);
});


/* ── Scroll Reveal ─────────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const parent = entry.target.closest(
      '.job-list, .edu-list, .skills-grid, .talks, .pillars, .certs-grid'
    );
    const children = parent
      ? [...parent.querySelectorAll(':scope > .job, :scope > .edu-item, :scope > .sk-cell, :scope > .talk, :scope > .pillar, :scope > .cert-card')]
      : [];
    const idx   = children.indexOf(entry.target);
    const delay = idx >= 0 ? idx * 60 : 0;
    setTimeout(() => entry.target.classList.add('in'), delay);
    io.unobserve(entry.target);
  });
}, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal-up, .job, .edu-item, .sk-cell').forEach(el => io.observe(el));


/* ── Scroll indicator ──────────────────────────────────── */
const heroScroll = document.getElementById('heroScroll');
if (heroScroll) {
  window.addEventListener('scroll', () => {
    heroScroll.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
}


/* ── Shared helpers ────────────────────────────────────── */
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attachCursorHover(els) {
  els.forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
}


/* ── Certifications ────────────────────────────────────────
   Tries local assets/data/certs.json first (generated by
   fetch_certs.py). Falls back to Credly proxy if not found.
   ─────────────────────────────────────────────────────── */
async function loadCerts() {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;

  let certs = await loadCertsFromJson();
  if (!certs) certs = await loadCertsFromCredy();

  if (!certs || !certs.length) {
    grid.innerHTML = '<div class="blog-empty">No certifications found. <a href="https://www.credly.com/users/ceyda-duzgec.02/badges" target="_blank" rel="noopener" style="color:var(--lime)">View on Credly ↗</a></div>';
    return;
  }

  grid.innerHTML = certs.map(c => buildCertCard(c)).join('');
  grid.querySelectorAll('.cert-card').forEach(el => {
    el.classList.add('reveal-up');
    io.observe(el);
  });
  attachCursorHover(grid.querySelectorAll('.cert-card'));

  const statEl = document.getElementById('statCerts');
  if (statEl) statEl.textContent = certs.length;
}

async function loadCertsFromJson() {
  try {
    const res = await fetch('./assets/data/certs.json');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function loadCertsFromCredy() {
  try {
    const credlyUrl = 'https://www.credly.com/users/ceyda-duzgec.02/badges.json';
    const proxyUrl  = `https://api.allorigins.win/raw?url=${encodeURIComponent(credlyUrl)}`;
    const res  = await fetch(proxyUrl);
    const data = await res.json();
    const badges = (data.data || []).filter(b => b.public && b.state === 'accepted');
    return badges.map(b => ({
      name:      b.badge_template?.name || '',
      issuer:    b.issuer?.entities?.[0]?.entity?.name || '',
      image_url: b.image_url || b.badge_template?.image_url || '',
      badge_url: b.badge_template?.url || 'https://www.credly.com/users/ceyda-duzgec.02/badges',
      issued_at: b.issued_at_date || '',
    }));
  } catch {
    return null;
  }
}

function buildCertCard(cert) {
  const date = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '';
  const imgHtml = cert.image_url
    ? `<img src="${escHtml(cert.image_url)}" alt="${escHtml(cert.name)}" loading="lazy">`
    : '';
  return `
    <a class="cert-card" href="${escHtml(cert.badge_url)}" target="_blank" rel="noopener">
      <div class="cert-icon-wrap">${imgHtml}</div>
      <div class="cert-body">
        <span class="cert-issuer">${escHtml(cert.issuer)}</span>
        <h3 class="cert-title">${escHtml(cert.name)}</h3>
        <span class="cert-date">${escHtml(date)}</span>
      </div>
    </a>`;
}

loadCerts();


/* ── Talks - GitHub Presentations README ───────────────────
   Parses ceydaduzgec/presentations README.md to build
   the talks list automatically.
   ─────────────────────────────────────────────────────── */
async function loadTalks() {
  const container = document.getElementById('talksContainer');
  if (!container) return;

  try {
    const res = await fetch('https://raw.githubusercontent.com/ceydaduzgec/presentations/main/README.md');
    const md  = await res.text();
    const talks = parseTalks(md);

    if (!talks.length) {
      container.innerHTML = '<div class="talks-empty">No talks found.</div>';
      return;
    }

    container.innerHTML = talks
      .map((t, i) => buildTalkCard(t, talks.length - i))
      .join('');

    container.querySelectorAll('.talk').forEach(el => {
      io.observe(el);
    });
    attachCursorHover(container.querySelectorAll('.talk'));

    const el = document.getElementById('statTalks');
    if (el) el.textContent = talks.length;

  } catch {
    container.innerHTML = '<div class="talks-empty">Could not load talks.</div>';
  }
}

function parseTalks(md) {
  const talks  = [];
  const lines  = md.split('\n');
  let year     = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const yearM = line.match(/^##\s+(\d{4})$/);
    if (yearM) { year = yearM[1]; continue; }
    if (!year) continue;

    /* - ### DD MonthName: Event Name */
    const evM = line.match(/^-\s+###\s+\d{2}\s+(\w+):\s+(.+)/);
    if (!evM) continue;

    const [, monthName, event] = evM;
    const dateStr = `${monthName.slice(0, 3)} ${year}`;

    /* **Talk:** *Title* */
    const titleLine = (lines[i + 1] || '').trim();
    const titleM    = titleLine.match(/^\*\*Talk:\*\*\s+\*(.+)\*$/);
    const title     = titleM ? titleM[1] : '';
    if (titleM) i++;

    /* **Resources:** [Label](url) | ... (may be separated by a blank line) */
    let nextIdx = i + 1;
    while (nextIdx < lines.length && lines[nextIdx].trim() === '') nextIdx++;
    const resLine = (lines[nextIdx] || '').trim();
    const links   = [];
    if (resLine.startsWith('**Resources:**')) {
      const re = /\[([^\]]+)\]\(([^)]+)\)/g;
      let m;
      while ((m = re.exec(resLine)) !== null) {
        if (m[1] !== 'Code') links.push({ label: m[1], url: m[2] });
      }
      i = nextIdx;
    }

    const sep   = event.lastIndexOf(' - ');
    const name  = sep !== -1 ? event.slice(0, sep) : event;
    const city  = sep !== -1 ? event.slice(sep + 3) : '';
    talks.push({ name, city, title, dateStr, links });
  }

  return talks;
}

function buildTalkCard(talk, num) {
  const n = String(num).padStart(2, '0');
  const linksHtml = talk.links.length
    ? `<div class="talk-links">${talk.links
        .map(l => `<a href="${escHtml(l.url)}" target="_blank" rel="noopener" class="tl-btn">${escHtml(l.label)} ↗</a>`)
        .join('')}</div>`
    : '';

  return `
    <div class="talk reveal-up">
      <span class="talk-n">${n}</span>
      <div class="talk-body">
        <div class="talk-top">
          <span class="talk-ev">${escHtml(talk.name)}</span>
          <span class="talk-meta">
            ${talk.city ? `<span class="talk-city">${escHtml(talk.city)}</span>` : ''}
            <span class="talk-yr">${escHtml(talk.dateStr)}</span>
          </span>
        </div>
        <h3>${escHtml(talk.title)}</h3>
        ${linksHtml}
      </div>
    </div>`;
}

loadTalks();


/* ── Medium Blog Feed ──────────────────────────────────────
   Uses rss2json.com as a CORS proxy for the Medium RSS feed.
   ─────────────────────────────────────────────────────── */
const MEDIUM_USERNAME = 'ceydaduzgec';

async function loadBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const rssFeed = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
  const apiUrl  = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeed)}&count=6`;

  try {
    const res  = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      grid.innerHTML = `<div class="blog-empty">No posts yet. Check back soon.</div>`;
      return;
    }

    grid.innerHTML = data.items.map(post => buildBlogCard(post)).join('');

    attachCursorHover(grid.querySelectorAll('.blog-card'));

    const cards  = grid.querySelectorAll('.blog-card');
    const cardIO = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('in'), idx * 80);
        cardIO.unobserve(e.target);
      });
    }, { threshold: 0.05 });
    cards.forEach(c => {
      c.classList.add('reveal-up');
      cardIO.observe(c);
    });

  } catch {
    grid.innerHTML = `<div class="blog-empty">Could not load posts right now.</div>`;
  }
}

function buildBlogCard(post) {
  const date     = new Date(post.pubDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  const cats     = (post.categories || []).slice(0, 2);
  const excerpt  = stripHtml(post.description).slice(0, 120).trim() + '…';
  const thumb    = post.thumbnail;
  const tagsHtml = cats.map(c => `<span class="bc-tag">${escHtml(c)}</span>`).join('');
  const thumbHtml = thumb
    ? `<img class="bc-thumb" src="${escHtml(thumb)}" alt="${escHtml(post.title)}" loading="lazy">`
    : `<div class="bc-thumb-placeholder">✍️</div>`;

  return `
    <a class="blog-card" href="${escHtml(post.link)}" target="_blank" rel="noopener">
      ${thumbHtml}
      <div class="bc-body">
        ${cats.length ? `<div class="bc-tags">${tagsHtml}</div>` : ''}
        <h3 class="bc-title">${escHtml(post.title)}</h3>
        <p class="bc-excerpt">${escHtml(excerpt)}</p>
        <span class="bc-meta">${date}</span>
      </div>
    </a>`;
}

loadBlog();


/* ── Contact Form - mailto ─────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name    = this.querySelector('[name="name"]').value.trim();
    const email   = this.querySelector('[name="email"]').value.trim();
    const message = this.querySelector('[name="message"]').value.trim();
    const subject = encodeURIComponent('Message from ' + name);
    const body    = encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message);
    window.location.href = 'mailto:cduzgec@gmail.com?subject=' + subject + '&body=' + body;
  });
}
