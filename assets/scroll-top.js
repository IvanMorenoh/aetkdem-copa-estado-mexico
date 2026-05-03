(function () {
  const minimumScrollToShow = 48;

  function createButton() {
    const existingButton = document.querySelector(".scroll-top-button");
    if (existingButton) return existingButton;

    const button = document.createElement("button");
    button.className = "scroll-top-button";
    button.type = "button";
    button.setAttribute("aria-label", "Volver arriba");
    button.textContent = "▲";
    document.body.appendChild(button);
    return button;
  }

  function currentScrollTop() {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function showThreshold() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(120, Math.max(minimumScrollToShow, scrollableHeight * 0.12));
  }

  function updateVisibility(button) {
    button.classList.toggle("is-visible", currentScrollTop() > showThreshold());
  }

  function initScrollTop() {
    const button = createButton();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateVisibility(button);
    window.addEventListener("scroll", () => updateVisibility(button), { passive: true });
    window.addEventListener("resize", () => updateVisibility(button), { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollTop);
  } else {
    initScrollTop();
  }
})();
