import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { recordQuiz } from '@/lib/progress';

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

/** One-question check with instant feedback. `answer` is the 0-based index of the right option. */
export function Quiz({
  id,
  question,
  options,
  answer,
  explanation,
}: {
  id?: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const quizId = id ?? `q-${hash(question)}`;
  const answered = picked !== null;
  const correct = picked === answer;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    recordQuiz(quizId, i === answer);
  };

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-navy-200 bg-gradient-to-br from-navy-50 to-surface p-5 dark:border-navy-700 dark:from-navy-900/60 dark:to-surface sm:p-6">
      <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-navy-600 dark:text-navy-200">
        <Brain className="h-4 w-4" aria-hidden="true" /> Quick check
      </p>
      <p className="mt-1.5 text-[1.05rem] font-bold leading-snug text-ink">{question}</p>
      <div className="mt-4 grid gap-2" role="group" aria-label="Answers">
        {options.map((o, i) => {
          const isRight = answered && i === answer;
          const isWrongPick = answered && i === picked && !correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered && !isRight && !isWrongPick}
              aria-pressed={picked === i}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all',
                !answered && 'border-line bg-surface hover:-translate-y-0.5 hover:border-brand-400',
                isRight && 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100',
                isWrongPick && 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100',
                answered && !isRight && !isWrongPick && 'border-line bg-surface opacity-50',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold',
                  isRight ? 'bg-emerald-500 text-white' : isWrongPick ? 'bg-rose-500 text-white' : 'bg-surface-2 text-muted',
                )}
                aria-hidden="true"
              >
                {isRight ? <Check className="h-4 w-4" /> : isWrongPick ? <X className="h-4 w-4" /> : String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4" aria-live="polite">
            <p className={cn('font-bold', correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
              {correct ? 'Correct!' : 'Not quite.'}
            </p>
            {explanation && <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/85">{explanation}</p>}
            {!correct && (
              <button type="button" onClick={() => setPicked(null)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-link">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
