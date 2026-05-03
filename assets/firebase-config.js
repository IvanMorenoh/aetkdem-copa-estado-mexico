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

(function loadScrollTopControl() {
  if (document.querySelector('link[href^="scroll-top.css"]')) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "scroll-top.css?v=20260503-scroll-top";
  document.head.appendChild(stylesheet);

  const script = document.createElement("script");
  script.src = "assets/scroll-top.js?v=20260503-scroll-top";
  script.defer = true;
  document.head.appendChild(script);
})();
