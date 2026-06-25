const POPUP_KEY = "tedition_scroll_popup_closed";
const PRELOADER_KEY = "tedition_preloader_seen";

const body = document.body;
const header = document.querySelector("#header");
const preloader = document.querySelector("#preloader");
const menuButton = document.querySelector("#menuButton");
const navOverlay = document.querySelector("#navOverlay");
const navClose = document.querySelector("#navClose");
const popup = document.querySelector("#introPopup");
const form = document.querySelector("#leadForm");
const requestType = document.querySelector("#requestType");
const formStatus = document.querySelector("#formStatus");
const dots = Array.from(document.querySelectorAll(".dot"));
const sections = Array.from(document.querySelectorAll(".tracked-section"));

function hidePreloader() {
  if (!preloader) return;
  preloader.classList.add("hidden");
  sessionStorage.setItem(PRELOADER_KEY, "1");
  setTimeout(() => preloader.remove(), 700);
}

function setupPreloader() {
  if (!preloader) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sessionStorage.getItem(PRELOADER_KEY) === "1" || reducedMotion) {
    hidePreloader();
    return;
  }
  setTimeout(hidePreloader, 1700);
  setTimeout(hidePreloader, 2400);
}

function setupVideos() {
  document.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    const reveal = () => video.classList.add("is-ready");
    video.addEventListener("loadeddata", reveal, { once: true });
    video.addEventListener("canplay", reveal, { once: true });
    video.play?.().catch(() => {});
  });
}

function setHeaderState() {
  const scrolled = window.scrollY > 80;
  header?.classList.toggle("scrolled", scrolled);
}

function openMenu() {
  navOverlay?.classList.add("open");
  menuButton?.classList.add("menu-open");
  menuButton?.setAttribute("aria-expanded", "true");
  body.classList.add("menu-open");
}

function closeMenu() {
  navOverlay?.classList.remove("open");
  menuButton?.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
}

function openPopup() {
  if (!popup || sessionStorage.getItem(POPUP_KEY) === "1") return;
  popup.classList.add("visible");
  body.classList.add("popup-open");
}

function closePopup() {
  if (!popup) return;
  popup.classList.remove("visible");
  body.classList.remove("popup-open");
  sessionStorage.setItem(POPUP_KEY, "1");
}

function maybeOpenScrollPopup() {
  if (sessionStorage.getItem(POPUP_KEY) === "1") return;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = window.scrollY / maxScroll;
  if (progress >= 0.15) openPopup();
}

function scrollToForm(type = "Jiný dotaz") {
  if (requestType) requestType.value = type;
  closePopup();
  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => form?.querySelector("input[name='name']")?.focus(), 650);
}

function updateDots() {
  if (!sections.length || !dots.length) return;
  let activeIndex = 0;
  const marker = window.scrollY + window.innerHeight * 0.45;
  sections.forEach((section, index) => {
    if (section.offsetTop <= marker) activeIndex = index;
  });
  dots.forEach((dot, index) => dot.classList.toggle("active", index === activeIndex));
}

function setupReveal() {
  const items = document.querySelectorAll(".fade-up");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  items.forEach((item) => observer.observe(item));
}

menuButton?.addEventListener("click", () => {
  if (navOverlay?.classList.contains("open")) closeMenu();
  else openMenu();
});

navClose?.addEventListener("click", closeMenu);
navOverlay?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const section = sections[Number(dot.dataset.dot)];
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-scroll-form]").forEach((button) => {
  button.addEventListener("click", () => scrollToForm(button.dataset.requestType || "Jiný dotaz"));
});

document.querySelector("[data-popup-contact]")?.addEventListener("click", () => scrollToForm("Jiný dotaz"));
document.querySelector("[data-popup-continue]")?.addEventListener("click", closePopup);
document.querySelector(".popup-close")?.addEventListener("click", closePopup);

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (formStatus) {
    formStatus.textContent = "Děkujeme. Toto je lokální demo - reálné odesílání připojíme po potvrzení e-mailu klienta.";
  }
  form.reset();
});

window.addEventListener("scroll", () => {
  setHeaderState();
  updateDots();
  maybeOpenScrollPopup();
}, { passive: true });

setupPreloader();
setupVideos();
setupReveal();
setHeaderState();
updateDots();
