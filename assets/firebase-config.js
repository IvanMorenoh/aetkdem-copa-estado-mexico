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
    .brand.brand-logo-ready {
      display: inline-flex;
      gap: 16px;
      align-items: center;
      width: auto;
      max-width: 100%;
      padding-right: 24px;
      cursor: pointer;
    }

    .brand-logo-mark {
      width: 78px;
      height: 74px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border: 5px solid #d6dce4;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 2px 7px rgba(20, 40, 74, 0.16);
      flex: 0 0 auto;
    }

    .brand-logo-mark img {
      width: 142px;
      max-width: none;
      height: auto;
      transform: translateY(-22px);
    }

    .brand-logo-text {
      display: block;
      min-width: 0;
    }

    .brand-logo-text strong,
    .brand-logo-text small {
      display: block;
    }

    .brand-logo-text strong {
      color: var(--blue-dark);
      font-size: 39px;
      line-height: 0.92;
      font-weight: 900;
      letter-spacing: 0;
    }

    .brand-logo-text small {
      color: var(--green);
      font-size: 11px;
      font-weight: 800;
      margin-top: 5px;
      text-transform: uppercase;
      white-space: normal;
    }

    .brand-row-inner {
      min-height: 112px;
    }

    @media (max-width: 900px) {
      .brand-row-inner {
        min-height: 96px;
      }
    }

    @media (max-width: 700px) {
      .social-strip { display: block !important; }
    }

    @media (max-width: 620px) {
      .brand.brand-logo-ready {
        gap: 10px;
        padding-right: 0;
      }

      .brand-logo-mark {
        width: 58px;
        height: 54px;
        border-width: 4px;
        border-radius: 10px;
      }

      .brand-logo-mark img {
        width: 105px;
        transform: translateY(-16px);
      }

      .brand-logo-text {
        max-width: 220px;
      }

      .brand-logo-text strong {
        font-size: 28px;
      }

      .brand-logo-text small {
        font-size: 10px;
        line-height: 1.15;
      }
    }
  `;
  document.head.appendChild(style);
})();

(function loadAetkdemLogo() {
  const logoPath = "assets/aetkdem-logo-header.webp.base64?v=20260503-logo-mark-text";

  function applyLogo() {
    const logoSrc = window.AETKDEM_LOGO_SRC;
    if (!logoSrc) return;

    document.querySelectorAll(".brand").forEach((brand) => {
      if (brand.dataset.logoReady === "true") return;
      brand.classList.add("brand-logo-ready");
      brand.innerHTML = `
        <span class="brand-logo-mark" aria-hidden="true">
          <img src="${logoSrc}" alt="">
        </span>
        <span class="brand-logo-text">
          <strong>AETKDEM</strong>
          <small>Asociación Estatal de Taekwondo del Estado de México A.C.</small>
        </span>
      `;
      brand.dataset.logoReady = "true";
    });
  }

  window.AETKDEM_APPLY_LOGO = applyLogo;

  fetch(logoPath)
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el logo AETKDEM.");
      return response.text();
    })
    .then((content) => {
      window.AETKDEM_LOGO_SRC = `data:image/webp;base64,${content.trim()}`;
      applyLogo();
    })
    .catch(() => {
      // Si el logo no carga, el encabezado original queda como respaldo.
    });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLogo);
  } else {
    applyLogo();
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
    if (window.AETKDEM_APPLY_LOGO) window.AETKDEM_APPLY_LOGO();
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
