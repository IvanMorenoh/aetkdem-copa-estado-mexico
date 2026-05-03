(function () {
  function cleanDivision(value) {
    return String(value || "")
      .replace(/\s*kg\s*/gi, "")
      .replace(/\s+/g, "")
      .trim();
  }

  function titleCase(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/(^|\s|-)([a-záéíóúñ])/g, (match) => match.toUpperCase());
  }

  function categoryLabel(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "cadetes" || normalized === "cadete") return "Cadetes";
    if (normalized === "infantil") return "Infantil";
    if (normalized === "junior") return "Junior";
    if (normalized === "senior") return "Senior";
    return titleCase(value);
  }

  function ramaPage(rama) {
    const normalized = String(rama || "").trim().toLowerCase();
    if (normalized === "femenil") return "atletas-femenil-copa-estado-mexico.html";
    if (normalized === "varonil") return "atletas-varonil-copa-estado-mexico.html";
    return "atletas-registrados-copa-estado-mexico.html";
  }

  function athleteCountFromPage() {
    const rows = document.querySelectorAll("#division-athletes tbody tr").length;
    if (rows) return rows;

    const subtitle = document.querySelector("#division-subtitle")?.textContent || "";
    const match = subtitle.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function formatHeader() {
    const params = new URLSearchParams(window.location.search);
    const rama = params.get("rama") || "";
    const categoria = params.get("categoria") || "";
    const division = cleanDivision(params.get("division") || "");
    const title = document.querySelector("#division-title");
    const subtitle = document.querySelector("#division-subtitle");
    const backLink = document.querySelector("#division-back-link");

    if (title) {
      title.textContent = `${titleCase(rama)}-${categoryLabel(categoria)}-${division}kg`;
    }

    if (subtitle) {
      subtitle.textContent = `Total de atletas registrados: ${athleteCountFromPage()}`;
    }

    if (backLink) {
      backLink.href = ramaPage(rama);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    formatHeader();

    const target = document.querySelector("#division-athletes");
    if (!target) return;

    const observer = new MutationObserver(() => formatHeader());
    observer.observe(target, { childList: true, subtree: true });
  });
})();
