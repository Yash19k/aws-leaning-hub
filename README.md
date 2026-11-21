# AWS Learning Hub

An interactive website that teaches AWS to students who can code but have never used AWS, by taking
real serverless projects apart box by box. Built for the AWS Student Builder Group.

- **Clickable architecture diagrams**: tap any service to see its job in that project, an analogy,
  "why not something else?" and the real code.
- **Request-flow animations**: watch a dot travel through the system step by step, with captions and
  the actual payloads.
- **What-if cards, code peeks, quizzes, badges** and progress saved in the browser.
- **Complete build guides** for each project, plus setup guides (account, security, billing alarm,
  tools), a service library, FAQ and a paste-your-error troubleshooter.

Projects covered: **DropVault** (file sharing with expiring links, Terraform + Python) and **Quibble**
(real-time multiplayer quiz over WebSockets, SAM + Node.js). GitHub Repo Analytics is listed as coming soon.

**Live:** https://main.d1mth3xfrof3ju.amplifyapp.com (deployed from `main` by GitHub Actions).

## Run it

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run validate` | Check all content: references, links, MDX, diagram layout, code snippets |
| `npm run build` | validate, type-check, build to `dist/`, pre-render page meta |
| `npm run lint` | ESLint |
| `npm run og` | Regenerate the Open Graph share images in `public/og/` (needs Chrome) |
| `npm run deploy:infra` | Create/update the S3 + CloudFront stack (`infra/template.yaml`) |
| `npm run deploy:site` | Upload `dist/` with cache headers and invalidate CloudFront |

Open `/styleguide` to see every UI component in one place. Deployment is described in [DEPLOY.md](DEPLOY.md).

## How it's organised

```
src/
  components/
    ui/          Button, Card, Badge, Tabs, Callout, CodeBlock, Accordion, Sheet, ...
    layout/      Navbar, Footer, search (Ctrl+K), progress menu, badge celebration
    diagram/     ArchitectureDiagram (React Flow), FlowPlayer, WhatIfCards, CodePeek, shared context
    guide/       MDX components: Step, Prerequisite, Command (OS tabs), ConsoleStep, Checkpoint, Cleanup, Quiz...
    project/     Project cards, cost table, section nav, mini diagrams
  content/
    projects/<slug>/   project.ts (all structured data) + overview.mdx + build.mdx + faq.mdx
    setup/             guides.ts + one MDX per setup guide
    services/          services.ts + one MDX per AWS service
    faq/, troubleshooting/, site/ (this site's own architecture)
  lib/           types, content loader, progress + badges (localStorage), search index, theme
  pages/         one file per route
scripts/         validate-content, prerender-meta, deploy-site, generate-og, shared MDX options
infra/           template.yaml (S3, CloudFront, OAC, CloudFront Function, GitHub OIDC role)
source-projects/ (git-ignored) the real project repos the content is written from
```

Projects are **data, not code**: add a folder under `src/content/projects/` and every page, diagram and
search entry picks it up. `CONTENT_GUIDE.md` explains the format, the MDX components and the writing rules;
`CLAUDE.md` holds the site's purpose, audience and style.

## Content checks

`npm run validate` (also run by `npm run build`) fails on broken references (service, node, edge,
guide slugs), broken internal links, unknown MDX components, MDX syntax errors, overlapping diagram
boxes, and **code peeks that don't match the real source**: when `source-projects/<folder>/` exists,
every line of every snippet must appear in the named file. It also counts the `TODO(verify)` markers,
which render as small amber "verify" pills until a human checks them against AWS.

To refresh `source-projects/` from the real repos (committed files only, no secrets):

```bash
git -C ../dropvault archive HEAD | tar -x -C source-projects/dropvault
git -C ../quibble archive HEAD | tar -x -C source-projects/quibble
```

## Launch checklist

- [ ] Every `TODO(verify)` checked against the real AWS console and pricing pages (`npm run validate` prints the count)
- [ ] Someone built DropVault using only the site's guide, start to finish
- [ ] At least two club juniors tried it, and the places they got stuck are fixed
- [ ] Tested on a phone and a laptop, in light and dark mode
- [ ] No AWS keys, tokens or account IDs anywhere in the repo (`git log` too)
- [ ] Billing alarm set on the AWS account hosting the site
- [ ] Deep links work on the live CloudFront URL
- [ ] Club name, logo and links filled in (`src/lib/site.ts`)
