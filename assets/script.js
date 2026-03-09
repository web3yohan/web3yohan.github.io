// assets/script.js

// --- Featured Work data (edit these) ---
const FEATURED_WORK = [
  {
    kind: " Long Post",
    title: "Does your location affects alpha timing on X?",
    desc: " my research confirms that the location you are based in plays a major role in the game of crypto projects and Web3 Alpha.",
    href:"https://x.com/web3yohan/status/2001614215849894340",
    thumb: "/assets/images/featured/fw-10.png",
  },
  {
    kind: "Article",
    title: "Cicada Finance rtUSQ: What “QuantFi” Looks Like When It’s Productized",
    desc: "An article about Cicada Finance's rtUSQ, Quant-Fi product that will change the shape of real yield.",
    href: "https://x.com/web3yohan/status/2012089055446737312",
    thumb: "/assets/images/featured/fw-01.png",
  },
  {
    kind: "Meme",
    title: "When Cicadians and Mner's meets irl ",
    desc: "We've been being best buds for eternity. Both server members, @CicadaFinance @mner_club,Truely an great opportunity to enjoy being a really yielder with some more friends who'll keep supporting you no matter what !! 🔥🤝.",
    href: "https://x.com/web3yohan/status/1954562990063157755",
    thumb: "/assets/images/featured/fw-08.png",
  },
    {
    kind: "Detailed Post",
    title: "Where does Mner Club's high APY come from?",
    desc: "Mner Club doesn’t hide behind token emissions or points seasons. It starts in a warehouse full of humming ASICs and ends as a balance that ticks up in your wallet. That gap from real machines to real yield is the entire story.",
    href: "https://x.com/web3yohan/status/1984155004006232314",
    thumb: "/assets/images/featured/fw-04.png",
  },
  {
    kind: "Thread",
    title: "Can you earn Bitcoin mining profits without even mining?",
    desc: "Mner Club introduces a third path:BTC mining as a composable DeFi primitive. It tokenizes mining income into liquid, yield-bearing assets that plug directly into the rest of DeFi.",
    href: "https://x.com/web3yohan/status/2005618665576894861",
    thumb: "/assets/images/featured/fw-02.png",
  },
  {
    kind: "Video Content",
    title: "How to get Union Role in Mner Club Discord (tutorial)",
    desc: " If you want to the union role in Mner Club discord, this video will show you how to do it in 2 minutes. Super easy and simple step by step guide.",
    href: "https://x.com/web3yohan/status/2000216097598152979",
    thumb: "/assets/images/featured/fw-03.png",
  },
  {
    kind: "Meme",
    title: "Black magic in community quiz (mner club)",
    desc: "While Baron starts quiz , everyone starts doing black magic in order to win the quiz lol That's when @Paceey_1 shows his Sharingan move, wining both quizzes in @mner_club & @CicadaFinance cause Bro is really built different.",
    href: "https://x.com/web3yohan/status/1967212934234603658",
    thumb: "/assets/images/featured/fw-07.png",
  },
  {
    kind: "Thread",
    title: "Where does Mner Club's high APY come from?",
    desc: "Mner Club doesn’t hide behind token emissions or points seasons. It starts in a warehouse full of humming ASICs and ends as a balance that ticks up in your wallet. That gap from real machines to real yield is the entire story.",
    href: "https://x.com/web3yohan/status/1984155004006232314",
    thumb: "/assets/images/featured/fw-04.png",
  },
  {
    kind: "Video Content",
    title: "Redstone Seoul | KBW",
    desc: "Team Redstone showed up everywhere that mattered with one clear message: oracles are the backbone of DeFi. In growth of redstone Korean community, this was freaking awesome, cause almost every redstone enthusiast came by to see redstone live in Seoul.",
    thumb: "/assets/images/featured/fw-05.png",
  },
  {
    kind: "Post Based Article",
    title: "Redstone Finance's monthly recap (septemberd,2025)",
    desc: "Redstone Finance had a busy September, with major product launches, community growth, and ecosystem partnerships. Here’s a recap of the month’s highlights.",
    href: "https://x.com/web3yohan/status/1969709459510645218",
    thumb: "/assets/images/featured/fw-06.png",
  }

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

// ---------- Scroll reveal (top->down) ----------
(function initScrollReveal(){
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const targets = document.querySelectorAll(".hero p, .hero h1, .cta, .section-head, .card, .fw-card, .thumb");
  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(0.18, (i % 6) * 0.03)}s`;
  });

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });

  targets.forEach(el => obs.observe(el));
})();

