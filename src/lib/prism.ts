/**
 * prism-react-renderer ships a small set of grammars. Bash, PowerShell, HCL (Terraform),
 * TOML and INI come from prismjs, which expects a global Prism. prism-global.ts must be
 * imported first so the global exists when these component files run.
 */
import './prism-global';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-ini';
import { Prism } from 'prism-react-renderer';

const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  ps: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  tf: 'hcl',
  terraform: 'hcl',
  py: 'python',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  yml: 'yaml',
  html: 'markup',
  xml: 'markup',
  env: 'ini',
  text: 'plain',
  txt: 'plain',
};

export function normalizeLanguage(lang: string | undefined): string {
  const l = (lang ?? 'plain').toLowerCase();
  const resolved = ALIASES[l] ?? l;
  return Prism.languages[resolved] ? resolved : 'plain';
}

export const LANGUAGE_LABEL: Record<string, string> = {
  bash: 'Terminal',
  powershell: 'PowerShell',
  hcl: 'Terraform',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  yaml: 'YAML',
  toml: 'TOML',
  ini: 'Config',
  markup: 'HTML',
  jsx: 'JSX',
  tsx: 'TSX',
  plain: 'Text',
};
