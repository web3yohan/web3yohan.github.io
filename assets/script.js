// Active nav highlight (reliable on click + scroll)
const links = Array.from(document.querySelectorAll(".nav-link"));
const sections = links
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function setActive(hash) {
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
}

links.forEach(a => {
  a.addEventListener("click", () => {
    setActive(a.getAttribute("href"));
  });
});

// Observer that accounts for sticky nav
const nav = document.querySelector(".nav");
const navH = nav ? nav.getBoundingClientRect().height : 76;

const obs = new IntersectionObserver((entries)=>{
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  setActive(`#${visible.target.id}`);
}, {
  threshold: [0.15, 0.25, 0.4],
  rootMargin: `-${Math.ceil(navH)}px 0px -60% 0px`
});

sections.forEach(s => obs.observe(s));

// Set initial active
window.addEventListener("load", () => setActive("#about"));
