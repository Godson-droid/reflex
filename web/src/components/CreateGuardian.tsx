import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { chain, type Guardian, type MarketData } from '../lib/chain';
import { fmtNum, fmtUsd } from '../lib/format';
import { Card, MicroLabel } from './ui';
import { Spinner } from './Nav';

type SubmitState = 'idle' | 'arming' | 'armed';

const MOCK_BALANCE = 10; // WETH available in the connected demo wallet

export function CreateGuardian({
  market,
  onArmed,
  onPreview,
}: {
  market: MarketData;
  onArmed: (guardian: Guardian) => void;
  onPreview: (stopLoss?: number, takeProfit?: number) => void;
}) {
  const price = market.price;
  const [stopLoss, setStopLoss] = useState(() => (Math.round(price * 0.92 * 100) / 100).toString());
  const [takeProfit, setTakeProfit] = useState(() => (Math.round(price * 1.18 * 100) / 100).toString());
  const [amount, setAmount] = useState('1.00');
  const [touched, setTouched] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>('idle');

  const sl = parseFloat(stopLoss);
  const tp = parseFloat(takeProfit);
  const amt = parseFloat(amount);

  const errors = useMemo(() => {
    const e: { sl?: string; tp?: string; amt?: string } = {};
    if (!stopLoss || Number.isNaN(sl) || sl <= 0) e.sl = 'Enter a stop-loss price.';
    else if (sl >= price) e.sl = `Stop-loss must sit below the current price (${fmtUsd(price)}).`;
    if (!takeProfit || Number.isNaN(tp) || tp <= 0) e.tp = 'Enter a take-profit price.';
    else if (tp <= price) e.tp = `Take-profit must sit above the current price (${fmtUsd(price)}).`;
    if (!Number.isNaN(sl) && !Number.isNaN(tp) && sl > 0 && tp > 0 && sl >= tp)
      e.tp = 'Take-profit must be above the stop-loss.';
    if (!amount || Number.isNaN(amt) || amt <= 0) e.amt = 'Enter an amount to protect.';
    else if (amt > MOCK_BALANCE) e.amt = `Amount exceeds your balance of ${fmtNum(MOCK_BALANCE)} WETH.`;
    return e;
  }, [stopLoss, takeProfit, amount, sl, tp, amt, price]);

  const valid = Object.keys(errors).length === 0;

  const syncPreview = (nextSl: string, nextTp: string) => {
    const s = parseFloat(nextSl);
    const t = parseFloat(nextTp);
    onPreview(
      !Number.isNaN(s) && s > 0 && s < price ? s : undefined,
      !Number.isNaN(t) && t > price ? t : undefined,
    );
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!valid || submit !== 'idle') return;
    setSubmit('arming');
    const guardian = await chain.createGuardian({ stopLoss: sl, takeProfit: tp, amount: amt });
    onArmed(guardian);
    setSubmit('armed');
    window.setTimeout(() => setSubmit('idle'), 3200);
  };

  const fieldError = (key: 'sl' | 'tp' | 'amt') => (touched ? errors[key] : undefined);

  // Publish the default thresholds to the chart guides on first render.
  useEffect(() => {
    syncPreview(stopLoss, takeProfit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="flex flex-col p-6 sm:p-7" id="create">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[19px] font-semibold tracking-tight text-mist-100">
          Create a guardian
        </h3>
        <span className="rounded-full bg-pulse-400/10 px-2.5 py-1 text-[11px] font-semibold text-pulse-300 ring-1 ring-pulse-400/25">
          Reactive Lasna
        </span>
      </div>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist-400">
        Set the two prices that matter. Reflex watches them from inside the contract — around the
        clock, with nobody's server in between.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          label="Stop-loss price"
          hint="Sell everything if WETH falls to"
          error={fieldError('sl')}
          accent="rose"
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500">$</span>
            <input
              className={`field-input pl-8 ${fieldError('sl') ? 'field-input-error' : ''}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={stopLoss}
              onChange={(e) => {
                setStopLoss(e.target.value);
                syncPreview(e.target.value, takeProfit);
              }}
              aria-label="Stop-loss price in USD"
            />
          </div>
        </Field>

        <Field
          label="Take-profit price"
          hint="Sell everything if WETH climbs to"
          error={fieldError('tp')}
          accent="volt"
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500">$</span>
            <input
              className={`field-input pl-8 ${fieldError('tp') ? 'field-input-error' : ''}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={takeProfit}
              onChange={(e) => {
                setTakeProfit(e.target.value);
                syncPreview(stopLoss, e.target.value);
              }}
              aria-label="Take-profit price in USD"
            />
          </div>
        </Field>

        <Field
          label="Amount to protect"
          hint={`Balance ${fmtNum(MOCK_BALANCE)} WETH · Base Sepolia`}
          error={fieldError('amt')}
          accent="neutral"
        >
          <div className="relative">
            <input
              className={`field-input pr-16 ${fieldError('amt') ? 'field-input-error' : ''}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount of WETH to protect"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-mist-400">
              WETH
            </span>
          </div>
        </Field>
      </div>

      {/* Plain-English summary — updates live as the form changes */}
      <div className="mt-5 rounded-panel border border-line bg-ink-900 px-4 py-3.5">
        <MicroLabel>What happens next</MicroLabel>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist-200" aria-live="polite">
          {valid ? (
            <>
              If WETH falls to <strong className="tnum font-semibold text-rose-300">{fmtUsd(sl)}</strong>,
              Reflex sells my <strong className="tnum font-semibold text-mist-100">{fmtNum(amt)} WETH</strong>{' '}
              automatically. If it climbs to{' '}
              <strong className="tnum font-semibold text-volt-300">{fmtUsd(tp)}</strong>, Reflex takes
              profit instead. No keeper, no bot — the contract itself reacts.
            </>
          ) : (
            'Fix the highlighted fields and Reflex will spell out exactly what your guardian will do.'
          )}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submit === 'arming' || (touched && !valid)}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition-all duration-200 active:scale-[0.99] ${
          submit === 'armed'
            ? 'bg-pulse-400 text-ink-950'
            : 'bg-volt-400 text-ink-950 shadow-glow hover:bg-volt-300'
        } disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none`}
      >
        {submit === 'arming' && (
          <>
            <Spinner /> Arming guardian…
          </>
        )}
        {submit === 'armed' && '✓ Guardian armed — now watching'}
        {submit === 'idle' && 'Arm guardian'}
      </button>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-mist-500">
        Arming registers your thresholds with the Reflex contract on Lasna.
        <br />
        It can react in ~1 block. It never sleeps, and neither do the markets.
      </p>
    </Card>
  );
}

function Field({
  label,
  hint,
  error,
  accent,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  accent: 'rose' | 'volt' | 'neutral';
  children: ReactNode;
}) {
  const dot =
    accent === 'rose' ? 'bg-rose-400' : accent === 'volt' ? 'bg-volt-400' : 'bg-mist-500';
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-mist-200">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
          {label}
        </label>
        <span className="text-[11.5px] text-mist-500">{hint}</span>
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-[12px] font-medium text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
