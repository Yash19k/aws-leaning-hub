# Content guide

How to write content for the AWS Learning Hub. Read `CLAUDE.md` first for the audience and voice.
Types live in `src/lib/types.ts`; the example of every field filled in is `src/content/projects/example-project/`.

## Checks

```bash
npm run validate   # fast: compiles every MDX file, checks every reference, link and code snippet
npx tsc -b         # type-check
```

`npm run validate` must pass before you finish. It fails on: unknown serviceSlug / nodeId / edgeId /
guide slug, broken internal links, unknown MDX components, MDX syntax errors, steps not numbered
1, 2, 3..., overlapping diagram boxes, and code peeks whose lines are not in the real source file.

## Golden rules

1. **Read the real code** in `source-projects/<folder>/` before writing. Never guess.
2. **Never invent AWS facts**, prices, limits, quotas or console click paths. If you are not sure,
   write `TODO(verify)` right after the claim. Prices and Free Tier numbers always get `TODO(verify)`.
3. Plain English, short sentences, second person ("you"). Explain each AWS term the first time.
   One real-life analogy per new idea. No walls of text: split into steps, cards, lists.
4. **No emoji** anywhere. Icons come from the components.
5. Every command must be copy-pasteable. Where Windows (PowerShell) differs from macOS/Linux (bash),
   use OS tabs: `<Command windows={...} mac={...} linux={...} />`.
6. Always mention cost and the Free Tier where relevant. Build guides always end with cleanup.

## Internal links (all checked)

`/projects/<slug>`, `/projects/<slug>/build`, `/projects/<slug>/build#step-4`, `/setup/<slug>`,
`/services/<slug>`, `/faq`, `/faq#<id>`, `/troubleshooting`, `/troubleshooting#<id>`.
Project slugs: `dropvault`, `quibble`. Service slugs: see `src/content/services/services.ts`
(`lambda s3 dynamodb api-gateway iam kms cloudwatch cloudformation sns ses eventbridge amplify cloudfront`,
plus the library-only services marked `notInProjects`: `ec2 ecs-eks elastic-beanstalk ebs efs glacier rds aurora
elasticache vpc route53 elb cognito cloudtrail sqs sagemaker bedrock`).
Setup slugs: see `src/content/setup/guides.ts`.

## MDX components (available in every .mdx file, no imports)

```mdx
<Step number={1} title="Clone the code">
Markdown content. Leave a blank line after the opening tag and before the closing tag.
</Step>

<Prerequisite slug="configure-aws-cli" />

<Command code={`aws sts get-caller-identity`} output={`{ "Account": "123456789012" }`} />
<Command
  windows={`Copy-Item terraform.tfvars.example terraform.tfvars`}
  mac={`cp terraform.tfvars.example terraform.tfvars`}
  linux={`cp terraform.tfvars.example terraform.tfvars`}
/>

<ConsoleStep path="Services > IAM > Users > Create user">
What to type or pick on that screen. TODO(verify) if you are unsure of a label.
</ConsoleStep>

<Checkpoint output={`Apply complete! Resources: 74 added`}>
What the student should see now.
</Checkpoint>

<Callout type="tip|info|warning|cost|security" title="Optional title">Text</Callout>

<Cleanup>
<Command code={`terraform destroy`} />
</Cleanup>

<Quiz question="..." options={["A", "B", "C"]} answer={1} explanation="Why B is right." />

<Term t="presigned URL">A temporary link that lets someone upload or download one object.</Term>

<KeyConcepts>
  <Concept title="Bucket">A container for objects.</Concept>
</KeyConcepts>

<WhenToUse use={["...", "..."]} avoid={["...", "..."]} />

<FaqList>
  <FaqItem q="Question?">
    Answer in markdown.
  </FaqItem>
</FaqList>

<ServiceChip slug="s3" />
```

Fenced code blocks become highlighted code with a copy button. Add a file name and highlighted lines:

````mdx
```yaml title="aws/template.yaml" {3-4}
...
```
````

Languages: `bash powershell python javascript json yaml hcl toml ini typescript`.

### MDX gotchas

- In prose, `{`, `}` and `<` start JSX. Put code-like text in backticks: `` `${var}` ``, `` `<user_id>` ``.
- Inside `` code={`...`} `` template literals, escape backticks as `` \` `` and `${` as `\${`.
  PowerShell's line-continuation backtick must be escaped too, or avoid multi-line PowerShell.
- Leave blank lines around markdown inside components (`<Step>`, `<Callout>`, `<Cleanup>`).
- Steps in one file are numbered 1, 2, 3... with no gaps (the guide's progress bar counts them).
- Use `##` headings to group steps into parts ("## Part 2: Deploy"). Don't use `#` (the page has the h1).

## Project data (`src/content/projects/<slug>/project.ts`)

`export default` a `Project` (see types.ts). Import types with a relative path:
`import type { Project } from '../../../lib/types';` and nothing else (the validator loads it with Node).

### Architecture diagram layout

- Box size: desktop 176 x 64 px, phone 156 x 60 px.
- **Desktop (`position`)**: left-to-right, at most 4-5 columns. Use x = 0, 215, 430, 645, 860 and
  rows y = 0, 110, 220, 330, 440. Keep the total width at or under ~1040 px so text stays readable.
- **Phone (`mobilePosition`)**: top-to-bottom, **2 columns: x = 0 or 200**, rows every 120-140 px
  (y = 0, 130, 260...). Put a node that talks to two others between them.
- Labels: max ~22 characters ("Lambda: upload", "Files table"). Use `sublabel` for a file name or detail.
- 9-15 nodes is the sweet spot. Group many similar things into one box with a clear description
  (e.g. "Alarms + dashboard"), rather than drawing 14 alarms.
- **One edge per pair of nodes.** For a response, reuse the edge in a flow with `reverse: true`.
- `style: 'dashed'` = background or async traffic (logs, metrics, events, timers, streams).
- Non-service nodes (`user`, `browser`, `external`) need a `description`.
- If one service appears in several boxes (two Lambdas), give each box a `description` saying what
  that box does; the service-level `services[]` entry explains the service's role overall.
- Every service used by a node must be in `services[]` (or the node needs a `description`).

### Flows

3-5 flows, each 4-9 steps. Each step is either `{ edgeId, reverse? }` (a dot travels the edge)
or `{ nodeId }` (something happens inside a box). `explanation`: one or two sentences, under 300
characters. `payloadExample`: a small, realistic JSON object or string taken from the real code
(field names exactly as in the code). Flows must follow the real logic step by step.

### Code peeks

3-6 peeks, 6-25 lines each, the interesting part only. **Copy lines exactly from the source file.**
The validator checks every non-blank line (trimmed) exists in `source-projects/<sourceFolder>/<filePath>`.
To skip lines, put a line containing only `...` (or `# ...` / `// ...`). `highlightLines` are 1-based
lines within your snippet. `explanation` says in plain words what the code does and why.

### What-ifs

4-6 questions students actually wonder about ("What if 250 people answer in the same second?",
"What does this cost a month?", "What if someone guesses a link?"). Answers: 2-4 sentences grounded in
the real code and README. `relatedNodeIds` light up on the diagram.

### Cost breakdown

One row per service. Every number gets `TODO(verify)`.

## Build guide (`build.mdx`) structure

0. Prerequisites (`<Prerequisite>` for each setup guide needed)
1. Get the code (clone) and a tour of the folder structure
2. Understand the infrastructure file section by section (short excerpts in fenced code blocks)
3. Walk through each Lambda (what it receives, what it does, what it returns)
4. Configure and deploy, explaining every prompt / variable
5. Test it (curl or the browser) with `<Checkpoint>`s showing expected output
6. Host / open the frontend
7. Try it end to end
8. Challenges to extend it
9. Cleanup (`<Cleanup>`), then confirm in the console that everything is gone

Each numbered part contains one or more `<Step>`s. Explain *why* as well as *what*.
