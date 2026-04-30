(function () {
  const storageKey = "aetkd-edomex-content";
  const fallbackImage =
    "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=900&q=80";

  const demoData = [
    {
      id: "n1",
      type: "news",
      title: "Selección estatal inicia preparación rumbo al calendario nacional",
      description: "Atletas y entrenadores trabajan en concentraciones técnicas para fortalecer el proceso competitivo.",
      date: "Abril 2026",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "n2",
      type: "news",
      title: "Convocatoria para afiliación y actualización de escuelas",
      description: "La asociación informa los requisitos básicos para registros, refrendos y documentación oficial.",
      date: "Temporada 2026",
      image: "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "n3",
      type: "news",
      title: "Resultados destacados en campeonato regional",
      description: "Deportistas mexiquenses consiguieron medallas en combate y poomsae durante la jornada estatal.",
      date: "Resultados",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "n4",
      type: "notice",
      title: "Comunicado oficial",
      description: "Avisos importantes para la comunidad del taekwondo mexiquense.",
      date: "Oficial",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "n5",
      type: "notice",
      title: "Diga NO al doping",
      description: "Campaña permanente de deporte limpio y responsabilidad competitiva.",
      date: "Campaña",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "e4",
      type: "event",
      title: "Copa Estado de México",
      description:
        "Competencia estatal dirigida a escuelas, atletas y entrenadores afiliados. Próximamente se publicará la convocatoria oficial con todos los detalles.",
      date: "29, 30 y 31 Mayo 2026",
      category: "Combate y Poomsae",
      venue: "Estado de México",
      link: "convocatoria-copa-estado-mexico.html",
      important:
        "Registro de atletas\nCategorías y horarios por confirmar\nMantenerse atentos a la convocatoria",
      image: "https://images.unsplash.com/photo-1555597408-26bc8e548a46?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "e1",
      type: "event",
      title: "Seminario estatal de entrenadores",
      description: "Capacitación técnica y actualización de reglamento para profesores afiliados.",
      date: "18 Mayo 2026",
      category: "Capacitación",
      venue: "Toluca, Estado de México",
      link: "#",
      image: fallbackImage,
    },
    {
      id: "e2",
      type: "event",
      title: "Ranking estatal G3",
      description: "Evento selectivo para categorías infantiles, juveniles y adultos.",
      date: "14 Junio 2026",
      category: "Combate y Poomsae",
      venue: "Zona Metropolitana, Estado de México",
      link: "#",
      image: fallbackImage,
    },
    {
      id: "e3",
      type: "event",
      title: "Concentración estatal de selecciones",
      description: "Trabajo técnico con atletas preseleccionados rumbo a compromisos nacionales.",
      date: "05 Julio 2026",
      category: "Alto rendimiento",
      venue: "Centro de entrenamiento por confirmar",
      link: "#",
      image: fallbackImage,
    },
    {
      id: "m1",
      type: "media",
      title: "Galería de entrenamiento estatal",
      description: "Cobertura fotográfica de entrenamientos, competencias y actividades institucionales.",
      date: "Galería",
      image: "https://images.unsplash.com/photo-1555597408-26bc8e548a46?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "m2",
      type: "media",
      title: "Poomsae y combate",
      description: "Material visual de las modalidades oficiales del taekwondo.",
      date: "Media",
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80",
    },
  ];

  function getContent() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      localStorage.setItem(storageKey, JSON.stringify(demoData));
      return demoData;
    }

    try {
      const savedItems = JSON.parse(saved);
      const savedIds = new Set(savedItems.map((item) => item.id));
      const missingDemoEvents = demoData.filter((item) => item.type === "event" && !savedIds.has(item.id));
      const upgradedItems = savedItems.map((item) => {
        const demoItem = demoData.find((demo) => demo.id === item.id);
        if (item.id === "e4" && demoItem) return demoItem;
        return demoItem ? { ...demoItem, ...item } : item;
      });
      const nextItems = [...missingDemoEvents, ...upgradedItems];
      if (missingDemoEvents.length) setContent(nextItems);
      return nextItems;
    } catch {
      localStorage.setItem(storageKey, JSON.stringify(demoData));
      return demoData;
    }
  }

  function setContent(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function imageFor(item) {
    return item.image || fallbackImage;
  }

  function renderImportantInfo(value) {
    const points = String(value || "")
      .split("\n")
      .map((point) => point.trim())
      .filter(Boolean);

    if (!points.length) return "";

    return `
      <div class="event-important">
        <strong>Información importante</strong>
        <ul>
          ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function splitEventDate(value) {
    const cleanDate = String(value || "Proximo").trim();
    const match = cleanDate.match(/^(.*?)(?:\s+)([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(?:\s+)(\d{4})$/);

    if (!match) {
      return {
        days: cleanDate,
        month: "",
        year: "",
      };
    }

    return {
      days: match[1],
      month: match[2],
      year: match[3],
    };
  }

  function formatEventDays(value) {
    const cleanValue = String(value || "").trim();
    const rangeMatch = cleanValue.match(/^(\d{1,2}),\s*(\d{1,2})\s+y\s+(\d{1,2})$/);

    if (rangeMatch) {
      return `${escapeHtml(rangeMatch[1])}-${escapeHtml(rangeMatch[3])}`;
    }

    return escapeHtml(cleanValue);
  }

  function renderPublic() {
    const newsGrid = document.querySelector("#news-grid");
    const noticeList = document.querySelector("#notice-list");
    const eventList = document.querySelector("#event-list");
    const mediaGrid = document.querySelector("#media-grid");
    if (!newsGrid || !noticeList || !eventList || !mediaGrid) return;

    const items = getContent();
    const normalizedItems = items.map((item) =>
      item.id === "e4" ? { ...item, link: "convocatoria-copa-estado-mexico.html" } : item
    );
    const news = normalizedItems.filter((item) => item.type === "news").slice(0, 6);
    const notices = normalizedItems.filter((item) => item.type === "notice").slice(0, 6);
    const events = normalizedItems.filter((item) => item.type === "event").slice(0, 6);
    const media = normalizedItems.filter((item) => item.type === "media").slice(0, 6);

    newsGrid.innerHTML = news
      .map(
        (item) => `
          <article class="news-card">
            <img src="${escapeHtml(imageFor(item))}" alt="${escapeHtml(item.title)}">
            <div>
              <p class="card-meta">${escapeHtml(item.date)}</p>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="card-copy">${escapeHtml(item.description)}</p>
            </div>
          </article>
        `
      )
      .join("");

    noticeList.innerHTML = notices
      .map(
        (item) => `
          <article class="notice-card">
            <img src="${escapeHtml(imageFor(item))}" alt="${escapeHtml(item.title)}">
            <h3>${escapeHtml(item.title)}</h3>
          </article>
        `
      )
      .join("");

    eventList.innerHTML = events
      .map(
        (item) => {
          const eventDate = splitEventDate(item.date);

          return `
            <article class="event-item">
              <div class="event-date">
                <span class="event-date-days">${formatEventDays(eventDate.days)}</span>
                ${eventDate.month ? `<span class="event-date-month">${escapeHtml(eventDate.month)}</span>` : ""}
                ${eventDate.year ? `<span class="event-date-year">${escapeHtml(eventDate.year)}</span>` : ""}
              </div>
              <div class="event-content">
                <p class="event-category">${escapeHtml(item.category || "Evento oficial")}</p>
                <h3>${escapeHtml(item.title)}</h3>
                <p class="event-venue">${escapeHtml(item.venue || "Sede por confirmar")}</p>
                <p class="card-copy">${escapeHtml(item.description)}</p>
                ${renderImportantInfo(item.important)}
                ${item.link ? `<a class="event-link" href="${escapeHtml(item.link)}">Ver convocatoria</a>` : ""}
              </div>
            </article>
          `;
        }
      )
      .join("");

    mediaGrid.innerHTML = media
      .map(
        (item) => `
          <article class="media-item">
            <img src="${escapeHtml(imageFor(item))}" alt="${escapeHtml(item.title)}">
            <h3>${escapeHtml(item.title)}</h3>
          </article>
        `
      )
      .join("");
  }

  function renderAdmin() {
    const list = document.querySelector("#admin-items");
    if (!list) return;

    const items = getContent();
    list.innerHTML = items
      .map(
        (item) => `
          <article class="admin-item">
            <img src="${escapeHtml(imageFor(item))}" alt="">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.type)} · ${escapeHtml(item.date || "Sin fecha")}</p>
            </div>
            <button class="delete-btn" type="button" data-delete="${escapeHtml(item.id)}">Eliminar</button>
          </article>
        `
      )
      .join("");
  }

  function initAdminForm() {
    const form = document.querySelector("#content-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = {
        id: String(Date.now()),
        type: document.querySelector("#type").value,
        title: document.querySelector("#title").value.trim(),
        description: document.querySelector("#description").value.trim(),
        image: document.querySelector("#image").value.trim(),
        date: document.querySelector("#date").value.trim(),
        category: document.querySelector("#category").value.trim(),
        venue: document.querySelector("#venue").value.trim(),
        link: document.querySelector("#link").value.trim(),
        important: document.querySelector("#important").value.trim(),
      };

      const items = [item, ...getContent()];
      setContent(items);
      form.reset();
      renderAdmin();
    });

    document.querySelector("#admin-items").addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button) return;
      const id = button.getAttribute("data-delete");
      setContent(getContent().filter((item) => item.id !== id));
      renderAdmin();
    });

    document.querySelector("#reset-demo").addEventListener("click", () => {
      setContent(demoData);
      renderAdmin();
    });
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  initMenu();
  renderPublic();
  renderAdmin();
  initAdminForm();
})();
