import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseEnabled, getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

export function watchAuth(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function ensureUserDoc(user: User) {
  const db = getFirebaseDb();
  if (!db || !user.email) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    uid: user.uid,
    email: user.email.toLowerCase(),
    createdAt: new Date().toISOString(),
  });
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado.");
  const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function signOutUser() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function authErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : "";
  if (code === "auth/email-already-in-use") {
    return "Esse e-mail já tem conta. Entra com a senha.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "E-mail ou senha errados.";
  }
  if (code === "auth/weak-password") {
    return "A senha precisa de pelo menos 6 caracteres.";
  }
  if (code === "auth/invalid-email") {
    return "E-mail inválido.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Ativa o login por e-mail e senha no Firebase Authentication.";
  }
  if (code === "permission-denied" || /insufficient permissions/i.test(message)) {
    return "O Firebase ainda não liberou a gravação. Confere se o Firestore está criado e as regras publicadas.";
  }
  if (message) return message;
  return "Não deu para entrar. Tenta de novo.";
}

export { firebaseEnabled };
export type { User };
