"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Logo } from "@/components/Logo";
import { giftUrl } from "@/lib/slug";
import type { Gift } from "@/lib/types";

export function QrPanel({ gift, origin }: { gift: Gift; origin: string }) {
  const url = giftUrl(gift.slug, origin);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    void QRCode.toDataURL(url, {
      margin: 1,
      width: 640,
      color: { dark: "#1b1014", light: "#fff6f0" },
    }).then(setDataUrl);
  }, [url]);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Tem um recado meu pra você: ${url}`)}`;

  return (
    <section className="soft-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between">
        <Logo compact />
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-berry">QR do recado</span>
      </div>
      <p className="mt-4 font-display text-3xl">
        {gift.authorName} → {gift.recipientName}
      </p>
      {dataUrl ? (
        <img src={dataUrl} alt="QR Code do recado" className="mx-auto my-6 w-56 rounded-3xl bg-paper p-3" />
      ) : (
        <div className="mx-auto my-6 h-56 w-56 animate-pulse rounded-3xl bg-blush" />
      )}
      <p className="break-all text-center text-sm text-muted">{url}</p>
      <div className="mt-5 grid gap-3">
        <a className="btn-primary" href={url} target="_blank" rel="noreferrer">
          Abrir o recado
        </a>
        <a className="rounded-full border px-5 py-3 text-center font-extrabold" href={whatsapp} target="_blank" rel="noreferrer">
          Mandar no WhatsApp
        </a>
        <button
          className="rounded-full border px-5 py-3 font-extrabold"
          onClick={() => void navigator.clipboard.writeText(url)}
        >
          Copiar link
        </button>
        {dataUrl ? (
          <a className="rounded-full border px-5 py-3 text-center font-extrabold" href={dataUrl} download={`amora-${gift.slug}.png`}>
            Baixar QR Code
          </a>
        ) : null}
        <Link className="text-center text-sm font-bold text-berry" href={`/criar?editar=${gift.id}`}>
          Editar recado
        </Link>
      </div>
    </section>
  );
}
