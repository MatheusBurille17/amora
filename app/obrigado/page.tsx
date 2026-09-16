"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { loadDraft, saveDraft, upsertLocalGift } from "@/lib/store";

function ThanksBody() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const draft = loadDraft();
    if (!draft.authorName) return;
    const published = {
      ...draft,
      paid: true,
      status: "published" as const,
      publishedAt: new Date().toISOString(),
    };
    saveDraft(published);
    upsertLocalGift(published);
    const timeout = window.setTimeout(() => {
      router.replace(`/painel/${published.id}`);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [router, params]);

  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Logo />
        <h1 className="mt-8 font-display text-4xl">Pagamento certo. Gerando seu QR...</h1>
        <p className="mt-3 text-muted">Se não redirecionar, abre o painel.</p>
        <Link href="/painel" className="btn-primary mt-6 inline-flex">
          Ir para o painel
        </Link>
      </div>
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense>
      <ThanksBody />
    </Suspense>
  );
}
