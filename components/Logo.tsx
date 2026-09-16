export function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const color = light ? "text-white" : "text-berry";
  return (
    <span className={`inline-flex items-center gap-2 ${color}`}>
      <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
        <path
          d="M20 34c-8-5.4-14-11.2-14-18A8 8 0 0 1 20 9.2 8 8 0 0 1 34 16c0 6.8-6 12.6-14 18Z"
          fill="currentColor"
        />
        <path d="M26 8c2.4-3 5.8-3.6 8-1.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="16.5" cy="16.5" r="2" fill="#fff6f0" />
      </svg>
      {compact ? null : (
        <span className="font-display text-2xl font-semibold tracking-tight">Amora</span>
      )}
    </span>
  );
}
