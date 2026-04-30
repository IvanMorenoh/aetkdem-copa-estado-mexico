(function () {
  const athleteStorageKey = "aetkdem-athletes";

  const fieldAliases = {
    rama: ["rama", "genero", "sexo"],
    categoria: ["categoria", "categoría"],
    division: ["division", "división", "peso"],
    nombre: ["nombre", "atleta", "competidor", "competidora", "nombre del competidor"],
    escuela: ["escuela", "academia", "club", "institucion", "institución"],
    entrenador: ["entrenador", "coach", "profesor"],
    grado: ["grado", "cinta", "cinturon", "cinturón"],
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function cleanDivision(value) {
    const cleanValue = String(value || "")
      .replace(/\s*kg\s*/gi, "")
      .replace(/\s+/g, "")
      .trim();

    if (cleanValue && !cleanValue.startsWith("-") && !cleanValue.startsWith("+")) {
      return `+${cleanValue}`;
    }

    return cleanValue;
  }

  function normalizeCategory(value) {
    const category = normalize(value);
    if (category === "cadete") return "cadetes";
    if (category === "juvenil") return "junior";
    return category;
  }

  function getValue(row, field) {
    const aliases = fieldAliases[field] || [field];
    const key = Object.keys(row).find((candidate) => aliases.includes(normalize(candidate)));
    return key ? String(row[key] || "").trim() : "";
  }

  function normalizeAthlete(row) {
    const athlete = {
      rama: normalize(getValue(row, "rama")),
      categoria: normalizeCategory(getValue(row, "categoria")),
      division: cleanDivision(getValue(row, "division")),
      nombre: getValue(row, "nombre"),
      escuela: getValue(row, "escuela"),
      entrenador: getValue(row, "entrenador"),
      grado: getValue(row, "grado"),
    };

    if (athlete.rama === "femenino") athlete.rama = "femenil";
    if (athlete.rama === "masculino" || athlete.rama === "hombre") athlete.rama = "varonil";
    return athlete;
  }

  function getAthletes() {
    try {
      return JSON.parse(localStorage.getItem(athleteStorageKey) || "[]");
    } catch {
      return [];
    }
  }

  function setAthletes(athletes) {
    localStorage.setItem(athleteStorageKey, JSON.stringify(athletes));
  }

  async function getFirebaseApi() {
    try {
      const api = await import("./firebase-app.js");
      return api.firebaseReady() ? api : null;
    } catch {
      return null;
    }
  }

  async function currentUserCanWrite() {
    const api = await getFirebaseApi();
    if (!api) return false;
    return api.isAdminUser(api.getFirebaseAuth().currentUser);
  }

  async function syncAthletesFromCloud() {
    const api = await getFirebaseApi();
    if (!api) return getAthletes();

    const athletes = await api.fetchAthletes();
    setAthletes(athletes);
    return athletes;
  }

  function filterAthletes({ rama, categoria, division }) {
    const normalizedRama = normalize(rama);
    const normalizedCategory = normalizeCategory(categoria);
    const normalizedDivision = cleanDivision(division);

    return getAthletes().filter((athlete) => {
      return (
        normalize(athlete.rama) === normalizedRama &&
        normalizeCategory(athlete.categoria) === normalizedCategory &&
        cleanDivision(athlete.division) === normalizedDivision
      );
    });
  }

  function makeDivisionUrl(rama, categoria, division) {
    const params = new URLSearchParams({
      rama,
      categoria,
      division: cleanDivision(division),
    });
    return `atletas-division-copa-estado-mexico.html?${params.toString()}`;
  }

  function updateDivisionLinks() {
    document.querySelectorAll(".category-card").forEach((categoryCard) => {
      const pageTitle = document.querySelector(".detail-hero h1")?.textContent || "";
      const categoryTitle = categoryCard.querySelector(".category-heading h2")?.textContent || "";
      categoryCard.querySelectorAll(".division-card").forEach((link) => {
        link.dataset.rama = normalize(pageTitle);
        link.dataset.categoria = normalizeCategory(categoryTitle);
        link.dataset.division = cleanDivision(link.childNodes[0]?.textContent || link.textContent);
      });
    });

    document.querySelectorAll("[data-rama][data-categoria][data-division]").forEach((link) => {
      const rama = link.dataset.rama;
      const categoria = link.dataset.categoria;
      const division = link.dataset.division;
      const athletes = filterAthletes({ rama, categoria, division });
      link.href = makeDivisionUrl(rama, categoria, division);

      let count = link.querySelector(".division-count");
      if (!count) {
        count = document.createElement("span");
        count.className = "division-count";
        link.appendChild(count);
      }
      count.textContent = `${athletes.length} atleta${athletes.length === 1 ? "" : "s"}`;
    });
  }

  function renderDivisionPage() {
    const container = document.querySelector("#division-athletes");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const rama = params.get("rama") || "";
    const categoria = params.get("categoria") || "";
    const division = params.get("division") || "";
    const athletes = filterAthletes({ rama, categoria, division }).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );

    document.querySelector("#division-title").textContent = `${rama} · ${categoria} · ${division} kg`;
    document.querySelector("#division-subtitle").textContent = `${athletes.length} atleta${athletes.length === 1 ? "" : "s"} registrado${athletes.length === 1 ? "" : "s"}`;

    if (!athletes.length) {
      container.innerHTML = `<p class="empty-state">Todavía no hay atletas registrados en esta división.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="athlete-table-wrap">
        <table class="athlete-table">
          <thead>
            <tr>
              <th>Atleta</th>
              <th>Institución</th>
            </tr>
          </thead>
          <tbody>
            ${athletes
              .map(
                (athlete) => `
                  <tr>
                    <td>${escapeHtml(athlete.nombre)}</td>
                    <td>${escapeHtml(athlete.escuela)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initAthleteImport() {
    const form = document.querySelector("#athlete-import-form");
    if (!form) return;

    const fileInput = document.querySelector("#athlete-file");
    const status = document.querySelector("#athlete-import-status");
    const clearButton = document.querySelector("#clear-athletes");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const file = fileInput.files[0];
      if (!file) return;

      try {
        const athletes = await importAthletesFile(file);
        status.textContent = `Se importaron ${athletes.length} atletas.`;
        renderAthleteAdminSummary();
      } catch (error) {
        status.textContent = "No se pudo leer el archivo. Revisa el formato del Excel o CSV.";
      }
    });

    clearButton.addEventListener("click", () => {
      setAthletes([]);
      status.textContent = "Listado de atletas eliminado.";
      renderAthleteAdminSummary();
    });

    renderAthleteAdminSummary();
  }

  async function importAthletesFile(file) {
    const rows = await readSpreadsheet(file);
    const athletes = rows
      .map(normalizeAthlete)
      .filter((athlete) => athlete.rama && athlete.categoria && athlete.division && athlete.nombre);

    setAthletes(athletes);
    const api = await getFirebaseApi();
    if (api) await api.replaceAthletes(athletes);
    return athletes;
  }

  function initInlineAthleteUploads() {
    document.querySelectorAll("[data-athlete-upload-button]").forEach((button) => {
      const wrapper = button.closest(".gender-admin-action") || button.parentElement;
      const input = wrapper?.querySelector("[data-athlete-upload-input]");
      const status = wrapper?.querySelector("[data-athlete-upload-status]");
      if (!input) return;

      button.addEventListener("click", () => input.click());
      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return;

        try {
          if (!(await currentUserCanWrite())) {
            throw new Error("not-admin");
          }
          const athletes = await importAthletesFile(file);
          if (status) status.textContent = `Se cargaron ${athletes.length} atletas.`;
          updateDivisionLinks();
        } catch (error) {
          if (status) status.textContent = "No se pudo leer el archivo. Revisa el formato.";
        } finally {
          input.value = "";
        }
      });
    });
  }

  function renderAthleteAdminSummary() {
    const summary = document.querySelector("#athlete-summary");
    if (!summary) return;

    const athletes = getAthletes();
    const groups = athletes.reduce((acc, athlete) => {
      const key = `${athlete.rama} · ${athlete.categoria}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    if (!athletes.length) {
      summary.innerHTML = `<p class="empty-state">Aún no hay atletas importados.</p>`;
      return;
    }

    summary.innerHTML = `
      <p><strong>${athletes.length}</strong> atletas cargados.</p>
      <div class="summary-pills">
        ${Object.entries(groups)
          .map(([label, count]) => `<span>${escapeHtml(label)}: ${count}</span>`)
          .join("")}
      </div>
    `;
  }

  function readSpreadsheet(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") return readCsv(file);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (!window.XLSX) throw new Error("XLSX library unavailable");
          const workbook = window.XLSX.read(reader.result, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          resolve(window.XLSX.utils.sheet_to_json(sheet, { defval: "" }));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function readCsv(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const lines = String(reader.result || "").split(/\r?\n/).filter(Boolean);
          const headers = parseCsvLine(lines.shift() || "");
          resolve(
            lines.map((line) => {
              const cells = parseCsvLine(line);
              return headers.reduce((row, header, index) => {
                row[header] = cells[index] || "";
                return row;
              }, {});
            })
          );
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  }

  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let quoted = false;

    for (const char of line) {
      if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  window.AETKDEMAthletes = {
    getAthletes,
    setAthletes,
    filterAthletes,
    updateDivisionLinks,
    renderDivisionPage,
    initAthleteImport,
    initInlineAthleteUploads,
    syncAthletesFromCloud,
  };

  document.addEventListener("DOMContentLoaded", async () => {
    await syncAthletesFromCloud();
    updateDivisionLinks();
    renderDivisionPage();
    initAthleteImport();
    initInlineAthleteUploads();
  });
})();
