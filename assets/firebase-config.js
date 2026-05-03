// Reemplaza estos valores con la configuración real de Firebase.
// Firebase Console > Project settings > Your apps > Web app.
window.AETKDEM_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAyag010IU6-H7WBcKDTg3mdC2Lk5ILSuA",
  authDomain: "aetkdem-copa-estado-mexico.firebaseapp.com",
  projectId: "aetkdem-copa-estado-mexico",
  storageBucket: "aetkdem-copa-estado-mexico.firebasestorage.app",
  messagingSenderId: "982082346203",
  appId: "1:982082346203:web:6245281b007a6b7a7d00fe",
};

(function injectGlobalHeaderRules() {
  if (document.querySelector("#aetkdem-global-header-rules")) return;

  const style = document.createElement("style");
  style.id = "aetkdem-global-header-rules";
  style.textContent = `
    .brand-mark.brand-mark-real {
      display: grid;
      place-items: center;
      overflow: hidden;
      background: #fff;
      border-color: #d4d7dc;
    }

    .brand-mark-real .brand-logo-image {
      width: 152%;
      max-width: none;
      height: auto;
      transform: translateY(-8%);
    }

    @media (max-width: 700px) {
      .social-strip { display: block !important; }
    }

    @media (max-width: 620px) {
      .brand-mark-real .brand-logo-image {
        width: 156%;
        transform: translateY(-7%);
      }
    }
  `;
  document.head.appendChild(style);
})();

(function loadAetkdemLogoMark() {
  const logoPath = "assets/aetkdem-logo-header.webp.base64?v=20260503-logo";

  function applyLogoMark() {
    const logoSrc = window.AETKDEM_LOGO_MARK_SRC;
    if (!logoSrc) return;

    document.querySelectorAll(".brand-mark").forEach((mark) => {
      if (mark.dataset.logoReady === "true") return;
      mark.classList.add("brand-mark-real");
      mark.innerHTML = `<img class="brand-logo-image" src="${logoSrc}" alt="" aria-hidden="true">`;
      mark.dataset.logoReady = "true";
    });
  }

  window.AETKDEM_APPLY_LOGO_MARK = applyLogoMark;

  fetch(logoPath)
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el logo AETKDEM.");
      return response.text();
    })
    .then((content) => {
      window.AETKDEM_LOGO_MARK_SRC = `data:image/webp;base64,${content.trim()}`;
      applyLogoMark();
    })
    .catch(() => {
      // Si el logo no carga, el ícono CSS original queda como respaldo.
    });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLogoMark);
  } else {
    applyLogoMark();
  }
})();

(function injectAetkdemHeader() {
  function insertHeader() {
    if (!document.body || document.querySelector(".site-header")) return;

    const header = document.createElement("header");
    header.className = "site-header site-header-injected";
    header.innerHTML = `
      <div class="social-strip">
        <div class="wrap strip-inner">
          <div class="admin-session-actions">
            <a class="admin-shortcut" href="admin.html">Admin</a>
            <button class="admin-logout-shortcut admin-only" type="button" data-admin-logout hidden aria-hidden="true">Cerrar sesión</button>
          </div>
        </div>
      </div>

      <div class="brand-row">
        <div class="wrap brand-row-inner">
          <a class="brand" href="index.html" aria-label="Inicio">
            <span class="brand-mark" aria-hidden="true">
              <span class="mark-swoosh mark-green"></span>
              <span class="mark-swoosh mark-blue"></span>
            </span>
            <span>
              <strong>AETKDEM</strong>
              <small>Asociación Estatal de Taekwondo del Estado de México A.C.</small>
            </span>
          </a>
        </div>
      </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);
    if (window.AETKDEM_APPLY_LOGO_MARK) window.AETKDEM_APPLY_LOGO_MARK();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertHeader);
  } else {
    insertHeader();
  }
})();

(function loadScrollTopControl() {
  if (document.querySelector('link[href^="scroll-top.css"]')) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "scroll-top.css?v=20260503-scroll-top-sensitive";
  document.head.appendChild(stylesheet);

  const script = document.createElement("script");
  script.src = "assets/scroll-top.js?v=20260503-scroll-top-sensitive";
  script.defer = true;
  document.head.appendChild(script);
})();
