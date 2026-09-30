"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { QrPanel } from "@/components/QrPanel";
import { useAuth } from "@/components/AuthProvider";
import { firebaseEnabled } from "@/lib/firebase/auth";
import { getGiftRemote } from "@/lib/firebase/gifts";
import { getLocalGiftById, listLocalGifts } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function PainelGiftPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [gift, setGift] = useState<Gift | null>(null);
  const [origin, setOrigin] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    if (!ready) return;
    if (firebaseEnabled && !user) {
      router.replace(`/entrar?next=/painel/${params.id}`);
      return;
    }
    void (async () => {
      const local = getLocalGiftById(params.id);
      if (user) {
        try {
          const remote = await getGiftRemote(params.id);
          if (remote) {
            setGift(remote);
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (local) {
        setGift(local);
        return;
      }
      setGift(listLocalGifts()[0] ?? null);
      if (!local && listLocalGifts().length === 0) setMissing(true);
    })();
  }, [params.id, ready, user, router]);

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
