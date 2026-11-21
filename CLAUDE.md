# AWS Learning Hub

## What this is
An interactive website that teaches AWS to 2nd–3rd year BTech students who can code
(Python/JS basics) but have never used AWS. Built for our AWS Student Builder Group club.
Students learn by exploring three real serverless projects: how each is built, why each
AWS service is used, and a complete guide to build and deploy it themselves.

## Goal of every page
Students should WANT to explore, not feel forced. Curiosity first, theory second.
Every page answers: what does it do -> how does it work -> why this service -> build it yourself.

## The three projects (real code lives in /source-projects, read it, never guess)
1. File Drop Box with expiring links (beginner) -> `source-projects/file-dropbox/`, slug `file-drop-box`
2. GitHub Repo Analytics Dashboard (intermediate) -> `source-projects/github-analytics/`, slug `github-analytics`
   (driven by GitHub **webhooks** signed with HMAC; it does not poll the GitHub API, has no
   EventBridge schedule and keeps the secret in a NoEcho parameter, not SSM/Secrets Manager)
3. Live Quiz & Polling Platform (advanced) -> `source-projects/live-quiz/`, slug `live-quiz`
All use AWS SAM, Python 3.12 Lambdas (arm64, boto3 only), plain HTML/JS frontends, region ap-south-1.

## Tech stack
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- React Router for pages
- MDX for long written content (guides, service pages, FAQ)
- React Flow (@xyflow/react) for interactive architecture diagrams
- Framer Motion for animations
- prism-react-renderer for code highlighting
- Static build only (no backend). Deployed to S3 + CloudFront.

## Writing style for all content
- Plain English, short sentences. Explain AWS terms the first time they appear.
- Use real-life analogies (S3 = a cloud folder that can also serve websites).
- Second person: "you". Friendly, not childish. No walls of text.
- Every command must be copy-pasteable and correct for Windows, macOS and Linux
  (show OS tabs where they differ).
- Never invent AWS facts, prices, limits or console steps. If unsure, write
  TODO(verify) so a human checks it.
- Always mention cost and Free Tier where relevant. Always end build guides with cleanup.
- No emoji in the UI or content: use lucide icons.

## Design direction
- Bright, modern, playful but clean. Light theme default + dark mode.
- AWS-inspired accent (orange #FF9900) with a deep navy, plus one fresh accent colour (teal).
- Big clear headings, cards, rounded corners, generous spacing, subtle motion.
- Mobile friendly: students will open it on phones.
- Accessible: keyboard navigation, alt text, contrast AA, respects prefers-reduced-motion.
- Never use window.alert/confirm/prompt: use the themed ConfirmDialog.

## Code conventions
- Components in src/components, pages in src/pages, content in src/content.
- Project data is DATA, not code: one folder per project under src/content/projects/.
- Reusable components over copy-paste. Keep components small and typed.
- MDX components and content rules are documented in CONTENT_GUIDE.md.
- Run `npm run validate`, `npm run build` and `npm run lint` before saying a task is done.
