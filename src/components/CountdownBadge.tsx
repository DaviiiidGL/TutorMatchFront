import { useCountdown } from '../hooks/useCountdown';

interface CountdownBadgeProps {
  expiresAt: string;
  onExpired?: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CountdownBadge({ expiresAt, onExpired }: CountdownBadgeProps) {
  const secondsLeft = useCountdown(expiresAt);

  // Notificar al padre cuando expira
  const [notified, setNotified] = useState(false);
  if (secondsLeft === 0 && !notified) {
    setNotified(true);
    onExpired?.();
  }

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;

  const isUrgent = secondsLeft > 0 && secondsLeft < 300; // menos de 5 min
  const isExpired = secondsLeft === 0;

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
        ⏰ Expirado
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors ${
        isUrgent
          ? 'border-orange-500/40 bg-orange-500/10 text-orange-400 animate-pulse'
          : 'border-white/10 bg-white/5 text-white/60'
      }`}
    >
      ⏱ {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
    </span>
  );
}

import { useState } from 'react';
export default CountdownBadge;