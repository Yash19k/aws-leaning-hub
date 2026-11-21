import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';
import { SITE } from '@/lib/site';
import { useTheme } from '@/lib/theme';
import { ProgressMenu, ProgressSummary } from './ProgressMenu';

const LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/setup', label: 'Setup' },
  { to: '/services', label: 'Services' },
  { to: '/faq', label: 'FAQ' },
  { to: '/troubleshooting', label: 'Troubleshooting' },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5', className)} aria-label={`${SITE.name} home`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 shadow-soft transition-transform group-hover:-rotate-6 dark:bg-navy-800">
        <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
          <path d="M18 38c8 6 20 6 28 0" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round" />
          <path d="M42 34l5 4-6 2" fill="none" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="24" r="5" fill="#34C8B6" />
          <circle cx="42" cy="24" r="5" fill="#FFFFFF" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[1.05rem] font-extrabold tracking-tight text-ink">
          AWS <span className="text-brand-600 dark:text-brand-400">Learning</span> Hub
        </span>
        <span className="hidden text-2xs font-semibold text-muted sm:block">{SITE.clubName}</span>
      </span>
    </Link>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-surface-2"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Navbar({ onSearch }: { onSearch: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        scrolled || mobileOpen ? 'border-line bg-surface/90 backdrop-blur-lg' : 'border-transparent bg-bg/0',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-3 focus:py-2 focus:font-bold focus:text-navy-950">
        Skip to content
      </a>
      <nav className="container-page flex h-16 items-center gap-2" aria-label="Main">
        <Logo />
        <ul className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-xl px-3 py-2 text-[0.92rem] font-bold transition-colors',
                    isActive ? 'text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-brand-500" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-brand-400 hover:text-ink"
            aria-label="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Search</span>
            <Kbd className="hidden md:inline-flex">Ctrl K</Kbd>
          </button>
          <div className="hidden sm:block">
            <ProgressMenu />
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-surface-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100dvh - 4rem)' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-y-auto border-t border-line bg-surface lg:hidden"
          >
            <div className="container-page py-4">
              <ul className="space-y-1">
                {[{ to: '/', label: 'Home' }, ...LINKS].map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        cn('block rounded-xl px-4 py-3 text-lg font-bold', isActive ? 'bg-brand-50 text-ink dark:bg-brand-900/25' : 'text-ink hover:bg-surface-2')
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-line p-4">
                <p className="mb-3 font-bold">Your progress</p>
                <ProgressSummary onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
