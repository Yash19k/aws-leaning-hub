# AWS Learning Hub

## What this is
An interactive website that teaches AWS to 2nd–3rd year BTech students who can code
(Python/JS basics) but have never used AWS. Built for our AWS Student Builder Group club.
Students learn by exploring real serverless projects: how each is built, why each
AWS service is used, and a complete guide to build and deploy it themselves.

## Goal of every page
Students should WANT to explore, not feel forced. Curiosity first, theory second.
Every page answers: what does it do -> how does it work -> why this service -> build it yourself.

## The projects (real code lives in /source-projects, read it, never guess)
1. **DropVault**: file sharing with expiring links (beginner) -> `source-projects/dropvault/`, slug `dropvault`.
   Terraform (>= 1.5), Python 3.13 Lambdas, REST API Gateway + Lambda authorizer, DynamoDB, S3
   presigned/multipart uploads, SES, optional KMS, SNS/EventBridge alerts, React 19 web app on
   Amplify Hosting. Deployed with `bash deploy.sh`. Its AWS resources are named `enclave-*`
   (the `app_name` default), because it started as a fork of Enclave.
2. **Quibble**: real-time multiplayer quiz (advanced) -> `source-projects/quibble/`, slug `quibble`.
   AWS SAM, Node.js 22 Lambdas on arm64, API Gateway HTTP + WebSocket APIs, 9 DynamoDB tables,
   S3 frontend, CloudWatch alarms/dashboard, SNS alerts, EventBridge rule on stack status.
   Deployed with `npm run deploy`.
3. **GitHub Repo Analytics** is shown as "coming soon" (`src/content/coming-soon.ts`): the real
   app (RepoLedger) doesn't run on AWS yet.
Refresh `source-projects/` with `git -C ../<repo> archive HEAD | tar -x -C source-projects/<repo>`.

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
