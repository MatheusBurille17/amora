"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { firebaseEnabled, signOutUser } from "@/lib/firebase/auth";
import { listGiftsRemote } from "@/lib/firebase/gifts";
import { giftPath } from "@/lib/slug";
import { listLocalGifts } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function PainelPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (firebaseEnabled && !user) {
      router.replace("/entrar?next=/painel");
      return;
    }
    void (async () => {
      const local = listLocalGifts();
      if (user) {
        try {
          const remote = await listGiftsRemote(user.uid);
          const merged = new Map<string, Gift>();
          remote.forEach((gift) => merged.set(gift.id, gift));
          local.forEach((gift) => {
            if (!merged.has(gift.id)) merged.set(gift.id, gift);
          });
          setGifts([...merged.values()]);
          return;
        } catch (error) {
          console.error(error);
        }
      }
      setGifts(local);
    })();
  }, [ready, user, router]);

  if (!ready || (firebaseEnabled && !user)) {
    return <div className="min-h-dvh bg-paper" />;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {user?.email ? (
            <button className="text-sm font-bold text-muted" onClick={() => void signOutUser()}>
              Sair
            </button>
          ) : null}
          <Link href="/criar" className="btn-primary">
            Novo recado
          </Link>
        </div>
      </div>
      <h1 className="mt-10 font-display text-4xl">Seus recados</h1>
      <p className="mt-2 text-muted">
        {user?.email ? `Logado como ${user.email}. ` : ""}
        Aqui ficam o link e o QR Code de cada presente.
      </p>
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
                {gift.paid ? "Vitalício liberado" : "Aguardando pagamento"} · {giftPath(gift.slug)}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
