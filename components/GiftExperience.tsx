"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTogether, timeTogether } from "@/lib/counter";
import { QUESTIONS } from "@/lib/questions";
import type { Gift } from "@/lib/types";
import { extractYoutubeId, youtubeEmbed } from "@/lib/youtube";

type Scene =
  | { type: "cover" }
  | { type: "counter" }
  | { type: "photo"; index: number }
  | { type: "answer"; index: number }
  | { type: "letter" }
  | { type: "end" };

function buildScenes(gift: Gift): Scene[] {
  const scenes: Scene[] = [{ type: "cover" }, { type: "counter" }];
  gift.photos.forEach((_, index) => scenes.push({ type: "photo", index }));
  gift.answers
    .filter((answer) => answer.text.trim())
    .forEach((_, index) => scenes.push({ type: "answer", index }));
  if (gift.letter.trim()) scenes.push({ type: "letter" });
  scenes.push({ type: "end" });
  return scenes;
}

export function GiftExperience({
  gift,
  preview = false,
}: {
  gift: Gift;
  preview?: boolean;
}) {
  const scenes = useMemo(() => buildScenes(gift), [gift]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const youtubeId = extractYoutubeId(gift.youtubeUrl);
  const scene = scenes[index] ?? { type: "cover" as const };
  const time = now ? timeTogether(gift.startDate, now) : null;
  const filledAnswers = gift.answers.filter((answer) => answer.text.trim());

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!playing || scene.type === "cover") return;
    const timer = window.setTimeout(() => {
      setIndex((current) => Math.min(current + 1, scenes.length - 1));
    }, scene.type === "letter" ? 9000 : 5200);
    return () => window.clearTimeout(timer);
  }, [index, playing, scene.type, scenes.length]);

  function openGift() {
    setPlaying(true);
    setIndex(1);
  }

  function next() {
    if (scene.type === "cover") {
      openGift();
      return;
    }
    setIndex((current) => Math.min(current + 1, scenes.length - 1));
  }

  function prev() {
    setIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-hidden bg-ink text-white">
      {playing && youtubeId ? (
        <iframe
          title="Música do recado"
          className="pointer-events-none absolute -left-[1px] -top-[1px] h-px w-px opacity-0"
          src={youtubeEmbed(youtubeId)}
          allow="autoplay; encrypted-media"
        />
      ) : null}

      <div className="pointer-events-none absolute left-4 right-4 top-4 z-30 flex gap-1">
        {scenes.map((_, sceneIndex) => (
          <span
            key={sceneIndex}
            className={`h-1 flex-1 rounded-full ${sceneIndex <= index ? "bg-white" : "bg-white/25"}`}
          />
        ))}
      </div>

      {scene.type === "cover" ? (
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={openGift}
          aria-label="Abrir recado"
        />
      ) : (
        <>
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-20 w-1/3 cursor-pointer"
            onClick={prev}
            aria-label="Anterior"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-20 w-2/3 cursor-pointer"
            onClick={next}
            aria-label="Próximo"
          />
        </>
      )}

      {scene.type === "photo" ? (
        <img
          src={gift.photos[scene.index]?.src}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      <div className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-end px-6 pb-12 pt-16">
        {preview ? (
          <p className="absolute left-6 top-10 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide">
            PRÉVIA
          </p>
        ) : null}

        {scene.type === "cover" ? (
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.28em] text-blush">Recado Amora</p>
            <h1 className="font-display text-5xl leading-none">
              Ei, {gift.recipientName || "amor"}.
            </h1>
            <p className="max-w-xs text-lg text-white/80">
              {gift.authorName || "Alguém"} deixou um recado só pra você. Toque para abrir.
            </p>
            <span className="btn-primary pointer-events-none w-fit bg-white text-berry">
              Abrir recado
            </span>
          </div>
        ) : null}

        {scene.type === "counter" ? (
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-blush">Juntos</p>
            <h2 className="font-display text-4xl leading-tight">
              {gift.authorName} & {gift.recipientName}
            </h2>
            {time ? (
              <>
                <p className="text-xl text-white/85">{formatTogether(time)}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    [time.days, "dias neste mês"],
                    [time.hours, "horas"],
                    [time.minutes, "min"],
                  ].map(([value, label]) => (
                    <div key={String(label)} className="rounded-2xl bg-white/10 px-2 py-3">
                      <div className="font-display text-2xl">{value}</div>
                      <div className="text-[11px] uppercase tracking-wide text-white/70">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/70">{time.totalDays} dias desde o primeiro sim.</p>
              </>
            ) : (
              <p>A história de vocês, em tempo real.</p>
            )}
          </div>
        ) : null}

        {scene.type === "photo" ? (
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-blush">
              Foto {scene.index + 1} de {gift.photos.length}
            </p>
            <p className="font-display text-3xl leading-tight">
              {gift.photos[scene.index]?.caption || "Um frame da história de vocês."}
            </p>
          </div>
        ) : null}

        {scene.type === "answer" ? (
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-blush">
              {QUESTIONS.find((item) => item.id === filledAnswers[scene.index]?.id)?.title}
            </p>
            <h2 className="font-display text-3xl leading-tight">
              {QUESTIONS.find((item) => item.id === filledAnswers[scene.index]?.id)?.prompt}
            </h2>
            <p className="text-lg leading-relaxed text-white/85">
              {filledAnswers[scene.index]?.text}
            </p>
          </div>
        ) : null}

        {scene.type === "letter" ? (
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-blush">O recado</p>
            <p className="font-display text-2xl leading-snug text-white/95">{gift.letter}</p>
            <p className="text-sm text-white/70">— {gift.authorName}</p>
          </div>
        ) : null}

        {scene.type === "end" ? (
          <div className="space-y-4">
            <h2 className="font-display text-4xl">Eu te escolho de novo.</h2>
            <p className="text-white/80">
              {gift.authorName} & {gift.recipientName}
              {time ? ` · ${time.totalDays} dias` : ""}
            </p>
            <p className="text-sm text-white/60">Este recado fica no ar para sempre.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
