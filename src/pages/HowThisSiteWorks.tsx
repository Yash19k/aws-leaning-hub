import { ArrowRight, Coins, Github, Lock, Timer } from 'lucide-react';
import { ArchitectureDiagram } from '@/components/diagram/ArchitectureDiagram';
import { CodePeek } from '@/components/diagram/CodePeek';
import { DiagramProvider } from '@/components/diagram/DiagramContext';
import { FlowPlayer } from '@/components/diagram/FlowPlayer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NextUp } from '@/components/project/NextUp';
import { ServiceChip } from '@/components/ui/Badge';
import { ExternalButton } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { siteArchitecture } from '@/content/site/architecture';
import { inline } from '@/lib/markdown';
import { usePageMeta } from '@/lib/meta';
import { SITE } from '@/lib/site';

const CARDS = [
  {
    icon: Lock,
    title: 'Origin Access Control (OAC)',
    text: 'The bucket blocks all public access. Its policy allows exactly one reader: this CloudFront distribution. OAC makes CloudFront sign every request to S3, so the bucket can tell the request is genuine.',
  },
  {
    icon: Timer,
    title: 'Caching that never goes stale',
    text: 'Vite puts a content hash in every JS and CSS file name, so those files can be cached for a year. HTML files are tiny and always revalidated, so a new deploy shows up right away.',
  },
  {
    icon: Coins,
    title: 'Why it costs almost nothing',
    text: 'There is no server. You pay a little for storage, requests and data transfer, and a club-sized audience fits inside the Free Tier for CloudFront and S3 TODO(verify).',
  },
];

export default function HowThisSiteWorks() {
  usePageMeta('This site runs on AWS', 'How the AWS Learning Hub is hosted: a private S3 bucket behind CloudFront, deployed by GitHub Actions with OIDC.');
  return (
    <DiagramProvider source={siteArchitecture}>
      <div className="container-page pt-8">
        <Breadcrumbs items={[{ label: 'How this site works' }]} />
        <header className="mb-10 max-w-3xl">
          <p className="eyebrow mb-2">Meta moment</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">This site runs on AWS too</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Everything you are reading is a folder of static files in a private S3 bucket, delivered by CloudFront. The whole
            setup is one template file, deployed the same way the projects are.
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            <ServiceChip slug="cloudfront" link />
            <ServiceChip slug="s3" link />
            <ServiceChip slug="iam" link />
            <ServiceChip slug="cloudformation" link />
          </div>
        </header>

        <section id="architecture" className="scroll-mt-28">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ArchitectureDiagram title="Architecture of this website" />
            <FlowPlayer className="lg:sticky lg:top-24 lg:self-start" />
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading eyebrow="The ideas" title="Three things worth knowing" />
          <div className="grid gap-4 md:grid-cols-3">
            {CARDS.map((c) => (
              <div key={c.title} className="card-base p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-navy-950">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{inline(c.text)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-prose">
          <SectionHeading eyebrow="The trick" title="Deep links without a server" />
          <div className="prose-hub">
            <p>
              React Router changes the URL in your browser, but there is no file called <code>/projects/dropvault</code> in the
              bucket. Two things make direct links work:
            </p>
            <ol>
              <li>
                At build time, a script writes a small <code>index.html</code> for every known page (with the right title and
                description), and a CloudFront Function adds <code>/index.html</code> to paths without a file extension.
              </li>
              <li>
                For anything else, CloudFront turns S3's <code>403</code>/<code>404</code> into the app's main{' '}
                <code>index.html</code> with a <code>200</code>, and React Router shows the right page (or the 404 page).
              </li>
            </ol>
          </div>
          <CodeBlock
            filename="Deploy it yourself"
            language="bash"
            code={`npm run build          # validate content, type-check, build, pre-render pages\nnpm run deploy:infra   # sam deploy infra/template.yaml (once)\nnpm run deploy:site    # sync dist/ to S3 + invalidate HTML`}
          />
          <Callout type="info" title="Read the real template">
            <p>
              Every resource on this page is defined in <code>infra/template.yaml</code>. Step-by-step deploy notes, including
              the GitHub OIDC setup, are in <code>DEPLOY.md</code>.
            </p>
          </Callout>
          <ExternalButton href={`${SITE.repoUrl}/blob/main/infra/template.yaml`} icon={<Github className="h-4 w-4" />} iconRight={<ArrowRight className="h-4 w-4" />}>
            infra/template.yaml on GitHub
          </ExternalButton>
        </section>

        <NextUp
          items={[
            { to: '/services/cloudfront', title: 'Learn CloudFront', description: 'Edge caching, distributions and cache policies.' },
            { to: '/services/s3', title: 'Learn S3', description: 'Buckets, objects and presigned URLs.' },
            { to: '/projects', title: 'Explore a bigger project', description: 'DropVault and Quibble use many more services.' },
          ]}
        />
      </div>
      <CodePeek />
    </DiagramProvider>
  );
}
