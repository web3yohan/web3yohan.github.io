// assets/script.js

// --------------------
// CONFIG (replace these)
// --------------------
const NOTION_URL = "https://example.notion.site/your-pow";
const STORY_URL  = NOTION_URL; // replace later if you make a separate story page

// Project details live here (we’ll reuse this for the gallery-style POW later)
const PROJECTS = {
  cicada: {
    title: "Cicada Finance",
    role: "Ambassador • Community + content",
    notion: NOTION_URL,
    twitter: "https://x.com/yourhandle",
    docs: "",
    images: [
      // "/assets/images/pow/cicada/role-01.webp",
      // "/assets/images/pow/cicada/role-02.webp",
    ]
  },
  proj2: {
    title: "Project #2",
    role: "Community / Social",
    notion: NOTION_URL,
    twitter: "",
    docs: "",
    images: []
  }
};

// --------------------
// 1) Footer year + links
// --------------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

[
  "notionLinkTop","notionLinkExp1","notionLinkExp2","notionLinkPow1","notionLinkBottom",
  "notionLinkContact","modalNotion"
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.href = NOTION_URL;
});

const storyLink = document.getElementById("storyLink");
if (storyLink) storyLink.href = STORY_URL;

// --------------------
// 2) NAV active + sliding underline bar
// --------------------
const nav = document.querySelector(".nav");
const menu = document.querySelector(".menu");
const ink  = document.querySelector(".nav-ink");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

function getNavH(){ return nav ? nav.getBoundingClientRect().height : 76; }

function setActive(hash){
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
  positionInk();
}

function positionInk(){
  if (!ink || !menu) return;
  const active = navLinks.find(a => a.classList.contains("active")) || navLinks[0];
  if (!active) return;

  const r = active.getBoundingClientRect();
  const pr = menu.getBoundingClientRect();
  ink.style.opacity = "1";
  ink.style.width = `${Math.max(26, r.width - 18)}px`;
  ink.style.transform = `translateX(${(r.left - pr.left) + 9}px)`;
}

// stable active based on scroll position (updates without clicking)
let last = "";
function updateActiveFromScroll(){
  const offset = getNavH() + 18;
  let current = navLinks[0]?.getAttribute("href") || "#about";

  for (const a of navLinks){
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= offset) current = id;
  }

  if (current !== last){
    last = current;
    setActive(current);
  }
}

navLinks.forEach(a => a.addEventListener("click", () => {
  last = a.getAttribute("href");
  setActive(last);
}));

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateActiveFromScroll();
    ticking = false;
  });
});

window.addEventListener("resize", () => positionInk());
window.addEventListener("load", () => {
  last = location.hash || "#about";
  setActive(last);
  updateActiveFromScroll();
  positionInk();
});

// ---- MODAL: grid thumbnails -> full viewer ----
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalNotion = document.getElementById("modalNotion");

const thumbGrid = document.getElementById("thumbGrid");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const viewerCounter = document.getElementById("viewerCounter");

let currentImages = [];
let currentIndex = 0;

function openModal(key){
  const p = PROJECTS[key];
  if (!p || !modal || !modalTitle || !thumbGrid) return;

  currentImages = Array.isArray(p.images) ? p.images : [];
  currentIndex = 0;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  modalTitle.textContent = `${p.title} — Proof`;
  if (modalNotion) modalNotion.href = p.notion || NOTION_URL;

  // Build thumb grid
  if (!currentImages.length){
    thumbGrid.innerHTML = `<div class="shot placeholder">No screenshots yet for ${key}. Add files under /assets/images/pow/${key}/</div>`;
  } else {
    thumbGrid.innerHTML = currentImages.map((src, i) => `
      <div class="thumb" data-thumb="${i}">
        <img src="${src}" alt="">
      </div>
    `).join("");
  }

  // ensure viewer is closed
  if (viewer) viewer.hidden = true;
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
  if (viewer) viewer.hidden = true;
}

function openViewer(index){
  if (!viewer || !viewerImg || !currentImages.length) return;
  currentIndex = index;
  viewerImg.src = currentImages[currentIndex];
  viewer.hidden = false;
  updateCounter();
  updateNavDisabled();
}

function closeViewer(){
  if (!viewer) return;
  viewer.hidden = true;
}

function updateCounter(){
  if (!viewerCounter) return;
  viewerCounter.textContent = currentImages.length ? `${currentIndex+1} / ${currentImages.length}` : "0 / 0";
}

function updateNavDisabled(){
  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === currentImages.length - 1;
}

function prevImage(){
  if (currentIndex > 0){
    currentIndex--;
    viewerImg.src = currentImages[currentIndex];
    updateCounter();
    updateNavDisabled();
  }
}
function nextImage(){
  if (currentIndex < currentImages.length - 1){
    currentIndex++;
    viewerImg.src = currentImages[currentIndex];
    updateCounter();
    updateNavDisabled();
  }
}

document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) openModal(openBtn.getAttribute("data-open"));

  if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) closeModal();

  const thumb = e.target.closest("[data-thumb]");
  if (thumb){
    const idx = Number(thumb.getAttribute("data-thumb"));
    openViewer(idx);
  }

  if (e.target.closest("[data-viewer-close]")) closeViewer();
  if (e.target.closest("[data-prev]")) prevImage();
  if (e.target.closest("[data-next]")) nextImage();

  // click outside image area closes viewer
  if (viewer && !viewer.hidden && e.target === viewer) closeViewer();
});

document.addEventListener("keydown", (e) => {
  if (!modal?.classList.contains("show")) return;

  if (e.key === "Escape"){
    // if viewer open -> close viewer, else close modal
    if (viewer && !viewer.hidden) closeViewer();
    else closeModal();
  }
  if (viewer && !viewer.hidden){
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  }
});

// event delegation
document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) openModal(openBtn.getAttribute("data-open"));

  if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) closeModal();

  if (e.target.closest("[data-prev]")) {
    if (currentIndex > 0) { currentIndex--; renderViewer(); }
  }
  if (e.target.closest("[data-next]")) {
    if (currentIndex < currentImages.length - 1) { currentIndex++; renderViewer(); }
  }
});

document.addEventListener("keydown", (e) => {
  if (!modal?.classList.contains("show")) return;

  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft" && currentIndex > 0) { currentIndex--; renderViewer(); }
  if (e.key === "ArrowRight" && currentIndex < currentImages.length - 1) { currentIndex++; renderViewer(); }
});

// --------------------
// 4) Reveal on first scroll-in
// --------------------
const revealEls = document.querySelectorAll(".card, .pow-card, .mini-card, .section-head, .endcap");
revealEls.forEach(el => el.classList.add("reveal"));

const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if (ent.isIntersecting){
        ent.target.classList.add("in");
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => obs.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("in"));
}
