"use client";

import { useMemo, useState } from "react";

type PhraseSuggestionsProps = {
  suggestions: string[];
  value: string;
  onPick: (phrase: string) => void;
  compact?: boolean;
  seed?: number;
};

export function PhraseSuggestions({
  suggestions,
  value,
  onPick,
  compact = false,
  seed = 0,
}: PhraseSuggestionsProps) {
  const count = compact ? 1 : 3;
  const [start, setStart] = useState(() => (suggestions.length ? seed % suggestions.length : 0));

  const visible = useMemo(() => {
    if (!suggestions.length) return [];
    const size = Math.min(count, suggestions.length);
    return Array.from({ length: size }, (_, index) => suggestions[(start + index) % suggestions.length]);
  }, [suggestions, start, count]);

  if (!visible.length) return null;

  function next() {
    setStart((current) => (current + count) % suggestions.length);
  }

  if (compact) {
    const phrase = visible[0];
    const active = value.trim() === phrase.trim();
    return (
      <div className="bg-blush/50 px-3 py-2">
        <p className="text-[10px] font-extrabold tracking-wide text-berry uppercase">Sugestão</p>
        <div className="mt-1 flex items-start gap-2">
          <button
            type="button"
            className="flex-1 text-left text-xs leading-snug font-semibold text-ink"
            aria-pressed={active}
            onClick={() => onPick(phrase)}
          >
            {phrase}
          </button>
          {suggestions.length > 1 ? (
            <button type="button" className="shrink-0 text-xs font-extrabold text-berry" onClick={next}>
              Outra
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-berry">Sugestões</p>
        {suggestions.length > count ? (
          <button type="button" className="text-sm font-bold text-muted" onClick={next}>
            Outras ideias
          </button>
        ) : null}
      </div>
      <div className="space-y-2">
        {visible.map((phrase) => {
          const active = value.trim() === phrase.trim();
          return (
            <button
              key={phrase}
              type="button"
              aria-pressed={active}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm leading-snug ${
                active ? "border-berry bg-blush font-semibold" : "border-transparent bg-white"
              }`}
              onClick={() => onPick(phrase)}
            >
              {phrase}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">Toque para usar. Dá para editar depois.</p>
    </div>
  );
}
