/**
 * Publish dist/ to the site bucket with the right cache headers, then invalidate CloudFront.
 *
 *   npm run build && npm run deploy:site
 *
 * Reads the bucket and distribution from the CloudFormation stack's outputs.
 * Env: STACK_NAME (default aws-learning-hub), AWS_REGION (default ap-south-1).
 * Works the same on Windows, macOS and Linux (needs the AWS CLI v2 on PATH).
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const STACK = process.env.STACK_NAME ?? 'aws-learning-hub';
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'ap-south-1';

function aws(args: string[], quiet = false): string {
  if (!quiet) console.log(`> aws ${args.join(' ')}`);
  return execFileSync('aws', [...args, '--region', REGION], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
    .replace(/\r/g, '')
    .trim();
}

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const stack = JSON.parse(aws(['cloudformation', 'describe-stacks', '--stack-name', STACK, '--output', 'json'], true));
const outputs: Record<string, string> = Object.fromEntries(
  (stack.Stacks[0].Outputs as { OutputKey: string; OutputValue: string }[]).map((o) => [o.OutputKey, o.OutputValue]),
);
const bucket = `s3://${outputs.BucketName}`;
console.log(`Deploying dist/ to ${bucket} (stack ${STACK}, ${REGION})\n`);

// 1. Hashed assets first: their names change every build, so they can be cached for a year.
//    Uploading them before the HTML means a new page never points at a file that isn't there yet.
aws(['s3', 'sync', path.join(DIST, 'assets'), `${bucket}/assets`, '--cache-control', 'public, max-age=31536000, immutable', '--only-show-errors']);

// 2. Other static files (favicon, images, Open Graph cards): cache for a day.
aws(['s3', 'sync', DIST, bucket, '--exclude', 'assets/*', '--exclude', '*.html', '--cache-control', 'public, max-age=86400', '--only-show-errors']);

// 3. HTML: always revalidate, so a deploy shows up straight away.
aws(['s3', 'sync', DIST, bucket, '--exclude', '*', '--include', '*.html', '--cache-control', 'public, max-age=0, must-revalidate', '--content-type', 'text/html; charset=utf-8', '--only-show-errors']);

// 4. Remove files that no longer exist (old hashed assets are kept so open tabs keep working).
aws(['s3', 'sync', DIST, bucket, '--delete', '--exclude', 'assets/*', '--only-show-errors']);

// 5. Clear CloudFront's copies of the HTML. "/*" counts as a single invalidation path.
const inv = JSON.parse(
  aws(['cloudfront', 'create-invalidation', '--distribution-id', outputs.DistributionId, '--paths', '/*', '--output', 'json']),
);
console.log(`\nInvalidation ${inv.Invalidation.Id} started.`);
console.log(`Done. Site: ${outputs.SiteUrl}`);
