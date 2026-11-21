import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, House } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <li>
          <Link to="/" className="flex items-center rounded-md p-1 hover:text-ink" aria-label="Home">
            <House className="h-4 w-4" aria-hidden="true" />
          </Link>
        </li>
        {items.map((c, i) => (
          <Fragment key={i}>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              {c.to && i < items.length - 1 ? (
                <Link to={c.to} className="rounded-md px-1 py-0.5 font-semibold hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="px-1 font-semibold text-ink">
                  {c.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
