// assets/script.js

// ─── PROOFS (update paths/counts as you add images) ───
const PROOFS = {
  cicada:  ['/assets/images/pow/cicada/1.png',  '/assets/images/pow/cicada/2.png'],
  mner:    ['/assets/images/pow/mner/1.png',    '/assets/images/pow/mner/2.png'],
  gohome:  ['/assets/images/pow/gohome/1.png',  '/assets/images/pow/gohome/2.png'],
  uptopia: ['/assets/images/pow/uptopia/1.png', '/assets/images/pow/uptopia/2.png'],
};

// ─── LIGHTBOX ───
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lbImg');
const lbCount = document.getElementById('lbCounter');

let lbSet   = [];
let lbIndex = 0;

function lbOpen(key, idx) {
  lbSet   = PROOFS[key] || [];
  lbIndex = Math.max(0, Math.min(idx, lbSet.length - 1));
  if (!lbSet.length || !lb) return;
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbRender();
}
function lbClose() {
  if (!lb) return;
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function lbRender() {
  lbImg.src = lbSet[lbIndex];
  if (lbCount) lbCount.textContent = `${lbIndex + 1} / ${lbSet.length}`;
}

document.addEventListener('click', e => {
  // proof thumbnail buttons (Work page)
  const thumb = e.target.closest('[data-open-proof]');
  if (thumb) {
    lbOpen(thumb.dataset.openProof, Number(thumb.dataset.index || 0));
    return;
  }
  if (e.target.closest('[data-lb-prev]')) { if (lbIndex > 0) { lbIndex--; lbRender(); } return; }
  if (e.target.closest('[data-lb-next]')) { if (lbIndex < lbSet.length - 1) { lbIndex++; lbRender(); } return; }
  if (e.target.closest('[data-lb-close]') || e.target.classList.contains('lb-backdrop')) lbClose();
});

document.addEventListener('keydown', e => {
  if (!lb || lb.getAttribute('aria-hidden') === 'true') return;
  if (e.key === 'Escape')      lbClose();
  if (e.key === 'ArrowLeft'  && lbIndex > 0)                lbIndex--, lbRender();
  if (e.key === 'ArrowRight' && lbIndex < lbSet.length - 1) lbIndex++, lbRender();
});

// ─── SCROLL REVEAL ───
window.addEventListener('load', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const targets = document.querySelectorAll(
    '.section-tag, .section-heading, .about-body, .stat-row, ' +
    '.project-card, .work-block, .contact-card, .cta-heading, ' +
    '.page-title, .page-sub, .skills-inner'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(el => obs.observe(el));
});

// ─── NAV ACTIVE STATE ───
(function () {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    link.classList.toggle('active', href === path);
  });
})();
