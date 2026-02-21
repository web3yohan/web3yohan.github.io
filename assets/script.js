// 1) Year
document.getElementById("year").textContent = new Date().getFullYear();

// 2) Set your Notion URL once (replace later)
const NOTION_URL = "https://example.notion.site/your-pow";
[
  "notionLinkTop",
  "notionLinkExp1",
  "notionLinkExp2",
  "notionLinkPow1",
  "notionLinkBottom",
  "notionLinkContact",
  "modalNotion"
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.href = NOTION_URL;
});

// 3) Active nav highlight + “ink underline”
const links = Array.from(document.querySelectorAll(".nav-link"));
const ink = document.querySelector(".nav-ink");
const sections = links
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function positionInk(activeLink){
  if (!activeLink || !ink) return;
  const r = activeLink.getBoundingClientRect();
  const parentR = activeLink.parentElement.getBoundingClientRect();
  ink.style.opacity = "1";
  ink.style.width = `${Math.max(28, r.width - 8)}px`;
  ink.style.transform = `translateX(${(r.left - parentR.left) + 4}px)`;
}

const obs = new IntersectionObserver((entries)=>{
  // pick the most visible section
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  const id = `#${visible.target.id}`;
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
  const active = links.find(a => a.classList.contains("active"));
  positionInk(active);
}, { threshold: [0.2, 0.35, 0.5] });

sections.forEach(s => obs.observe(s));

// position ink on load
window.addEventListener("load", () => {
  const active = links.find(a => a.classList.contains("active")) || links[0];
  positionInk(active);
});
window.addEventListener("resize", () => {
  const active = links.find(a => a.classList.contains("active"));
  positionInk(active);
});

// 4) Modal gallery (placeholder now)
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const gallery = document.getElementById("gallery");

function openModal(key){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modalTitle.textContent = key === "cicada" ? "Cicada — Proof" : "Proof";

  // Placeholder gallery for now. Later we’ll render real images from an array.
  gallery.innerHTML = `
    <div class="shot placeholder">Screenshot 1</div>
    <div class="shot placeholder">Screenshot 2</div>
    <div class="shot placeholder">Screenshot 3</div>
    <div class="shot placeholder">Screenshot 4</div>
  `;
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) openModal(openBtn.getAttribute("data-open"));

  if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});
