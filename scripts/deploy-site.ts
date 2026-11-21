/**
 * Publish dist/ to the hosting the stack uses:
 *  - amplify mode: zip dist/ and run an Amplify manual deployment;
 *  - cloudfront mode: sync to the bucket with the right cache headers, then invalidate CloudFront.
 *
 *   npm run build && npm run deploy:site
 *
 * Reads the bucket and distribution from the CloudFormation stack's outputs.
 * Env: STACK_NAME (default aws-learning-hub), AWS_REGION (default ap-south-1).
 * Works the same on Windows, macOS and Linux (needs the AWS CLI v2 on PATH).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

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
if (outputs.AmplifyAppId) {
  await deployToAmplify(outputs.AmplifyAppId);
  console.log(`Done. Site: ${outputs.SiteUrl}`);
  process.exit(0);
}

// ---------------------------------------------------------------- Amplify Hosting (manual deployment)

/** Minimal zip writer (deflate), so the script needs no extra tools on any OS. */
function zipDir(dir: string): Buffer {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const full = path.join(d, f);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(dir);
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(path.relative(dir, file).split(path.sep).join('/'));
    const data = readFileSync(file);
    const packed = deflateRawSync(data);
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(8, 8); // deflate
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(packed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, packed);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(packed.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, name);
    offset += header.length + name.length + packed.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

async function deployToAmplify(appId: string) {
  console.log(`Deploying dist/ to Amplify app ${appId} (stack ${STACK}, ${REGION})\n`);
  const zip = zipDir(DIST);
  const job = JSON.parse(aws(['amplify', 'create-deployment', '--app-id', appId, '--branch-name', 'main', '--output', 'json']));
  const res = await fetch(job.zipUploadUrl, { method: 'PUT', body: new Uint8Array(zip), headers: { 'Content-Type': 'application/zip' } });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  console.log(`Uploaded ${(zip.length / 1024 / 1024).toFixed(1)} MB`);
  aws(['amplify', 'start-deployment', '--app-id', appId, '--branch-name', 'main', '--job-id', job.jobId, '--output', 'json']);
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = JSON.parse(
      aws(['amplify', 'get-job', '--app-id', appId, '--branch-name', 'main', '--job-id', job.jobId, '--output', 'json'], true),
    ).job.summary.status as string;
    process.stdout.write(`  ${status}\n`);
    if (status === 'SUCCEED') return;
    if (['FAILED', 'CANCELLED'].includes(status)) throw new Error(`Amplify deployment ${status}`);
  }
  throw new Error('Timed out waiting for the Amplify deployment');
}

// ---------------------------------------------------------------- S3 + CloudFront

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
