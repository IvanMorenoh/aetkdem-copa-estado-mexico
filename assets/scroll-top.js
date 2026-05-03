(function () {
  const showAfterPixels = 260;

  function createButton() {
    const existingButton = document.querySelector(".scroll-top-button");
    if (existingButton) return existingButton;

    const button = document.createElement("button");
    button.className = "scroll-top-button";
    button.type = "button";
    button.setAttribute("aria-label", "Volver arriba");
    button.textContent = "↑";
    document.body.appendChild(button);
    return button;
  }

  function updateVisibility(button) {
    button.classList.toggle("is-visible", window.scrollY > showAfterPixels);
  }

  function initScrollTop() {
    const button = createButton();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateVisibility(button);
    window.addEventListener("scroll", () => updateVisibility(button), { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollTop);
  } else {
    initScrollTop();
  }
})();
