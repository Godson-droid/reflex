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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${pillTones[tone]}`}
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

/* ---------- Inline stroke icons (drawn in house, 24px grid) ---------- */

function StrokeIcon({
  children,
  size = 16,
  className = '',
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconBolt({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="M13 2.5 4.8 13.5h6L9.6 21.5 19.2 10h-6.2l1-7.5Z" />
    </StrokeIcon>
  );
}

export function IconShield({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.4 7 9.3 4.1-1.9 7-5 7-9.3V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.8-4" />
    </StrokeIcon>
  );
}

export function IconTrendDown({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="m3 6.5 6.2 6.2 3.3-3.2 6 6" />
      <path d="M21 10v5.5h-5.5" />
    </StrokeIcon>
  );
}

export function IconTrendUp({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="m3 17.5 6.2-6.2 3.3 3.2 6-6" />
      <path d="M21 14V8.5h-5.5" />
    </StrokeIcon>
  );
}

export function IconGauge({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="M4.5 15.5a8 8 0 1 1 15 0" />
      <path d="m12 15 3.8-4.2" />
      <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <path d="M3 19.5h18" />
    </StrokeIcon>
  );
}

export function IconActivity({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="M2.5 12h4l2.5-6.5 4 12 2.5-5.5h6" />
    </StrokeIcon>
  );
}

export function IconStack({ size = 16 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z" />
      <path d="m3.6 12.7 8.4 4.5 8.4-4.5" />
    </StrokeIcon>
  );
}

export function IconExternal({ size = 12 }: { size?: number }) {
  return (
    <StrokeIcon size={size}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M20 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1.5-1.5H10" />
    </StrokeIcon>
  );
}

/* ---------- KPI card (Viola style stat discipline, glass surface) ---------- */

type KpiAccent = 'volt' | 'rose' | 'pulse' | 'neutral';

const kpiAccents: Record<KpiAccent, { chip: string; rule: string }> = {
  volt: {
    chip: 'bg-volt-400/10 text-volt-300 ring-volt-400/25',
    rule: 'via-volt-400/50',
  },
  rose: {
    chip: 'bg-rose-500/10 text-rose-300 ring-rose-400/25',
    rule: 'via-rose-400/50',
  },
  pulse: {
    chip: 'bg-pulse-400/10 text-pulse-300 ring-pulse-400/25',
    rule: 'via-pulse-400/50',
  },
  neutral: {
    chip: 'bg-white/[0.04] text-mist-300 ring-line',
    rule: 'via-white/25',
  },
};

export function KpiCard({
  icon,
  label,
  badge,
  accent = 'volt',
  glow = false,
  className = '',
  children,
  sub,
}: {
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
  accent?: KpiAccent;
  glow?: boolean;
  className?: string;
  children: ReactNode;
  sub?: ReactNode;
}) {
  const a = kpiAccents[accent];
  return (
    <div
      className={`glass-surface relative overflow-hidden rounded-panel border border-line px-5 py-4 shadow-card ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${a.rule} to-transparent`}
      />
      {glow && (
        <span
          aria-hidden
          className="counter-glow pointer-events-none absolute -left-8 -top-12 h-32 w-48 rounded-full"
        />
      )}
      <div className="relative flex items-center gap-2">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ring-1 ${a.chip}`}>
          {icon}
        </span>
        <p className="min-w-0 flex-1 text-[11px] font-semibold uppercase leading-snug tracking-[0.16em] text-mist-500">
          {label}
        </p>
        {badge}
      </div>
      <div className="relative mt-3">{children}</div>
      {sub && <p className="relative mt-1.5 text-[12px] leading-snug text-mist-500">{sub}</p>}
    </div>
  );
}
