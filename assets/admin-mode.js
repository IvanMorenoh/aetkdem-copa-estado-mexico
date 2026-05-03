import { firebaseReady, isAdminUser, watchAdmin } from "./firebase-app.js?v=20260502-batch-writes";

const adminSelector = ".admin-only";

function setAdminControlsVisible(isVisible) {
  document.documentElement.classList.toggle("is-admin", isVisible);

  document.querySelectorAll(adminSelector).forEach((element) => {
    element.hidden = !isVisible;
    element.setAttribute("aria-hidden", String(!isVisible));
  });
}

setAdminControlsVisible(false);

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
