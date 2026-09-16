"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { giftPath } from "@/lib/slug";
import { listLocalGifts } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function PainelPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);

  useEffect(() => {
    setGifts(listLocalGifts());
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/criar" className="btn-primary">
          Novo recado
        </Link>
      </div>
      <h1 className="mt-10 font-display text-4xl">Seus recados</h1>
      <p className="mt-2 text-muted">Aqui ficam o link e o QR Code de cada presente.</p>
      <div className="mt-8 space-y-4">
        {gifts.length === 0 ? (
          <div className="soft-card rounded-3xl p-8 text-center">
            <p>Você ainda não criou nenhum recado.</p>
            <Link href="/criar" className="btn-primary mt-5 inline-flex">
              Criar agora
            </Link>
          </div>
        ) : (
          gifts.map((gift) => (
            <Link
              key={gift.id}
              href={`/painel/${gift.id}`}
              className="soft-card block rounded-3xl p-5"
            >
              <p className="font-extrabold">
                {gift.authorName} → {gift.recipientName}
              </p>
              <p className="text-sm text-muted">
                {gift.paid ? "Vitalício liberado" : "Rascunho"} · {giftPath(gift.slug)}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
