import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { projects } from '@/lib/content';
import { SITE } from '@/lib/site';
import { Logo } from './Navbar';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Learn AWS by exploring real projects. Built by students, for students, at the {SITE.clubName}.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">Projects</p>
          <ul className="space-y-2 text-sm">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link to={`/projects/${p.slug}`} className="text-muted hover:text-ink">
                  {p.title.split(':')[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">Learn</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/setup" className="text-muted hover:text-ink">Set up AWS</Link></li>
            <li><Link to="/services" className="text-muted hover:text-ink">Service library</Link></li>
            <li><Link to="/faq" className="text-muted hover:text-ink">FAQ</Link></li>
            <li><Link to="/troubleshooting" className="text-muted hover:text-ink">Troubleshooting</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">This site</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/how-this-site-works" className="text-muted hover:text-ink">How it runs on AWS</Link></li>
            <li><Link to="/progress" className="text-muted hover:text-ink">Your badges</Link></li>
            <li>
              <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                <Github className="h-4 w-4" aria-hidden="true" /> Source on GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-muted">
          {SITE.clubName}. Not affiliated with or endorsed by Amazon Web Services. AWS and related marks are trademarks of Amazon.com, Inc.
        </p>
      </div>
    </footer>
  );
}
