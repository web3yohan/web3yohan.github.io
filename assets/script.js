// assets/script.js

// --- Featured Work data (edit these) ---
const FEATURED_WORK = [
  {
    kind: "POST",
    title: "Your thread / post title",
    desc: "One-line description. Keep it factual.",
    href: "https://x.com/yourhandle",
    thumb: "/assets/images/featured/fw-01.webp",
  },
  {
    kind: "ARTICLE",
    title: "Your article title",
    desc: "Short excerpt about what it covers.",
    href: "https://example.com",
    thumb: "/assets/images/featured/fw-02.webp",
  },
  {
    kind: "THREAD",
    title: "Your long thread title",
    desc: "Why it matters / what it achieved.",
    href: "https://x.com/yourhandle",
    thumb: "/assets/images/featured/fw-03.webp",
  },
  {
    kind: "ARTICLE",
    title: "Another piece",
    desc: "Short, skimmable.",
    href: "https://example.com",
    thumb: "/assets/images/featured/fw-04.webp",
  },
];

// --- Proof image sets for lightbox (edit these if needed) ---
const PROOFS = {
  cicada: [
    "/assets/images/pow/cicada/01.webp",
    "/assets/images/pow/cicada/02.webp",
    "/assets/images/pow/cicada/03.webp",
  ],
  mner: [
    "/assets/images/pow/mner/01.webp",
    "/assets/images/pow/mner/02.webp",
    "/assets/images/pow/mner/03.webp",
    "/assets/images/pow/mner/04.webp",
  ],
};

// ---------- NAV slider (page routing) ----------
const menu = document.querySelector(".menu");
const ink = document.querySelector(".nav-ink");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

function normalizePath(p){
  if (!p) return "/";
  // Ensure trailing slash for folder routes
  if (p !== "/" && !p.endsWith("/")) return p + "/";
  return p;
}

function activeLinkForPath(){
  const path = normalizePath(window.location.pathname);

  // Match exact known routes first
  const match = navLinks.find(a => normalizePath(new URL(a.href).pathname) === path);
  if (match) return match;

  // Fallback: if on /pow/... highlight /pow/
  const starts = navLinks.find(a => path.startsWith(normalizePath(new URL(a.href).pathname)));
  return starts || navLinks[0];
}

function positionInkTo(link){
  if (!ink || !menu || !link) return;

  const linkRect = link.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  const padL = parseFloat(getComputedStyle(link).paddingLeft) || 0;
  const padR = parseFloat(getComputedStyle(link).paddingRight) || 0;

  const x = (linkRect.left - menuRect.left) + padL;
  const w = Math.max(16, linkRect.width - padL - padR);

  ink.style.opacity = "1";
  ink.style.width = `${w}px`;
  ink.style.transform = `translateX(${x}px)`;
}

function setActiveLink(link){
  navLinks.forEach(a => a.classList.toggle("active", a === link));
  positionInkTo(link);
}

function initNav(){
  const active = activeLinkForPath();
  setActiveLink(active);

  // Hover behavior (Samad-ish feel)
  const finePointer = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (finePointer){
    navLinks.forEach(a => a.addEventListener("mouseenter", () => positionInkTo(a)));
    menu?.addEventListener("mouseleave", () => positionInkTo(activeLinkForPath()));
  }

  menu?.addEventListener("scroll", () => positionInkTo(activeLinkForPath()));
  window.addEventListener("resize", () => positionInkTo(activeLinkForPath()));
}

window.addEventListener("load", initNav);

// ---------- Featured Work render + reveal ----------
function renderFeatured(){
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  grid.innerHTML = FEATURED_WORK.map(item => `
    <a class="fw-card" href="${item.href}" target="_blank" rel="noreferrer">
      <div class="fw-thumb">
        <img src="${item.thumb}" alt="">
      </div>
      <div class="fw-body">
        <div class="fw-kind">${item.kind}</div>
        <div class="fw-title">${item.title}</div>
        <div class="fw-desc">${item.desc}</div>
      </div>
    </a>
  `).join("");

  // Reveal animation
  const cards = Array.from(grid.querySelectorAll(".fw-card"));
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced){
    cards.forEach(c => c.classList.add("in"));
    return;
  }

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => obs.observe(c));
}

window.addEventListener("load", renderFeatured);

// ---------- Lightbox (proof images) ----------
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCounter = document.getElementById("lbCounter");
const prevBtn = document.querySelector("[data-lb-prev]");
const nextBtn = document.querySelector("[data-lb-next]");

let currentSet = [];
let currentIndex = 0;

function openLightbox(setKey, index){
  currentSet = PROOFS[setKey] || [];
  currentIndex = Math.max(0, Math.min(index, currentSet.length - 1));
  if (!currentSet.length || !lightbox || !lbImg) return;

  document.body.classList.add("lb-open");
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  renderLightbox();
}

function closeLightbox(){
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lb-open");
}

function renderLightbox(){
  lbImg.src = currentSet[currentIndex];
  if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${currentSet.length}`;
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === currentSet.length - 1;
}
function prev(){ if (currentIndex > 0){ currentIndex--; renderLightbox(); } }
function next(){ if (currentIndex < currentSet.length - 1){ currentIndex++; renderLightbox(); } }

document.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-proof][data-index]");
  if (thumb){
    openLightbox(thumb.getAttribute("data-proof"), Number(thumb.getAttribute("data-index")));
    return;
  }
  const proofBtn = e.target.closest("[data-open-proof]");
  if (proofBtn){
    openLightbox(proofBtn.getAttribute("data-open-proof"), 0);
    return;
  }

  if (e.target.matches("[data-lb-close]") || e.target.closest("[data-lb-close]")) closeLightbox();
  if (e.target.closest("[data-lb-prev]")) prev();
  if (e.target.closest("[data-lb-next]")) next();
  if (e.target.classList.contains("lb-backdrop")) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});
