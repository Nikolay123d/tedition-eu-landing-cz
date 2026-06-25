const FACEBOOK_URL = "https://www.facebook.com/share/19PVxfJMw2/";
const POPUP_KEY = "tedition_intro_popup_closed";
const PRELOADER_KEY = "tedition_preloader_seen";

const body = document.body;
const preloader = document.querySelector("#preloader");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const popup = document.querySelector("#introPopup");
const form = document.querySelector("#leadForm");
const requestType = document.querySelector("#requestType");
const formStatus = document.querySelector("#formStatus");

function hidePreloader() {
  if (!preloader) return;
  preloader.classList.add("is-hidden");
  sessionStorage.setItem(PRELOADER_KEY, "1");
  setTimeout(() => preloader.remove(), 650);
}

function setupPreloader() {
  if (!preloader) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sessionStorage.getItem(PRELOADER_KEY) === "1" || reducedMotion) {
    hidePreloader();
    return;
  }
  setTimeout(hidePreloader, 1550);
  setTimeout(hidePreloader, 2200);
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

  const lazyVideo = document.querySelector(".lazy-video");
  if (!lazyVideo) return;
  const startLazyVideo = () => {
    if (!lazyVideo.dataset.src) return;
    const source = document.createElement("source");
    source.src = lazyVideo.dataset.src;
    source.type = "video/mp4";
    lazyVideo.appendChild(source);
    lazyVideo.removeAttribute("data-src");
    lazyVideo.load();
    lazyVideo.play?.().catch(() => {});
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        startLazyVideo();
        observer.disconnect();
      }
    }, { rootMargin: "260px" });
    observer.observe(lazyVideo);
  } else {
    setTimeout(startLazyVideo, 1200);
  }
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

function scrollToForm(type = "Jiný dotaz") {
  if (requestType) requestType.value = type;
  closePopup();
  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => form?.querySelector("input[name='name']")?.focus(), 650);
}

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  mobileMenu?.classList.toggle("open", !expanded);
  body.classList.toggle("menu-open", !expanded);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    body.classList.remove("menu-open");
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
  formStatus.textContent = "Děkujeme. Toto je lokální demo - reálné odesílání připojíme po potvrzení e-mailu klienta.";
  form.reset();
});

setupPreloader();
setupVideos();
setTimeout(openPopup, 1200);
