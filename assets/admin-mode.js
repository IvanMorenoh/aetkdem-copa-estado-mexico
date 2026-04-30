import { firebaseReady, isAdminUser, watchAdmin } from "./firebase-app.js";

function hideAdminControls() {
  document.documentElement.classList.remove("is-admin");
}

function showAdminControls() {
  document.documentElement.classList.add("is-admin");
}

hideAdminControls();

if (firebaseReady()) {
  watchAdmin(async (user) => {
    if (user && (await isAdminUser(user))) {
      showAdminControls();
    } else {
      hideAdminControls();
    }
  });
}

