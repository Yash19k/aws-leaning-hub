/**
 * Content data model for the AWS Learning Hub.
 *
 * Every project is DATA: one folder per project in src/content/projects/<slug>/ with
 *   project.ts   -> `export default` a Project (this file's types)
 *   overview.mdx -> the "what it does" story
 *   build.mdx    -> the full step-by-step build guide
 *   faq.mdx      -> project FAQ (<FaqItem q="...">answer</FaqItem>)
 *
 * Content files must import only types (no Vite features), because
 * scripts/validate-content.ts loads them with plain Node.
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ServiceCategory =
  | 'storage'
  | 'compute'
  | 'database'
  | 'networking'
  | 'security'
  | 'management'
  | 'integration'
  | 'frontend'
  | 'ai';

/** Lucide icon names available for services and guides (see src/lib/icons.tsx). */
export type IconName =
  | 'archive'
  | 'zap'
  | 'database'
  | 'network'
  | 'globe'
  | 'shield'
  | 'key'
  | 'activity'
  | 'bell'
  | 'mail'
  | 'calendar-clock'
  | 'layers'
  | 'rocket'
  | 'user'
  | 'users'
  | 'monitor'
  | 'smartphone'
  | 'laptop'
  | 'github'
  | 'server'
  | 'timer'
  | 'lock'
  | 'terminal'
  | 'wrench'
  | 'credit-card'
  | 'piggy-bank'
  | 'user-cog'
  | 'download'
  | 'code'
  | 'box'
  | 'cloud'
  | 'qr-code'
  | 'radio'
  | 'file-code'
  | 'cpu'
  | 'container'
  | 'package'
  | 'hard-drive'
  | 'folder-tree'
  | 'snowflake'
  | 'table'
  | 'sparkles'
  | 'gauge'
  | 'waypoints'
  | 'signpost'
  | 'split'
  | 'fingerprint'
  | 'scroll'
  | 'list'
  | 'brain'
  | 'bot';

// ---------------------------------------------------------------- services in a project

export interface ProjectServiceRole {
  /** Must match a slug in src/content/services/services.ts */
  serviceSlug: string;
  /** One plain sentence: what this service does in THIS project. */
  roleInThisProject: string;
  /** Real-life comparison, e.g. "a locker room where each file has its own locker". */
  analogy: string;
  /** "Why not X instead?" in one or two sentences. */
  whyNotAlternative: string;
}

// ---------------------------------------------------------------- architecture (React Flow compatible)

export type NodeKind = 'service' | 'user' | 'browser' | 'external';

export interface Point {
  x: number;
  y: number;
}

export interface ArchNode {
  id: string;
  kind: NodeKind;
  /** Required when kind === 'service'. */
  serviceSlug?: string;
  /** Text on the box, e.g. "Lambda: upload". Keep it short (max ~22 chars). */
  label: string;
  /** Optional second line, e.g. "upload_file.py". */
  sublabel?: string;
  /** Icon for non-service nodes (service nodes use the service's icon). */
  icon?: IconName;
  /** Desktop layout (left-to-right). Boxes are ~176x64 px; leave ~90 px gaps. */
  position: Point;
  /** Phone layout (top-to-bottom, at most 2 columns: x = 0 or 200). Falls back to x/y swapped. */
  mobilePosition?: Point;
  /**
   * What this specific box does in this project. Overrides the service-level role
   * (useful when one service appears twice, e.g. two Lambdas). Required for non-service nodes.
   */
  description?: string;
}

export interface ArchEdge {
  id: string;
  source: string;
  target: string;
  /** Short label shown on hover/tap, e.g. "POST /files". */
  label: string;
  /** 'dashed' = background or async traffic (logs, events, timers). */
  style?: 'solid' | 'dashed';
}

export interface Architecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

// ---------------------------------------------------------------- request flows

export interface FlowStep {
  /** Travel along this edge (exactly one of edgeId / nodeId). */
  edgeId?: string;
  /** true = travel the edge from target back to source (e.g. a response). */
  reverse?: boolean;
  /** Or: focus on one node (something happens inside it). */
  nodeId?: string;
  title: string;
  /** One or two sentences. */
  explanation: string;
  /** Optional JSON-ish example of what travels on this step. */
  payloadExample?: unknown;
}

export interface RequestFlow {
  id: string;
  title: string;
  /** One sentence shown in the flow list. */
  summary: string;
  steps: FlowStep[];
}

// ---------------------------------------------------------------- engagement data

export interface WhatIf {
  id: string;
  question: string;
  /** 2-4 sentences. Inline markdown allowed (`code`, **bold**, [link](/path)). */
  answer: string;
  relatedNodeIds: string[];
}

export interface CodePeek {
  id: string;
  nodeId: string;
  title: string;
  language: string;
  /** Path inside the project repo, e.g. "endpoints/upload-file/src/upload_file.py". */
  filePath: string;
  /** A short, real snippet copied from the source (validated against source-projects/). */
  code: string;
  /** Plain-language explanation shown above the code. */
  explanation: string;
  /** 1-based line numbers within `code` to highlight. */
  highlightLines?: number[];
}

export interface CostLine {
  service: string;
  freeTierCovers: string;
  beyondFreeTier: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  /** e.g. "2-3 hours" */
  estimatedBuildTime: string;
  freeTierFriendly: { value: boolean; note: string };
  /** Shown in the hero. Path under /public. */
  heroImage?: { src: string; alt: string };
  /** Optional demo video (YouTube embed URL or file under /public). */
  demoVideoUrl?: string;
  liveDemoUrl?: string;
  githubUrl: string;
  /** Default git branch, used to build "view on GitHub" links. */
  githubBranch: string;
  /** Folder name inside source-projects/ */
  sourceFolder: string;
  /** How the infrastructure is defined. */
  iac: 'sam' | 'terraform';
  /** Tech chips, e.g. ["Python 3.13", "React 19", "Terraform"]. */
  stack: string[];
  /** Gallery order (lower first). */
  order: number;
  /** Hidden projects are routable but not listed (e.g. example-project). */
  hidden?: boolean;
  whatYouLearn: string[];
  services: ProjectServiceRole[];
  architecture: Architecture;
  flows: RequestFlow[];
  whatIfs: WhatIf[];
  codePeeks: CodePeek[];
  /** Setup guide slugs needed before building. */
  prerequisites: string[];
  /** Every number marked TODO(verify). */
  costBreakdown: CostLine[];
  /** Extra links (README, live admin, docs). */
  links?: ProjectLink[];
}

// ---------------------------------------------------------------- setup guides, services, FAQ

export interface SetupGuide {
  slug: string;
  title: string;
  order: number;
  /** e.g. "10 min" */
  estimatedTime: string;
  summary: string;
  icon: IconName;
  /** Project slugs that need this guide. Empty = everyone. */
  neededFor?: string[];
  /** Optional guides are shown but not required for the 'Account Ready' badge. */
  optional?: boolean;
}

export interface ServiceMeta {
  slug: string;
  name: string;
  /** Short name for chips, e.g. "S3". */
  shortName: string;
  category: ServiceCategory;
  oneLiner: string;
  analogy: string;
  icon: IconName;
  /** Official docs home page. */
  docsUrl: string;
  /** A core AWS service that none of the projects use yet (in the library for reference). */
  notInProjects?: boolean;
}

export interface Service extends ServiceMeta {
  /** Computed from projects. */
  usedInProjects: string[];
}

export type FaqGroup = 'account' | 'safety' | 'learning' | 'projects' | 'certifications';

export interface FaqItem {
  id: string;
  group: FaqGroup;
  question: string;
  /** Markdown-lite: paragraphs, "- " lists, `code`, **bold**, [links](/path). */
  answer: string;
  tags?: string[];
}

export interface TroubleshootingItem {
  id: string;
  title: string;
  /** The exact error text a student would see (used for paste-your-error search). */
  errorMessage: string;
  /** What it means, in plain words. */
  cause: string;
  /** Ordered fix steps (markdown-lite). */
  fix: string[];
  relatedProjects: string[];
  /** Extra words to match in search. */
  keywords?: string[];
}

export interface ComingSoonProject {
  slug: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  services: string[];
}
