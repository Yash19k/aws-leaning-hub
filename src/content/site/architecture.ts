import type { DiagramSource } from '../../components/diagram/DiagramContext';

/** Architecture of this website itself (infra/template.yaml). Shown on /how-this-site-works. */
export const siteArchitecture: DiagramSource = {
  slug: 'this-site',
  githubUrl: 'https://github.com/Yash19k/aws-leaning-hub',
  githubBranch: 'main',
  services: [
    {
      serviceSlug: 'cloudfront',
      roleInThisProject:
        'Serves the site over HTTPS from edge locations near each visitor, caches files, and turns any unknown path back into index.html so deep links work.',
      analogy: 'A chain of local libraries that keep copies of the most-read books, so nobody waits for the head office.',
      whyNotAlternative:
        'The S3 website endpoint is HTTP only and would need a public bucket. CloudFront gives HTTPS, caching and a private bucket.',
    },
    {
      serviceSlug: 's3',
      roleInThisProject: 'Stores the built files (HTML, JS, CSS, images) in a private bucket that only CloudFront can read.',
      analogy: 'The warehouse behind the shop: customers never walk in, the shop staff fetch what they need.',
      whyNotAlternative: 'A server running 24/7 would cost money even with zero visitors. S3 charges only for storage and requests.',
    },
    {
      serviceSlug: 'iam',
      roleInThisProject:
        'Holds a deploy role that GitHub Actions can assume with a short-lived OIDC token. It may only sync this bucket and invalidate this distribution.',
      analogy: 'A visitor badge printed for one delivery, which stops working an hour later.',
      whyNotAlternative: 'Long-lived access keys stored in GitHub secrets can leak and never expire. OIDC needs no stored keys at all.',
    },
  ],
  architecture: {
    nodes: [
      {
        id: 'visitor',
        kind: 'browser',
        label: 'Your browser',
        sublabel: 'you, right now',
        position: { x: 0, y: 150 },
        mobilePosition: { x: 0, y: 0 },
        description: 'Asks for a page like /projects/dropvault over HTTPS. It never talks to S3 directly.',
      },
      {
        id: 'cloudfront',
        kind: 'service',
        serviceSlug: 'cloudfront',
        label: 'CloudFront',
        sublabel: 'edge cache + HTTPS',
        position: { x: 290, y: 150 },
        mobilePosition: { x: 0, y: 150 },
      },
      {
        id: 'urlfn',
        kind: 'service',
        serviceSlug: 'cloudfront',
        label: 'URL rewrite',
        sublabel: 'CloudFront Function',
        position: { x: 290, y: 0 },
        mobilePosition: { x: 200, y: 0 },
        description:
          'A tiny function that runs at the edge on every request. It turns /projects/dropvault into /projects/dropvault/index.html, the page the build pre-rendered for that route.',
      },
      {
        id: 's3',
        kind: 'service',
        serviceSlug: 's3',
        label: 'S3 bucket',
        sublabel: 'private, OAC only',
        position: { x: 580, y: 150 },
        mobilePosition: { x: 0, y: 300 },
      },
      {
        id: 'github',
        kind: 'external',
        icon: 'github',
        label: 'GitHub Actions',
        sublabel: 'on push to main',
        position: { x: 580, y: 320 },
        mobilePosition: { x: 200, y: 300 },
        description: 'Builds the site on every push to main, then deploys it using the IAM role. No AWS keys are stored in GitHub.',
      },
      {
        id: 'iam',
        kind: 'service',
        serviceSlug: 'iam',
        label: 'Deploy role',
        sublabel: 'GitHub OIDC',
        position: { x: 290, y: 320 },
        mobilePosition: { x: 200, y: 450 },
      },
    ],
    edges: [
      { id: 'e-visit', source: 'visitor', target: 'cloudfront', label: 'GET /projects/dropvault' },
      { id: 'e-rewrite', source: 'cloudfront', target: 'urlfn', label: 'viewer request' },
      { id: 'e-origin', source: 'cloudfront', target: 's3', label: 'GetObject, signed by OAC' },
      { id: 'e-assume', source: 'github', target: 'iam', label: 'AssumeRoleWithWebIdentity' },
      { id: 'e-sync', source: 'github', target: 's3', label: 'aws s3 sync dist/' },
      { id: 'e-invalidate', source: 'github', target: 'cloudfront', label: 'create-invalidation', style: 'dashed' },
    ],
  },
  flows: [
    {
      id: 'open-page',
      title: 'You open this page',
      summary: 'From typing the URL to pixels on your screen.',
      steps: [
        {
          edgeId: 'e-visit',
          title: 'Your browser asks CloudFront',
          explanation: 'DNS sends you to the nearest CloudFront edge location. The connection is HTTPS, using a certificate CloudFront provides.',
          payloadExample: 'GET https://<distribution>.cloudfront.net/projects/dropvault',
        },
        {
          edgeId: 'e-rewrite',
          title: 'A CloudFront Function fixes the path',
          explanation: 'The path has no file extension, so the function appends /index.html. This runs at the edge in well under a millisecond.',
          payloadExample: { before: '/projects/dropvault', after: '/projects/dropvault/index.html' },
        },
        {
          nodeId: 'cloudfront',
          title: 'Is it already in the cache?',
          explanation: 'If another visitor near you asked for this file recently, CloudFront answers straight from the edge and skips S3 entirely.',
        },
        {
          edgeId: 'e-origin',
          title: 'Cache miss: fetch from the private bucket',
          explanation: 'Origin Access Control signs the request, so S3 can check it really came from this distribution. Nobody else can read the bucket.',
        },
        {
          edgeId: 'e-origin',
          reverse: true,
          title: 'S3 returns the file with cache rules',
          explanation: 'index.html says "always check for a newer copy"; hashed JS and CSS files say "keep me for a year", because their names change on every build.',
          payloadExample: { 'Cache-Control': 'public, max-age=31536000, immutable', key: 'assets/index-3f9a1c.js' },
        },
        {
          edgeId: 'e-visit',
          reverse: true,
          title: 'The page arrives',
          explanation: 'CloudFront keeps a copy at the edge for the next visitor, and React takes over. From now on, clicking around happens in your browser.',
        },
      ],
    },
    {
      id: 'deploy',
      title: 'Deploying a new version',
      summary: 'What happens when someone pushes to main.',
      steps: [
        {
          nodeId: 'github',
          title: 'GitHub Actions builds the site',
          explanation: 'It runs npm ci, the content validator and vite build. If anything fails, nothing is deployed.',
        },
        {
          edgeId: 'e-assume',
          title: 'Swap an OIDC token for temporary credentials',
          explanation: 'GitHub signs a token saying "this is repo X on branch main". IAM checks the trust policy and hands back credentials that expire within the hour.',
          payloadExample: { sub: 'repo:<owner>/aws-learning-hub:ref:refs/heads/main', aud: 'sts.amazonaws.com' },
        },
        {
          edgeId: 'e-sync',
          title: 'Upload only what changed',
          explanation: 'aws s3 sync compares files and uploads the new ones, with long cache headers for hashed assets and short ones for HTML.',
        },
        {
          edgeId: 'e-invalidate',
          title: 'Tell CloudFront to forget old HTML',
          explanation: 'An invalidation clears cached HTML pages at every edge, so the next visitor gets the new version. Hashed assets never need invalidating.',
          payloadExample: { Paths: { Quantity: 2, Items: ['/index.html', '/*/index.html'] } },
        },
      ],
    },
  ],
  codePeeks: [
    {
      id: 'rewrite-fn',
      nodeId: 'urlfn',
      title: 'The URL rewrite function',
      language: 'javascript',
      filePath: 'infra/template.yaml',
      code: `function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.split('/').pop().indexOf('.') === -1) {
    request.uri = uri + '/index.html';
  }
  return request;
}`,
      explanation:
        'Runs at the edge before CloudFront looks in its cache. If the last part of the path has no dot (no file extension), it is a page, so the function points it at that page\'s pre-rendered `index.html`.',
      highlightLines: [6, 7],
    },
    {
      id: 'bucket-policy',
      nodeId: 's3',
      title: 'Only this distribution may read the bucket',
      language: 'yaml',
      filePath: 'infra/template.yaml',
      code: `- Sid: AllowCloudFrontOacRead
  Effect: Allow
  Principal: { Service: cloudfront.amazonaws.com }
  Action: s3:GetObject
  Resource: !Sub '\${SiteBucket.Arn}/*'
  Condition:
    StringEquals:
      AWS:SourceArn: !Sub 'arn:aws:cloudfront::\${AWS::AccountId}:distribution/\${Distribution}'`,
      explanation:
        'The bucket blocks all public access. This one statement lets the CloudFront service read objects, but only when the request comes from **this** distribution (the `AWS:SourceArn` condition). Nobody can list the bucket.',
      highlightLines: [6, 7, 8],
    },
    {
      id: 'spa-fallback',
      nodeId: 'cloudfront',
      title: 'Deep links: turn errors into the app',
      language: 'yaml',
      filePath: 'infra/template.yaml',
      code: `CustomErrorResponses:
  - ErrorCode: 403
    ResponseCode: 200
    ResponsePagePath: /index.html
    ErrorCachingMinTTL: 10
  - ErrorCode: 404
    ResponseCode: 200
    ResponsePagePath: /index.html
    ErrorCachingMinTTL: 10`,
      explanation:
        'S3 says 403 for a key that does not exist (because nobody may list the bucket). CloudFront swaps that error for the app\'s `index.html` with a 200, and React Router then shows the right page, or the site\'s own 404 page.',
      highlightLines: [2, 3, 4],
    },
    {
      id: 'oidc-trust',
      nodeId: 'iam',
      title: 'Who may assume the deploy role',
      language: 'yaml',
      filePath: 'infra/template.yaml',
      code: `Action: sts:AssumeRoleWithWebIdentity
Condition:
  StringEquals:
    'token.actions.githubusercontent.com:aud': sts.amazonaws.com
  StringLike:
    'token.actions.githubusercontent.com:sub':
      - !Sub 'repo:\${GitHubRepo}:ref:refs/heads/\${GitHubBranch}'
      - !Sub 'repo:\${GitHubRepo}:environment:production'`,
      explanation:
        'GitHub signs a token describing the workflow run. IAM only hands out credentials if the token is meant for AWS (`aud`) and comes from this repository\'s main branch or its `production` environment (`sub`). Forks and other branches are refused. Gotcha: a job that uses a GitHub environment gets the `environment:` subject, not the branch one, which is why both are listed.',
      highlightLines: [6, 7, 8],
    },
  ],
};
