"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { getGiftRemote } from "@/lib/firebase/gifts";
import { loadDraft, upsertLocalGift } from "@/lib/store";

function ThanksBody() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const pending = params.get("pending") === "1";
  const [status, setStatus] = useState(pending ? "pending" : "confirming");

  useEffect(() => {
    if (!ready) return;
    const draft = loadDraft();
    let stopped = false;
    let attempts = 0;

    async function check() {
      attempts += 1;
      if (user && draft.id) {
        try {
          const remote = await getGiftRemote(draft.id);
          if (stopped) return;
          if (remote?.paid) {
            upsertLocalGift(remote);
            setStatus("paid");
            router.replace(`/painel/${remote.id}`);
            return;
          }
        } catch {
          /* webhook ainda não chegou */
        }
      }
      if (attempts >= 12) {
        setStatus(pending ? "pending" : "wait");
        return;
      }
      window.setTimeout(() => {
        if (!stopped) void check();
      }, 2000);
    }

    void check();
    return () => {
      stopped = true;
    };
  }, [ready, user, router, pending]);

  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Logo />
        <h1 className="mt-8 font-display text-4xl">
          {status === "paid"
            ? "Pagamento certo. Gerando seu QR..."
            : status === "pending"
              ? "Pagamento em análise."
              : "Confirmando seu pagamento..."}
        </h1>
        <p className="mt-3 text-muted">
          {status === "pending"
            ? "Quando o Pix confirmar, o QR entra no painel."
            : "O recado só libera depois que o Mercado Pago confirmar. Não fecha essa aba."}
        </p>
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
