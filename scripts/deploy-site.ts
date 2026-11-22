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
  const appId = outputs.AmplifyAppId;
  // Stacks created before the site branch existed only have "main".
  const siteBranch = outputs.AmplifySiteBranch ?? 'main';
  console.log(`Deploying dist/ to Amplify app ${appId}, branch ${siteBranch} (stack ${STACK}, ${REGION})\n`);
  await deployToAmplify(appId, siteBranch, zipDir(DIST));
  const redirectBranch = outputs.AmplifyRedirectBranch;
  if (redirectBranch && redirectBranch !== siteBranch) {
    console.log(`\nPublishing the redirect page to branch ${redirectBranch}\n`);
    await deployToAmplify(appId, redirectBranch, zipFiles([{ name: 'index.html', data: Buffer.from(redirectPage(outputs.SiteUrl)) }]));
  }
  console.log(`Done. Site: ${outputs.SiteUrl}`);
  process.exit(0);
}

// ---------------------------------------------------------------- Amplify Hosting (manual deployment)

/**
 * The page served on the old address. The app's SPA rule serves it for every path, and it forwards
 * to the same path, query and #hash on the site (a plain link if JavaScript is off).
 */
function redirectPage(siteUrl: string): string {
  const url = siteUrl.replace(/\/+$/, '');
  const host = new URL(url).host;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>AWS Learning Hub has moved</title>
<link rel="canonical" href="${url}/">
<script>location.replace(${JSON.stringify(url)} + location.pathname + location.search + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0; url=${url}/"></noscript>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; font: 16px/1.5 system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
  a { color: #0d9488; font-weight: 600; }
  @media (prefers-color-scheme: dark) { body { background: #0b1220; color: #e2e8f0; } a { color: #2dd4bf; } }
</style>
</head>
<body>
<p>AWS Learning Hub has moved to <a href="${url}/">${host}</a>.</p>
</body>
</html>
`;
}

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
  return zipFiles(files.map((file) => ({ name: path.relative(dir, file).split(path.sep).join('/'), data: readFileSync(file) })));
}

/** Minimal zip writer (deflate), so the script needs no extra tools on any OS. */
function zipFiles(files: { name: string; data: Buffer }[]): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = file.data;
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

async function deployToAmplify(appId: string, branch: string, zip: Buffer) {
  const job = JSON.parse(aws(['amplify', 'create-deployment', '--app-id', appId, '--branch-name', branch, '--output', 'json']));
  const res = await fetch(job.zipUploadUrl, { method: 'PUT', body: new Uint8Array(zip), headers: { 'Content-Type': 'application/zip' } });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  console.log(`Uploaded ${(zip.length / 1024 / 1024).toFixed(1)} MB`);
  aws(['amplify', 'start-deployment', '--app-id', appId, '--branch-name', branch, '--job-id', job.jobId, '--output', 'json']);
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = JSON.parse(
      aws(['amplify', 'get-job', '--app-id', appId, '--branch-name', branch, '--job-id', job.jobId, '--output', 'json'], true),
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
