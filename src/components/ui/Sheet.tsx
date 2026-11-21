import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMediaQuery, useReducedMotion } from '@/lib/hooks';

type Side = 'right' | 'bottom' | 'center';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Desktop placement. On phones 'right' and 'center' become a bottom sheet. */
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
  /** Element to focus when the sheet opens (defaults to the close button). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  eyebrow?: ReactNode;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/** Modal drawer / dialog / bottom sheet with focus trap, Esc to close and focus restore. */
export function Sheet({ open, onClose, title, side = 'right', children, footer, widthClass, initialFocusRef, eyebrow }: SheetProps) {
  const isPhone = useMediaQuery('(max-width: 639px)');
  const reduced = useReducedMotion();
  const placement: Side = isPhone ? 'bottom' : side;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => (initialFocusRef?.current ?? closeRef.current)?.focus(), 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  const variants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
    center: { initial: { opacity: 0, scale: 0.96, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 12 } },
  }[placement];

  const panelClass = {
    right: cn('fixed inset-y-0 right-0 flex w-full flex-col border-l border-line', widthClass ?? 'max-w-md'),
    bottom: 'fixed inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-line',
    center: cn(
      'fixed left-1/2 top-1/2 flex max-h-[86vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-line',
      widthClass ?? 'max-w-2xl',
    ),
  }[placement];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="presentation">
          <motion.div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
          />
          <div className={placement === 'center' ? 'pointer-events-none fixed inset-0' : undefined}>
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(panelClass, 'pointer-events-auto bg-surface shadow-lift')}
              initial={reduced ? { opacity: 0 } : variants.initial}
              animate={reduced ? { opacity: 1 } : variants.animate}
              exit={reduced ? { opacity: 0 } : variants.exit}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              {placement === 'bottom' && <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-line" aria-hidden="true" />}
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  {eyebrow && <div className="mb-1">{eyebrow}</div>}
                  <h2 id={titleId} className="text-xl font-bold leading-tight">
                    {title}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
              {footer && <div className="border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
