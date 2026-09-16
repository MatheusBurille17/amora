"use client";

import { use, useEffect, useState } from "react";
import { GiftExperience } from "@/components/GiftExperience";
import { DEMO_GIFT } from "@/lib/demo";
import { getLocalGiftBySlug } from "@/lib/store";
import type { Gift } from "@/lib/types";

export default function RecadoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [gift, setGift] = useState<Gift | null>(slug === "ensaio" ? DEMO_GIFT : null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (slug === "ensaio") return;
    const local = getLocalGiftBySlug(slug);
    if (local?.paid) {
      setGift(local);
      return;
    }
    void fetch(`/api/pages/${slug}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("missing");
        return response.json();
      })
      .then((data) => setGift(data.gift))
      .catch(() => {
        if (local) setGift(local);
        else setMissing(true);
      });
  }, [slug]);

  if (missing) {
    return (
      <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blush">Amora</p>
          <h1 className="mt-3 font-display text-4xl">Esse recado não foi encontrado.</h1>
          <p className="mt-3 text-white/70">Confere o link ou o QR Code com quem te enviou.</p>
        </div>
      </main>
    );
  }

  if (!gift) return <div className="min-h-dvh bg-ink" />;
  return <GiftExperience gift={gift} />;
}
