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

function getFriendlyAuthError(error) {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential": "No se pudo iniciar sesión: el correo o la contraseña no coinciden con Firebase.",
    "auth/user-not-found": "No existe una cuenta registrada con ese correo en Firebase Authentication.",
    "auth/wrong-password": "La contraseña no coincide con ese correo.",
    "auth/invalid-email": "El correo no tiene un formato válido.",
    "auth/user-disabled": "Esta cuenta está deshabilitada en Firebase Authentication.",
    "auth/too-many-requests": "Firebase bloqueó temporalmente el acceso por demasiados intentos. Espera unos minutos e intenta de nuevo.",
    "auth/network-request-failed": "No se pudo conectar con Firebase. Revisa tu conexión e intenta otra vez.",
    "permission-denied": "La cuenta inició sesión, pero Firebase no permitió revisar permisos de administrador.",
  };

  return messages[code] || error?.message || "No se pudo iniciar sesión. Revisa correo y contraseña.";
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
        status.textContent = `Tu cuenta inició sesión, pero no está autorizada como admin. UID: ${user.uid}`;
      }
    } catch (error) {
      setAdminState(null);
      if (status) {
        status.textContent = getFriendlyAuthError(error);
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
          document.querySelector("#admin-email").value.trim(),
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
      status.textContent = getFriendlyAuthError(error);
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
