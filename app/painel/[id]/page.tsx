"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { QrPanel } from "@/components/QrPanel";
import { useAuth } from "@/components/AuthProvider";
import { authErrorMessage, firebaseEnabled } from "@/lib/firebase/auth";
import { getGiftRemote } from "@/lib/firebase/gifts";
import { startCheckout } from "@/lib/pay";
import { getLocalGiftById } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function PainelGiftPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [gift, setGift] = useState<Gift | null>(null);
  const [origin, setOrigin] = useState("");
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    if (!ready) return;
    if (firebaseEnabled && !user) {
      router.replace(`/entrar?next=/painel/${params.id}`);
      return;
    }
    void (async () => {
      if (user) {
        try {
          const remote = await getGiftRemote(params.id);
          if (remote) {
            setGift(remote);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      const local = getLocalGiftById(params.id);
      if (local && (!local.ownerUid || local.ownerUid === user?.uid)) {
        setGift(local);
        return;
      }
      setMissing(true);
    })();
  }, [params.id, ready, user, router]);

  async function payNow() {
    if (!gift) return;
    const email = (user?.email || gift.email).trim().toLowerCase();
    if (!email) {
      setError("Entra na conta para pagar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await startCheckout(email, gift.id);
      if (data.demo) {
        router.push("/obrigado");
        return;
      }
      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      throw new Error("Checkout sem destino");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!ready || (firebaseEnabled && !user)) {
    return <div className="min-h-dvh bg-paper" />;
  }

  if (missing || !gift) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <Logo />
        <h1 className="mt-8 font-display text-4xl">Nenhum recado por aqui ainda.</h1>
        <Link href="/criar" className="btn-primary mt-6 inline-flex">
          Criar presente
        </Link>
      </main>
    );
  }

  if (!gift.paid) {
    return (
      <main className="mx-auto max-w-lg px-5 py-10">
        <Link href="/painel" className="text-sm font-bold text-berry">
          ← Meus recados
        </Link>
        <h1 className="mt-4 font-display text-4xl">Seu recado está salvo. Falta pagar.</h1>
        <p className="mt-2 text-muted">
          {gift.authorName} → {gift.recipientName}. O QR só libera depois do Pix ou cartão.
        </p>
        {error ? <p className="mt-4 font-bold text-berry">{error}</p> : null}
        <button className="btn-primary mt-8 w-full" disabled={busy} onClick={() => void payNow()}>
          {busy ? "Abrindo pagamento..." : "Pagar e gerar QR"}
        </button>
        <Link href={`/criar?editar=${gift.id}`} className="mt-4 block text-center font-bold text-berry">
          Continuar editando
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <Link href="/painel" className="text-sm font-bold text-berry">
        ← Meus recados
      </Link>
      <h1 className="mt-4 font-display text-4xl">Seu presente está pronto.</h1>
      <p className="mt-2 text-muted">
        Baixa o QR, manda o link, esconde na caixinha. A pessoa não precisa de app.
      </p>
      <div className="mt-8">
        <QrPanel gift={gift} origin={origin} />
      </div>
    </main>
  );
}
