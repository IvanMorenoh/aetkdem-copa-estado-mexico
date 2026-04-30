import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const config = window.AETKDEM_FIREBASE_CONFIG;
const isConfigured = config && !String(config.apiKey || "").startsWith("REEMPLAZAR");

let app = null;
let auth = null;
let db = null;

if (isConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

function requireConfigured() {
  if (!isConfigured) {
    throw new Error("Firebase no está configurado todavía.");
  }
}

export function firebaseReady() {
  return isConfigured;
}

export function getFirebaseAuth() {
  requireConfigured();
  return auth;
}

export function watchAdmin(callback) {
  if (!isConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function loginAdmin(email, password) {
  requireConfigured();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function isAdminUser(user) {
  requireConfigured();
  if (!user) return false;
  const snapshot = await getDoc(doc(db, "admins", user.uid));
  return snapshot.exists();
}

export async function logoutAdmin() {
  requireConfigured();
  return signOut(auth);
}

export async function replaceAthletes(athletes) {
  requireConfigured();
  const batch = writeBatch(db);
  const existing = await getDocs(collection(db, "athletes"));
  existing.forEach((snapshot) => batch.delete(snapshot.ref));

  athletes.forEach((athlete, index) => {
    const id = `${athlete.rama}-${athlete.categoria}-${athlete.division}-${index}`.replace(/[^\w-]/g, "_");
    batch.set(doc(db, "athletes", id), {
      ...athlete,
      uploadedAt: new Date().toISOString(),
    });
  });

  await batch.commit();
}

export async function fetchAthletes(filters = {}) {
  requireConfigured();
  const constraints = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([field, value]) => where(field, "==", value));
  const snapshot = await getDocs(query(collection(db, "athletes"), ...constraints));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function saveEvent(eventId, data) {
  requireConfigured();
  return setDoc(doc(db, "events", eventId), data, { merge: true });
}
