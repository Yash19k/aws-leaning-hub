import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  text,
  label = 'Copy',
  className,
  tone = 'dark',
}: {
  text: string;
  label?: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    window.setTimeout(() => setState('idle'), 1600);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors',
        tone === 'dark'
          ? 'bg-white/10 text-white/90 hover:bg-white/20'
          : 'border border-line bg-surface text-ink hover:border-brand-400',
        state === 'copied' && (tone === 'dark' ? 'bg-teal-500/30 text-teal-100' : 'border-teal-400 text-teal-700'),
        className,
      )}
      aria-label={state === 'copied' ? 'Copied' : `${label} to clipboard`}
    >
      {state === 'copied' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : label}</span>
    </button>
  );
}
