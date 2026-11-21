import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-navy-950 shadow-[0_2px_0_0_#B45F06] hover:bg-brand-400 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#B45F06]',
  secondary:
    'bg-navy-900 text-white shadow-[0_2px_0_0_#090F1C] hover:bg-navy-800 hover:-translate-y-0.5 dark:bg-navy-100 dark:text-navy-950 dark:shadow-[0_2px_0_0_#7F98C6] dark:hover:bg-white',
  accent:
    'bg-teal-500 text-navy-950 shadow-[0_2px_0_0_#0D7169] hover:bg-teal-400 hover:-translate-y-0.5',
  outline: 'border-2 border-line bg-surface text-ink hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 min-h-[3.25rem] px-7 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
});

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
}

/** Internal navigation styled as a button. */
export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

interface ExternalButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** External link styled as a button (opens in a new tab). */
export function ExternalButton({ href, variant = 'outline', size = 'md', icon, iconRight, className, children }: ExternalButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, variants[variant], sizes[size], className)}>
      {icon}
      {children}
      {iconRight}
    </a>
  );
}
