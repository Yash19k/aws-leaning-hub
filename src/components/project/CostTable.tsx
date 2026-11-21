import { inline } from '@/lib/markdown';
import type { CostLine } from '@/lib/types';

function Cell({ text }: { text: string }) {
  return <span>{inline(text)}</span>;
}

export function CostTable({ lines }: { lines: CostLine[] }) {
  return (
    <div className="card-base overflow-hidden">
      {/* Desktop table */}
      <table className="hidden w-full text-left text-[0.95rem] sm:table">
        <thead className="bg-surface-2 text-sm">
          <tr>
            <th scope="col" className="px-5 py-3 font-bold">Service</th>
            <th scope="col" className="px-5 py-3 font-bold">Free Tier covers</th>
            <th scope="col" className="px-5 py-3 font-bold">Beyond the Free Tier</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.service} className="border-t border-line align-top">
              <th scope="row" className="px-5 py-3.5 font-bold">{l.service}</th>
              <td className="px-5 py-3.5 text-ink/85"><Cell text={l.freeTierCovers} /></td>
              <td className="px-5 py-3.5 text-ink/85"><Cell text={l.beyondFreeTier} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Phone cards */}
      <ul className="divide-y divide-line sm:hidden">
        {lines.map((l) => (
          <li key={l.service} className="p-4">
            <p className="font-bold">{l.service}</p>
            <p className="mt-2 text-2xs font-bold uppercase tracking-wider text-muted">Free Tier covers</p>
            <p className="text-sm text-ink/85"><Cell text={l.freeTierCovers} /></p>
            <p className="mt-2 text-2xs font-bold uppercase tracking-wider text-muted">Beyond</p>
            <p className="text-sm text-ink/85"><Cell text={l.beyondFreeTier} /></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
