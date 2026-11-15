import type { ReactNode } from 'react';

/* Shared primitives — the component layer of the design system. */

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[10px] bg-ink-800 ring-1 ring-line"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" fill="none">
        <path d="M36.5 6 L16 38.2 h11.6 L25.4 58 L48 25.4 H35.8 Z" fill="#cff94d" />
      </svg>
    </span>
  );
}

export function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-card border border-line bg-ink-850/90 shadow-card backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-volt-400">
        {eyebrow}
      </p>
      <h2 className="mt-2.5 font-display text-[28px] font-semibold leading-tight tracking-tight text-mist-100 sm:text-[32px]">
        {title}
      </h2>
      {copy && <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{copy}</p>}
    </div>
  );
}

type PillTone = 'volt' | 'rose' | 'pulse' | 'neutral';

const pillTones: Record<PillTone, string> = {
  volt: 'bg-volt-400/10 text-volt-300 ring-volt-400/25',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-400/25',
  pulse: 'bg-pulse-400/10 text-pulse-300 ring-pulse-400/25',
  neutral: 'bg-white/[0.04] text-mist-300 ring-line',
};

export function Pill({
  tone = 'neutral',
  children,
  dot = false,
}: {
  tone?: PillTone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${pillTones[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function LiveDot({ className = '' }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-volt-400" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-volt-400" />
    </span>
  );
}

/** Small label used above stats and form fields. */
export function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
      {children}
    </p>
  );
}
