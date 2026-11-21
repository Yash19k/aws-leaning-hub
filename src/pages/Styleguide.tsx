import { useState, type ReactNode } from 'react';
import { ArrowRight, Github, Rocket, Sparkles } from 'lucide-react';
import { Checkpoint, Cleanup, ConsoleStep } from '@/components/guide/Boxes';
import { Command } from '@/components/guide/Command';
import { Concept, KeyConcepts, Term, WhenToUse } from '@/components/guide/Extras';
import { Prerequisite } from '@/components/guide/Prerequisite';
import { Quiz } from '@/components/guide/Quiz';
import { Step } from '@/components/guide/Step';
import { MiniDiagram } from '@/components/project/MiniDiagram';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Badge, DifficultyBadge, ServiceChip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardTitle } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CopyButton } from '@/components/ui/CopyButton';
import { Kbd } from '@/components/ui/Kbd';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Sheet } from '@/components/ui/Sheet';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { CATEGORIES } from '@/lib/categories';
import { allProjects, services } from '@/lib/content';
import { usePageMeta } from '@/lib/meta';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-5 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

const SAMPLE = `def handler(event, context):
    # Validate, then sign a URL the browser can upload to
    body = json.loads(event["body"])
    url = s3.generate_presigned_url("put_object", Params={...}, ExpiresIn=900)
    return {"statusCode": 201, "body": json.dumps({"upload_url": url})}`;

export default function Styleguide() {
  usePageMeta('Styleguide');
  const [tab, setTab] = useState('one');
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [progress, setProgress] = useState(40);
  const example = allProjects.find((p) => p.slug === 'example-project') ?? allProjects[0];

  return (
    <div className="container-page pt-10">
      <p className="eyebrow mb-2">Design system</p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Styleguide</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Every UI building block in one place. Toggle dark mode and shrink the window to check them.</p>

      <Block title="Colours">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ['Brand 500', '#FF9900'],
            ['Brand 700 (text)', '#B45F06'],
            ['Navy 900', '#0F1B2D'],
            ['Teal 500', '#14B09F'],
            ['Teal 700 (text)', '#0D7169'],
            ['Navy 100', '#D8E0EF'],
          ].map(([n, c]) => (
            <div key={n} className="card-base overflow-hidden">
              <div className="h-16" style={{ backgroundColor: c }} />
              <p className="px-3 py-2 text-xs font-bold">{n}<br /><span className="font-mono text-muted">{c}</span></p>
            </div>
          ))}
        </div>
        <p className="mb-2 mt-6 text-sm font-bold text-muted">Service categories</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold">
              <span className="h-4 w-4 rounded-md" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Typography">
        <p className="text-display font-extrabold">Display heading</p>
        <h1 className="mt-4 text-4xl font-extrabold">Heading 1</h1>
        <h2 className="mt-2 text-3xl font-extrabold">Heading 2</h2>
        <h3 className="mt-2 text-xl font-bold">Heading 3</h3>
        <p className="mt-2 max-w-prose text-lg leading-relaxed text-muted">Body large. Plain English, short sentences, generous spacing.</p>
        <p className="mt-2 font-mono text-sm">Monospace: aws sts get-caller-identity</p>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Rocket className="h-4 w-4" />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Block>

      <Block title="Badges and chips">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand" icon={<Sparkles className="h-3 w-3" />}>Brand</Badge>
          <Badge tone="teal">Teal</Badge>
          <Badge tone="navy">Navy</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="danger">Danger</Badge>
          <DifficultyBadge level="beginner" />
          <DifficultyBadge level="intermediate" />
          <DifficultyBadge level="advanced" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {services.map((s) => (
            <ServiceChip key={s.slug} slug={s.slug} link />
          ))}
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardTitle>Static card</CardTitle><p className="mt-2 text-muted">Rounded, bordered, soft shadow.</p></Card>
          <Card interactive><CardTitle>Interactive card</CardTitle><p className="mt-2 text-muted">Lifts on hover.</p></Card>
          <Card className="text-navy-900 dark:text-navy-100">
            <CardTitle>Mini diagram</CardTitle>
            {example && <MiniDiagram architecture={example.architecture} className="mt-2 w-full" />}
          </Card>
        </div>
      </Block>

      <Block title="Tabs">
        <Tabs
          label="Example tabs"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'one', label: 'Overview', content: <p className="text-muted">First panel. Use arrow keys to move between tabs.</p> },
            { id: 'two', label: 'Details', content: <p className="text-muted">Second panel.</p> },
            { id: 'three', label: 'Code', content: <p className="text-muted">Third panel.</p> },
          ]}
        />
      </Block>

      <Block title="Callouts">
        <Callout type="info">An info callout explains something useful.</Callout>
        <Callout type="tip">A tip makes life easier.</Callout>
        <Callout type="warning">A warning prevents a mistake.</Callout>
        <Callout type="cost">A cost callout mentions money and the Free Tier.</Callout>
        <Callout type="security">A security callout protects keys and accounts.</Callout>
      </Block>

      <Block title="Code">
        <CodeBlock code={SAMPLE} language="python" filename="src/upload.py" highlightLines={[4]} />
        <Command code={'aws sts get-caller-identity'} output={'{\n  "UserId": "AIDA...",\n  "Account": "123456789012",\n  "Arn": "arn:aws:iam::123456789012:user/student"\n}'} />
        <Command
          windows={'msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi'}
          mac={'curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"\nsudo installer -pkg AWSCLIV2.pkg -target /'}
          linux={'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"\nunzip awscliv2.zip\nsudo ./aws/install'}
        />
        <div className="flex items-center gap-3">
          <CopyButton text="copied text" tone="light" />
          <span className="text-sm text-muted">Shortcuts: <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></span>
        </div>
      </Block>

      <Block title="Accordion, progress, tooltip, term">
        <Accordion>
          <AccordionItem title="What is an accordion?" defaultOpen>It hides detail until you ask for it.</AccordionItem>
          <AccordionItem title="Is it keyboard accessible?">Yes: Tab to it, Enter to toggle.</AccordionItem>
        </Accordion>
        <div className="mt-6 flex items-center gap-4">
          <ProgressBar value={progress} max={100} label="Demo progress" showValue className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 20))}>+20</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <Tooltip content="Tooltips show on hover and focus">
            <Button variant="outline" size="sm">Hover me</Button>
          </Tooltip>
          <p>
            A <Term t="presigned URL">A temporary link that lets someone upload or download one S3 object without AWS credentials.</Term> is
            handy.
          </p>
        </div>
      </Block>

      <Block title="Dialogs">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setSheet(true)}>Open side panel</Button>
          <Button variant="outline" onClick={() => setConfirm(true)}>Open confirm dialog</Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Side panel">
          <p className="text-muted">On phones this becomes a bottom sheet. Press Esc to close.</p>
        </Sheet>
        <ConfirmDialog open={confirm} title="Are you sure?" onCancel={() => setConfirm(false)} onConfirm={() => setConfirm(false)}>
          Themed replacement for window.confirm().
        </ConfirmDialog>
      </Block>

      <Block title="Guide components">
        <div className="max-w-prose">
          <Prerequisite slug="create-aws-account" />
          <Step number={1} title="An example step">
            <p>Steps hold instructions. Inside a guide they get a "Mark as done" checkbox.</p>
          </Step>
          <ConsoleStep path="Services > IAM > Users > Create user">
            <p>Type a user name, then choose <strong>Next</strong>.</p>
          </ConsoleStep>
          <Checkpoint output={'Successfully created/updated stack - hello in ap-south-1'}>The deploy finished without errors.</Checkpoint>
          <Cleanup>
            <Command code={'sam delete --stack-name hello'} />
          </Cleanup>
          <Quiz question="Which service stores files as objects in buckets?" options={['Lambda', 'S3', 'DynamoDB']} answer={1} explanation="S3 = Simple Storage Service." />
          <KeyConcepts>
            <Concept title="Bucket">A container for objects, with a globally unique name.</Concept>
            <Concept title="Object">A file plus its metadata, addressed by a key.</Concept>
          </KeyConcepts>
          <WhenToUse use={['Storing uploads', 'Hosting a static site']} avoid={['Data you query by field', 'Tiny frequent updates']} />
        </div>
      </Block>

      <Block title="Icons">
        <div className="flex items-center gap-3 text-muted">
          <Github className="h-6 w-6" /> <Rocket className="h-6 w-6" /> <Sparkles className="h-6 w-6" />
          <span className="text-sm">lucide-react line icons only, no emoji.</span>
        </div>
      </Block>
    </div>
  );
}
