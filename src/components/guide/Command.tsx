import { Children, isValidElement, type ReactNode } from 'react';
import { Terminal } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { cn } from '@/lib/cn';
import { setPreferredOS, usePreferredOS, type OS } from '@/lib/progress';

const OS_LABEL: Record<OS, string> = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
const SHELL_LABEL: Record<OS | 'all', string> = { windows: 'PowerShell', mac: 'Terminal', linux: 'Terminal', all: 'Terminal' };

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return Children.toArray(node).map(textOf).join('');
}

interface CommandProps {
  /** Same command on every OS. You can also pass it as children. */
  code?: string;
  windows?: string;
  mac?: string;
  linux?: string;
  /** Label a single command as OS-specific ("windows" | "mac" | "linux" | "all"). */
  os?: OS | 'all';
  /** Expected output, shown under the command. */
  output?: string;
  title?: string;
  children?: ReactNode;
}

function Block({ code, shell, output }: { code: string; shell: string; output?: string }) {
  const lines = code.trim().split('\n');
  const prompt = shell === 'PowerShell' ? 'PS>' : '$';
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-white/70">
          <Terminal className="h-4 w-4 text-teal-400" aria-hidden="true" />
          {shell}
        </span>
        <CopyButton text={code.trim()} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.8125rem] leading-6 text-[#DCE4F2] sm:text-sm" tabIndex={0}>
        {lines.map((l, i) => {
          const isComment = /^\s*#/.test(l);
          const continued = i > 0 && /[\\`^]\s*$/.test(lines[i - 1]);
          return (
            <div key={i} className="whitespace-pre">
              <span className="mr-3 select-none text-teal-400/70" aria-hidden="true">
                {isComment || continued ? ' '.repeat(prompt.length) : prompt}
              </span>
              <span className={isComment ? 'text-white/45' : undefined}>{l}</span>
            </div>
          );
        })}
      </pre>
      {output && (
        <div className="border-t border-white/10 bg-black/20 px-4 py-3">
          <p className="mb-1 text-2xs font-bold uppercase tracking-wider text-white/40">Output</p>
          <pre className="overflow-x-auto whitespace-pre font-mono text-xs leading-5 text-white/70">{output.trim()}</pre>
        </div>
      )}
    </div>
  );
}

/** Terminal-style block with copy button. With windows/mac/linux props it shows OS tabs (choice is remembered). */
export function Command({ code, windows, mac, linux, os = 'all', output, title, children }: CommandProps) {
  const preferred = usePreferredOS();
  const variants = (['windows', 'mac', 'linux'] as OS[]).filter((o) => ({ windows, mac, linux })[o] !== undefined);
  const single = code ?? textOf(children);

  return (
    <div className="not-prose my-5 overflow-hidden rounded-2xl border border-navy-800 bg-[#0B1424] shadow-soft">
      {title && <div className="border-b border-white/10 px-4 pt-3 text-sm font-bold text-white">{title}</div>}
      {variants.length > 0 ? (
        <>
          <div role="tablist" aria-label="Operating system" className="flex gap-1 border-b border-white/10 px-2 pt-2">
            {variants.map((o) => {
              const selected = (variants.includes(preferred) ? preferred : variants[0]) === o;
              return (
                <button
                  key={o}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setPreferredOS(o)}
                  className={cn(
                    'rounded-t-lg px-3 py-1.5 text-xs font-bold transition-colors',
                    selected ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80',
                  )}
                >
                  {OS_LABEL[o]}
                </button>
              );
            })}
          </div>
          {(() => {
            const active = variants.includes(preferred) ? preferred : variants[0];
            const value = { windows, mac, linux }[active] ?? '';
            return <Block code={value} shell={SHELL_LABEL[active]} output={output} />;
          })()}
        </>
      ) : (
        <Block code={single} shell={os === 'all' ? 'Terminal' : `${OS_LABEL[os]} · ${SHELL_LABEL[os]}`} output={output} />
      )}
    </div>
  );
}
