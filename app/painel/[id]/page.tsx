"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { QrPanel } from "@/components/QrPanel";
import { getLocalGiftById, listLocalGifts } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function PainelGiftPage() {
  const params = useParams<{ id: string }>();
  const [gift, setGift] = useState<Gift | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setGift(getLocalGiftById(params.id) ?? listLocalGifts()[0] ?? null);
  }, [params.id]);

  if (!gift) {
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
