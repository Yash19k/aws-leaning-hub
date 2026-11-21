import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useBadgeWatcher } from '@/lib/badges';
import { Celebration } from './Celebration';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { ScrollToTopButton } from './ScrollToTop';
import { SearchDialog } from './SearchDialog';

export function PageLoader() {
  return (
    <div className="container-page py-24" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-shimmer rounded-xl bg-gradient-to-r from-surface-2 via-line to-surface-2 bg-[length:200%_100%]" />
      <div className="mt-6 h-4 w-full max-w-xl animate-shimmer rounded-lg bg-gradient-to-r from-surface-2 via-line to-surface-2 bg-[length:200%_100%]" />
      <div className="mt-3 h-4 w-2/3 max-w-md animate-shimmer rounded-lg bg-gradient-to-r from-surface-2 via-line to-surface-2 bg-[length:200%_100%]" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Scroll to the top on navigation, or to the #hash target once it renders. */
function useScrollManagement() {
  const { pathname, hash, search } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let tries = 0;
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || tries++ > 40) {
        window.clearInterval(t);
        el?.scrollIntoView({ block: 'start' });
      }
    }, 75);
    return () => window.clearInterval(t);
  }, [pathname, hash, search]);
}

export function Layout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  useBadgeWatcher();
  useScrollManagement();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <Navbar onSearch={() => setSearchOpen(true)} />
        <main id="main" className="flex-1">
          {/* CSS fade-in on route change. (A framer-motion AnimatePresence here could leave the
              new page stuck at opacity 0 when its lazy chunk was still loading.) */}
          <div key={location.pathname} className="animate-page-in">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <Footer />
        <ScrollToTopButton />
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        <Celebration />
      </div>
    </>
  );
}
