import {
  firebaseReady,
  loginAdmin,
  logoutAdmin,
  isAdminUser,
  watchAdmin,
} from "./firebase-app.js";

const loginCard = document.querySelector("[data-admin-login]");
const loginForm = document.querySelector("#admin-login-form");
const status = document.querySelector("#admin-login-status");
const logoutButton = document.querySelector("#admin-logout");
let loginInProgress = false;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function setAdminState(user) {
  if (user) {
    document.documentElement.classList.add("is-admin");
    localStorage.setItem("aetkdem-admin-mode", "true");
    if (loginCard) loginCard.hidden = true;
  } else {
    document.documentElement.classList.remove("is-admin");
    localStorage.removeItem("aetkdem-admin-mode");
    if (loginCard) loginCard.hidden = false;
  }
}

if (!firebaseReady()) {
  if (status) {
    status.textContent = "Firebase aún no está configurado. Pega la configuración real en assets/firebase-config.js.";
  }
} else {
  watchAdmin(async (user) => {
    if (loginInProgress) return;
    try {
      const hasAccess = user ? await isAdminUser(user) : false;
      setAdminState(user && hasAccess ? user : null);
      if (user && !hasAccess && status) {
        status.textContent = "Tu cuenta no está asignada como administradora. Revisa el UID en Firestore.";
      }
    } catch (error) {
      setAdminState(null);
      if (status) {
        status.textContent = "No se pudo validar el permiso de administrador. Revisa reglas y UID.";
      }
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!firebaseReady()) return;

    try {
      loginInProgress = true;
      status.textContent = "Validando acceso...";
      const credential = await withTimeout(
        loginAdmin(
          document.querySelector("#admin-email").value,
          document.querySelector("#admin-password").value
        ),
        12000,
        "Tiempo de espera agotado al iniciar sesión."
      );

      status.textContent = "Sesión iniciada. Validando permisos...";
      const hasAccess = await withTimeout(
        isAdminUser(credential.user),
        12000,
        "Tiempo de espera agotado al validar permisos."
      );

      if (!hasAccess) {
        setAdminState(null);
        status.textContent = `La cuenta inició sesión, pero no está autorizada como admin. UID: ${credential.user.uid}`;
        return;
      }

      setAdminState(credential.user);
      status.textContent = "";
    } catch (error) {
      setAdminState(null);
      status.textContent = error.message || "No se pudo iniciar sesión. Revisa correo y contraseña.";
    } finally {
      loginInProgress = false;
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    if (!firebaseReady()) return;
    await logoutAdmin();
  });
}
