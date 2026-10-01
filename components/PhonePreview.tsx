"use client";

import { useEffect, useState } from "react";
import { timeTogether } from "@/lib/counter";

export function PhonePreview() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const time = timeTogether("2022-03-12", now ?? new Date("2022-03-12T12:00:00"));

  return (
    <div className="relative mx-auto w-[280px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-white/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2.4rem] border-[10px] border-black bg-black shadow-[0_40px_80px_rgba(0,0,0,.35)]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div
          className="relative h-[540px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
          <div className="absolute left-4 right-4 top-8 flex gap-1">
            <span className="h-1 flex-1 rounded-full bg-white" />
            <span className="h-1 flex-1 rounded-full bg-white" />
            <span className="h-1 flex-1 rounded-full bg-white/30" />
            <span className="h-1 flex-1 rounded-full bg-white/30" />
          </div>
          <div className="absolute bottom-0 p-5 text-white">
            <p className="mb-3 w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide">
              Toque para abrir
            </p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-blush">Juntos</p>
            <h3 className="font-display text-3xl">Léo & Maya</h3>
            <p className="mt-1 text-sm text-white/80">
              {time ? `${time.years} anos, ${time.months} meses, ${time.days} dias` : "a história de vocês"}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-white/12 py-2">
                <div className="font-display text-lg">{time?.hours ?? 0}</div>
                horas
              </div>
              <div className="rounded-2xl bg-white/12 py-2">
                <div className="font-display text-lg">{time?.minutes ?? 0}</div>
                min
              </div>
              <div className="rounded-2xl bg-white/12 py-2">
                <div className="font-display text-lg">{time?.seconds ?? 0}</div>
                seg
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
