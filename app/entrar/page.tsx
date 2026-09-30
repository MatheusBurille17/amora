"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import {
  authErrorMessage,
  firebaseEnabled,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/firebase/auth";

function EntrarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/painel";
  const { user, ready } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  async function submit() {
    setError("");
    if (!email.trim() || password.length < 6) {
      setError("E-mail e senha (mínimo 6 caracteres).");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
      router.replace(next);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseEnabled) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <Logo />
        <h1 className="mt-8 font-display text-4xl">Conta ainda não está ligada.</h1>
        <p className="mt-3 text-muted">O login entra quando o Firebase Authentication (e-mail e senha) estiver ativo.</p>
        <Link href="/criar" className="btn-primary mt-6 inline-flex">
          Criar presente
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <Link href="/">
        <Logo />
      </Link>
      <h1 className="mt-8 font-display text-4xl">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="mt-2 text-muted">
        Com a conta você acha o QR e o link em qualquer celular.
      </p>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">E-mail</span>
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Senha</span>
          <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
        </label>
        {error ? <p className="font-bold text-berry">{error}</p> : null}
        <button className="btn-primary w-full" disabled={busy} onClick={() => void submit()}>
          {busy ? "Entrando..." : mode === "login" ? "Entrar no painel" : "Criar conta"}
        </button>
        <button
          className="w-full font-bold text-berry"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "Não tenho conta ainda" : "Já tenho conta"}
        </button>
      </div>
    </main>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
