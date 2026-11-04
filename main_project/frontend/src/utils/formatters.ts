export function formatProbability(prob: number | null | undefined): string {
  if (prob === null || prob === undefined || isNaN(prob)) return '—';
  // Check if prob is already 0..100 or 0..1
  const normalized = prob > 1.0 ? prob : prob * 100;
  return `${Math.min(100, Math.max(0, normalized)).toFixed(1)}%`;
}

export function formatProbabilityDecimals(prob: number | null | undefined, decimals: number = 2): string {
  if (prob === null || prob === undefined || isNaN(prob)) return '—';
  const normalized = prob > 1.0 ? prob : prob * 100;
  return `${Math.min(100, Math.max(0, normalized)).toFixed(decimals)}%`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getPredictionClassColor(prediction: string | null | undefined): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  if (!prediction) {
    return {
      text: 'text-slate-400',
      bg: 'bg-slate-800/40',
      border: 'border-slate-700/50',
      glow: 'shadow-none',
    };
  }
  const lower = prediction.toLowerCase();
  if (lower.includes('adhd')) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    };
  }
  return {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  };
}
