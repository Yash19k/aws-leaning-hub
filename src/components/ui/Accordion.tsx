import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks';

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
  className?: string;
  id?: string;
}

export function AccordionItem({ title, children, defaultOpen, open, onOpenChange, icon, className, id }: AccordionItemProps) {
  const [inner, setInner] = useState(!!defaultOpen);
  const isOpen = open ?? inner;
  const uid = useId();
  const reduced = useReducedMotion();
  const toggle = () => {
    onOpenChange?.(!isOpen);
    if (open === undefined) setInner(!isOpen);
  };

  return (
    <div id={id} className={cn('border-b border-line last:border-b-0', className)}>
      <h3 className="m-0 text-base">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={`${uid}-panel`}
          className="flex w-full items-center gap-3 py-4 text-left font-bold text-ink transition-colors hover:text-brand-700 dark:hover:text-brand-300"
        >
          {icon && <span className="shrink-0 text-brand-600 dark:text-brand-400">{icon}</span>}
          <span className="flex-1 leading-snug">{title}</span>
          <ChevronDown
            className={cn('h-5 w-5 shrink-0 text-muted transition-transform duration-200', isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${uid}-panel`}
            role="region"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-2 text-[0.97rem] leading-relaxed text-ink/85">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card-base px-5 sm:px-6', className)}>{children}</div>;
}
