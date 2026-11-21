import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { projects } from '@/lib/content';
import { useReducedMotion } from '@/lib/hooks';
import { usePageMeta } from '@/lib/meta';

export default function NotFound() {
  usePageMeta('Page not found');
  const reduced = useReducedMotion();
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <motion.div
        initial={reduced ? false : { rotate: -20, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-brand-500 text-navy-950 shadow-glow"
      >
        <Compass className="h-12 w-12" aria-hidden="true" />
      </motion.div>
      <p className="mt-8 font-mono text-sm font-bold text-muted">HTTP 404 · NoSuchKey</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">This page took a wrong turn</h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        Even S3 can't find an object that was never uploaded. Try one of these instead:
      </p>
      <div className="mt-8 grid w-full max-w-xl gap-3 text-left">
        {projects.map((p) => (
          <Link key={p.slug} to={`/projects/${p.slug}`} className="group flex items-center justify-between rounded-2xl border-2 border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand-400">
            <span>
              <span className="block font-bold">{p.title.split(':')[0]}</span>
              <span className="block text-sm text-muted">{p.tagline}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <ButtonLink to="/" className="mt-8" variant="outline">Back to home</ButtonLink>
    </div>
  );
}
