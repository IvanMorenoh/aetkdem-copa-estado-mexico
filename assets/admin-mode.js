import { firebaseReady, isAdminUser, logoutAdmin, watchAdmin } from "./firebase-app.js?v=20260502-batch-writes";

const adminSelector = ".admin-only";
const logoutSelector = "[data-admin-logout]";

function setAdminControlsVisible(isVisible) {
  document.documentElement.classList.toggle("is-admin", isVisible);

  document.querySelectorAll(adminSelector).forEach((element) => {
    element.hidden = !isVisible;
    element.setAttribute("aria-hidden", String(!isVisible));
  });
}

function bindLogoutButtons() {
  document.querySelectorAll(logoutSelector).forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await logoutAdmin();
        localStorage.removeItem("aetkdem-admin-mode");
        setAdminControlsVisible(false);
      } catch (error) {
        console.error("No se pudo cerrar la sesión de administrador", error);
      } finally {
        button.disabled = false;
      }
    });
  });
}

setAdminControlsVisible(false);
bindLogoutButtons();

if (firebaseReady()) {
  watchAdmin(async (user) => {
    try {
      const hasAccess = user ? await isAdminUser(user) : false;
      setAdminControlsVisible(Boolean(user && hasAccess));
    } catch (error) {
      console.error("No se pudo validar el acceso de administrador", error);
      setAdminControlsVisible(false);
    }
  });
} else {
  setAdminControlsVisible(false);
}
