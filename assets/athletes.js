(function () {
  const athleteStorageKey = "aetkdem-athletes";

  const fieldAliases = {
    rama: ["rama", "genero", "género", "sexo"],
    categoria: ["categoria", "categoría", "cat", "category", "clase", "edad"],
    division: ["division", "división", "peso", "categoria de peso", "categoría de peso", "kg"],
    nombre: ["nombre", "atleta", "competidor", "competidora", "nombre del competidor", "nombre del atleta", "nombre completo", "participante", "deportista"],
    escuela: ["escuela", "academia", "club", "institucion", "institución", "equipo", "dojang", "asociacion", "asociación"],
    entrenador: ["entrenador", "coach", "profesor", "maestro", "instructor"],
    grado: ["grado", "cinta", "cinturon", "cinturón", "kup", "dan"],
  };

  const knownFields = Object.keys(fieldAliases);

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\n\r\t]+/g, " ")
      .replace(/\s+/g, " ")
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
    if (category === "cadete" || category === "cadet") return "cadetes";
    if (category === "juvenil" || category === "junior") return "junior";
    if (category === "adulto" || category === "adultos" || category === "adult" || category === "senior") return "senior";
    if (category === "infantiles") return "infantil";
    return category;
  }

  function normalizeRama(value) {
    const rama = normalize(value);
    if (["f", "fem", "femenino", "femenil", "mujer", "mujeres", "female"].includes(rama)) return "femenil";
    if (["m", "masc", "masculino", "varonil", "hombre", "hombres", "male"].includes(rama)) return "varonil";
    return rama;
  }

  function aliasesFor(field) {
    return (fieldAliases[field] || [field]).map(normalize);
  }

  function fieldForHeader(header) {
    const normalizedHeader = normalize(header);
    return knownFields.find((field) => aliasesFor(field).includes(normalizedHeader));
  }

  function getValue(row, field) {
    const aliases = aliasesFor(field);
    const key = Object.keys(row).find((candidate) => aliases.includes(normalize(candidate)));
    return key ? String(row[key] || "").trim() : "";
  }

  function normalizeAthlete(row, defaults = {}) {
    return {
      rama: normalizeRama(getValue(row, "rama") || defaults.rama),
      categoria: normalizeCategory(getValue(row, "categoria") || defaults.categoria),
      division: cleanDivision(getValue(row, "division") || defaults.division),
      nombre: getValue(row, "nombre"),
      escuela: getValue(row, "escuela"),
      entrenador: getValue(row, "entrenador"),
      grado: getValue(row, "grado"),
    };
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
    const normalizedRama = normalizeRama(rama);
    const normalizedCategory = normalizeCategory(categoria);
    const normalizedDivision = cleanDivision(division);

    return getAthletes().filter((athlete) => {
      return (
        normalizeRama(athlete.rama) === normalizedRama &&
        normalizeCategory(athlete.categoria) === normalizedCategory &&
        cleanDivision(athlete.division) === normalizedDivision
      );
    });
  }

  function makeDivisionUrl(rama, categoria, division) {
    const params = new URLSearchParams({ rama, categoria, division: cleanDivision(division) });
    return `atletas-division-copa-estado-mexico.html?${params.toString()}`;
  }

  function updateDivisionLinks() {
    document.querySelectorAll(".category-card").forEach((categoryCard) => {
      const pageTitle = document.querySelector(".detail-hero h1")?.textContent || "";
      const categoryTitle = categoryCard.querySelector(".category-heading h2")?.textContent || "";
      categoryCard.querySelectorAll(".division-card").forEach((link) => {
        link.dataset.rama = normalizeRama(pageTitle);
        link.dataset.categoria = normalizeCategory(categoryTitle);
        link.dataset.division = cleanDivision(link.childNodes[0]?.textContent || link.textContent);
      });
    });

    document.querySelectorAll("[data-rama][data-categoria][data-division]").forEach((link) => {
      const { rama, categoria, division } = link.dataset;
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
      .replace(/\"/g, "&quot;")
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
        const result = await importAthletesFile(file);
        status.textContent = makeImportMessage(result);
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

  function makeImportMessage(result) {
    if (result.imported) return `Se cargaron ${result.imported} atletas.`;
    return "Se cargaron 0 atletas. Revisa que el archivo tenga columnas de nombre y división.";
  }

  async function importAthletesFile(file, defaults = {}) {
    const rows = await readSpreadsheet(file);
    const athletes = rows
      .map((row) => normalizeAthlete(row, defaults))
      .filter((athlete) => athlete.rama && athlete.categoria && athlete.division && athlete.nombre);

    setAthletes(athletes);
    const api = await getFirebaseApi();
    if (api) await api.replaceAthletes(athletes);
    return { athletes, imported: athletes.length, read: rows.length };
  }

  function defaultsFromUploadButton(button) {
    const categoryCard = button.closest(".category-card");
    return {
      rama: document.querySelector(".detail-hero h1")?.textContent || "",
      categoria: categoryCard?.querySelector(".category-heading h2")?.textContent || "",
    };
  }

  function initInlineAthleteUploads() {
    document.querySelectorAll("[data-athlete-upload-button]").forEach((button) => {
      const wrapper = button.closest(".gender-admin-action, .category-upload") || button.parentElement;
      const input = wrapper?.querySelector("[data-athlete-upload-input]");
      const status = wrapper?.querySelector("[data-athlete-upload-status]");
      if (!input) return;

      button.addEventListener("click", () => input.click());
      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return;

        try {
          if (!(await currentUserCanWrite())) throw new Error("not-admin");
          const result = await importAthletesFile(file, defaultsFromUploadButton(button));
          if (status) status.textContent = makeImportMessage(result);
          updateDivisionLinks();
        } catch (error) {
          if (status) status.textContent = "No se pudo leer el archivo. Revisa el formato o tu acceso de administrador.";
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
          const rows = workbook.SheetNames.flatMap((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const matrix = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
            return rowsFromMatrix(matrix);
          });
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function rowsFromMatrix(matrix) {
    const headerIndex = findHeaderRow(matrix);
    if (headerIndex === -1) return [];

    const headers = matrix[headerIndex].map((cell, index) => String(cell || `Columna ${index + 1}`).trim());
    return matrix
      .slice(headerIndex + 1)
      .map((cells) => headers.reduce((row, header, index) => {
        row[header] = cells[index] || "";
        return row;
      }, {}))
      .filter((row) => Object.values(row).some((value) => String(value || "").trim()));
  }

  function findHeaderRow(matrix) {
    let bestIndex = -1;
    let bestScore = 0;

    matrix.slice(0, 40).forEach((row, index) => {
      const fields = new Set(row.map(fieldForHeader).filter(Boolean));
      const score = fields.size + (fields.has("nombre") ? 2 : 0) + (fields.has("division") ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return bestScore >= 2 ? bestIndex : -1;
  }

  function readCsv(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const matrix = String(reader.result || "")
            .split(/\r?\n/)
            .filter(Boolean)
            .map(parseCsvLine);
          resolve(rowsFromMatrix(matrix));
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

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
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
