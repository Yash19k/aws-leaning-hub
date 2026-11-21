import type { Project } from '../../../lib/types';

/**
 * DropVault: file sharing with expiring links.
 * Real code: source-projects/dropvault (Terraform + Python 3.13 Lambdas + React 19 web app).
 */
const project: Project = {
  slug: 'dropvault',
  title: 'DropVault: file sharing with expiring links',
  tagline:
    'Upload a file, share it by link, QR code or email, and decide when the link stops working. Your first real serverless app, deployed with one Terraform command.',
  difficulty: 'beginner',
  estimatedBuildTime: '3-4 hours',
  freeTierFriendly: {
    value: true,
    note: 'The README estimates about $0 to $1 a month at demo scale. Almost everything is pay-per-request; the main fixed cost is 13 CloudWatch alarms, about $0.10 each beyond the free 10. TODO(verify)',
  },
  heroImage: {
    src: '/projects/dropvault/files-light.png',
    alt: 'The DropVault file list: five files, each with buttons to download, email, copy a link, show a QR code and delete.',
  },
  liveDemoUrl: 'https://main.d1m5hv4o1y7mm2.amplifyapp.com',
  githubUrl: 'https://github.com/Yash19k/dropvault',
  githubBranch: 'main',
  sourceFolder: 'dropvault',
  iac: 'terraform',
  stack: ['Python 3.13', 'Terraform', 'React 19', 'Vite', 'Tailwind CSS 4', 'boto3'],
  order: 1,
  whatYouLearn: [
    'Upload straight from the browser to **S3** with presigned URLs, so file bytes never pass through Lambda',
    'Build a REST API with **API Gateway** and guard it with a **Lambda authorizer**',
    'Keep files, short links and counters in one **DynamoDB** table, found by key or by a sparse index',
    'Make download limits that two people clicking at once can\'t break, with a conditional write',
    'Send email from your app with **SES**, and understand the SES sandbox',
    'Clean up abandoned uploads on their own with DynamoDB **TTL** and **Streams**',
    'Create, update and delete the whole stack with **Terraform**',
  ],
  services: [
    {
      serviceSlug: 'api-gateway',
      roleInThisProject:
        'One REST API with every route under `/v1`: sign-up and sign-in, the file routes (checked by the Lambda authorizer first), and the public `/v1/d/{code}` route that shared links open.',
      analogy:
        'A receptionist who checks your ID badge before sending you to an office, but lets anyone into the public lobby to collect a parcel.',
      whyNotAlternative:
        'A Lambda function URL serves one function. API Gateway gives one address for 12 functions, a shared authorizer whose answer it caches, and stage-wide throttling (50 requests a second here).',
    },
    {
      serviceSlug: 'lambda',
      roleInThisProject:
        'Twelve small Python 3.13 functions: the auth service, the token check, one per file action, the short-link redirect, the upload cleanup, and (extra credit) admin and monitor.',
      analogy: 'A team of specialist chefs, each cooking one dish, and only when an order comes in.',
      whyNotAlternative:
        'An always-on server (EC2) would cost money all night while nobody shares anything. These functions cost nothing while idle.',
    },
    {
      serviceSlug: 'dynamodb',
      roleInThisProject:
        'Two on-demand tables. `users` is keyed by email. The files table holds file records, short links (`QR#<code>`) and storage counters, with two sparse indexes, TTL and a stream turned on.',
      analogy:
        'A filing cabinet that finds any drawer by its label instantly, with a shredder (TTL) that empties drawers on their expiry date by itself.',
      whyNotAlternative:
        'A relational database (RDS) runs, and bills, around the clock. DynamoDB on-demand charges per request and has TTL and change streams built in.',
    },
    {
      serviceSlug: 's3',
      roleInThisProject:
        'One private bucket holds every file at `{user_id}/{file_id}/{file_name}`. Browsers upload and download directly with presigned URLs; nothing in it is public.',
      analogy:
        'A locker room with no public door. A presigned URL is a pass that opens one locker, for a few minutes.',
      whyNotAlternative:
        'Pushing files through Lambda would hit its request size limit (about 6 MB TODO(verify)) and pay for Lambda time on every byte. S3 takes the bytes directly, up to 5 TiB per object.',
    },
    {
      serviceSlug: 'ses',
      roleInThisProject:
        'Sends the share emails, one per recipient, each with that person\'s own short link, from the `sender_email` you verify.',
      analogy: "Your app's own post office counter, which only accepts letters from an address it has checked.",
      whyNotAlternative:
        'Talking to a mail server yourself means storing a password in the app. SES is called with the function\'s IAM role, and Terraform registers the sender for you.',
    },
    {
      serviceSlug: 'amplify',
      roleInThisProject:
        'Hosts the built React app over HTTPS at `https://main.<app-id>.amplifyapp.com`. `deploy.sh` uploads the build as a zip file.',
      analogy: 'A ready-made shop front: you bring the goods (the built site) and it opens the doors.',
      whyNotAlternative:
        'S3 + CloudFront is the classic setup and is one setting away (`web_hosting = "cloudfront"`), but brand-new AWS accounts must be verified by AWS Support before they can create CloudFront distributions.',
    },
    {
      serviceSlug: 'iam',
      roleInThisProject:
        'One role shared by the app\'s functions, limited to this app\'s bucket, table, stream and sender address. The admin and monitor functions (extra credit) get their own roles.',
      analogy: 'Key cards: the file functions\' card opens only this app\'s doors, never the whole building.',
      whyNotAlternative:
        'Giving every function full admin rights is quicker to write, but then one bug or leaked credential could touch everything in your account.',
    },
    {
      serviceSlug: 'cloudwatch',
      roleInThisProject:
        'Keeps every function\'s logs for 14 days. Extra credit: 13 alarms (Lambda errors, API 5xx, a 4xx spike) and a log subscription that passes `ERROR` lines to the monitor function.',
      analogy: 'The CCTV room and smoke alarms for your app.',
      whyNotAlternative:
        'Lambda already writes its logs to CloudWatch, so there is nothing to install. Without logs you would be debugging blind.',
    },
    {
      serviceSlug: 'sns',
      roleInThisProject:
        'Extra credit: one alerts topic. The alarms, the monitor function and a failed `deploy.sh` publish to it, and it emails your `alert_email`.',
      analogy: 'A group announcement: post once and everyone who subscribed gets it.',
      whyNotAlternative:
        'Each piece could send its own email, but one topic gives them a single place to publish, and you confirm just one subscription.',
    },
    {
      serviceSlug: 'eventbridge',
      roleInThisProject:
        'Extra credit: a schedule rule runs the monitor function\'s health check every `health_check_minutes` (5 by default).',
      analogy: 'An alarm clock that rings every 5 minutes and wakes up the night watchman.',
      whyNotAlternative:
        'A cron job needs a machine that is always on. An EventBridge schedule has no server at all.',
    },
    {
      serviceSlug: 'kms',
      roleInThisProject:
        'Optional (`kms_mode`). The default `s3` uses free SSE-S3 encryption. `shared` makes one KMS key the bucket default; `per_user` creates one key per user on their first upload.',
      analogy: 'A bank vault for keys: you never hold the key, you ask the vault to lock or unlock for you.',
      whyNotAlternative:
        'SSE-S3 already encrypts every file at rest for free. A customer-managed KMS key costs about $1 a month TODO(verify), so it is worth it only for per-user isolation or key audit trails.',
    },
    {
      serviceSlug: 'cloudfront',
      roleInThisProject:
        'Optional: with `web_hosting = "cloudfront"` the React app is served from a private S3 bucket through CloudFront instead of Amplify.',
      analogy: 'Local branches of a library, so visitors pick up the site from somewhere close by.',
      whyNotAlternative:
        'It is off by default only because new AWS accounts cannot create CloudFront distributions until AWS Support verifies them. Amplify works on day one.',
    },
  ],
  architecture: {
    nodes: [
      {
        id: 'amplify',
        kind: 'service',
        serviceSlug: 'amplify',
        label: 'Amplify Hosting',
        sublabel: 'the React app',
        position: { x: 0, y: 110 },
        mobilePosition: { x: 0, y: 130 },
      },
      {
        id: 'browser',
        kind: 'browser',
        icon: 'laptop',
        label: 'Your browser',
        sublabel: 'React 19 app',
        position: { x: 0, y: 220 },
        mobilePosition: { x: 0, y: 260 },
        description:
          'The DropVault web app, used by the person sharing files. It signs you in, uploads straight to S3, and makes links, QR codes and share emails.',
      },
      {
        id: 'recipient',
        kind: 'user',
        icon: 'smartphone',
        label: 'Recipient',
        sublabel: 'opens a short link',
        position: { x: 0, y: 440 },
        mobilePosition: { x: 0, y: 390 },
        description:
          'Anyone you share with. They need no account: they open `/v1/d/{code}` from an email, a pasted link or a QR code, and download from S3.',
      },
      {
        id: 'api',
        kind: 'service',
        serviceSlug: 'api-gateway',
        label: 'API Gateway',
        sublabel: 'REST API, stage dev',
        position: { x: 215, y: 220 },
        mobilePosition: { x: 200, y: 390 },
      },
      {
        id: 'authorizer',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: authorizer',
        sublabel: 'authorizer.py',
        position: { x: 215, y: 110 },
        mobilePosition: { x: 200, y: 130 },
        description:
          'Runs before every protected route. Checks the token\'s HMAC signature and expiry, then that the account still exists, isn\'t suspended and hasn\'t signed out. API Gateway caches its answer for 5 minutes.',
      },
      {
        id: 'users-table',
        kind: 'service',
        serviceSlug: 'dynamodb',
        label: 'Users table',
        sublabel: 'key: email',
        position: { x: 215, y: 0 },
        mobilePosition: { x: 0, y: 0 },
        description:
          'One item per account: user_id, name, PBKDF2 password hash, token_version (bumped to end every session), and optional role and suspended_at.',
      },
      {
        id: 'auth',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: auth',
        sublabel: 'auth_service.py',
        position: { x: 430, y: 110 },
        mobilePosition: { x: 200, y: 0 },
        description:
          'The built-in auth service: sign-up, sign-in, refresh and sign-out. Hashes passwords with PBKDF2-SHA256 and issues HMAC-signed tokens that carry their own expiry, so no sessions are stored.',
      },
      {
        id: 'links-fn',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: links',
        sublabel: 'qr_link.py',
        position: { x: 430, y: 220 },
        mobilePosition: { x: 0, y: 910 },
        description:
          'Short links: creates them (copy link, QR code), lists them with download stats, turns them off, and answers the public `/v1/d/{code}` with a fresh 5-minute download URL.',
      },
      {
        id: 'files-fn',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambdas: file routes',
        sublabel: 'upload, complete, list, share...',
        position: { x: 430, y: 330 },
        mobilePosition: { x: 200, y: 650 },
        description:
          'Six functions behind `/v1/users/{user_id}/files`: start an upload (and hand out part URLs), complete it, list files, download your own file, delete, and share by email.',
      },
      {
        id: 'bucket',
        kind: 'service',
        serviceSlug: 's3',
        label: 'Files bucket',
        sublabel: 'private, presigned only',
        position: { x: 215, y: 440 },
        mobilePosition: { x: 0, y: 520 },
      },
      {
        id: 'files-table',
        kind: 'service',
        serviceSlug: 'dynamodb',
        label: 'Files table',
        sublabel: 'files, links, usage',
        position: { x: 645, y: 330 },
        mobilePosition: { x: 200, y: 780 },
        description:
          'Keyed by `file_id`. Holds file records, short links (`QR#<code>`), storage counters (`USAGE#<user_id>`) and more. Indexes `user-files` and `file-links` avoid scans; TTL and a stream drive the cleanup.',
      },
      {
        id: 'cleanup',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: cleanup',
        sublabel: 'cleanup.py',
        position: { x: 645, y: 440 },
        mobilePosition: { x: 0, y: 650 },
        description:
          'Woken by the files table\'s stream only when TTL deletes an unfinished upload. Aborts the multipart upload or deletes the partial object, so you stop paying for it.',
      },
      {
        id: 'ses',
        kind: 'service',
        serviceSlug: 'ses',
        label: 'SES',
        sublabel: 'share emails',
        position: { x: 645, y: 220 },
        mobilePosition: { x: 200, y: 910 },
      },
      {
        id: 'alerts',
        kind: 'service',
        serviceSlug: 'cloudwatch',
        label: 'Alarms + alerts',
        sublabel: 'extra credit',
        position: { x: 645, y: 110 },
        mobilePosition: { x: 0, y: 1040 },
        description:
          'Extra credit. Every function logs to CloudWatch. `ERROR` lines go to a monitor Lambda, which also runs a health check on an EventBridge schedule (every 5 minutes); CloudWatch alarms watch Lambda errors and API 5xx. All of it emails you through one SNS topic.',
      },
    ],
    edges: [
      { id: 'browser-amplify', source: 'browser', target: 'amplify', label: 'load the React app' },
      { id: 'browser-api', source: 'browser', target: 'api', label: 'REST + Bearer token' },
      { id: 'browser-bucket', source: 'browser', target: 'bucket', label: 'presigned PUT / GET (bytes)' },
      { id: 'recipient-api', source: 'recipient', target: 'api', label: 'GET /v1/d/{code}' },
      { id: 'recipient-bucket', source: 'recipient', target: 'bucket', label: 'follow redirect to S3' },
      { id: 'api-authorizer', source: 'api', target: 'authorizer', label: 'check token (cached 5 min)' },
      { id: 'authorizer-users', source: 'authorizer', target: 'users-table', label: 'GetItem: still active?' },
      { id: 'api-auth', source: 'api', target: 'auth', label: '/v1/users, /v1/login' },
      { id: 'auth-users', source: 'auth', target: 'users-table', label: 'PutItem / GetItem' },
      { id: 'api-links', source: 'api', target: 'links-fn', label: '/qr, /links, /d/{code}' },
      { id: 'api-files', source: 'api', target: 'files-fn', label: '/v1/users/{user_id}/files...' },
      { id: 'links-table', source: 'links-fn', target: 'files-table', label: 'QR#<code> items' },
      { id: 'files-fn-table', source: 'files-fn', target: 'files-table', label: 'file records, usage' },
      { id: 'files-bucket', source: 'files-fn', target: 'bucket', label: 'multipart, HeadObject, delete' },
      { id: 'files-ses', source: 'files-fn', target: 'ses', label: 'SendEmail' },
      { id: 'table-cleanup', source: 'files-table', target: 'cleanup', label: 'stream: TTL deletions', style: 'dashed' },
      { id: 'cleanup-bucket', source: 'cleanup', target: 'bucket', label: 'abort / delete parts' },
      { id: 'links-alerts', source: 'links-fn', target: 'alerts', label: 'ERROR log lines', style: 'dashed' },
    ],
  },
  flows: [
    {
      id: 'sign-up',
      title: 'Signing up',
      summary: 'An account and three signed tokens, with no session stored anywhere.',
      steps: [
        {
          edgeId: 'browser-amplify',
          title: 'The app loads',
          explanation:
            'The React app\'s files come from Amplify Hosting. The API address was baked in when `deploy.sh` built it (`VITE_AUTH_URL`).',
          payloadExample: 'GET https://main.<app-id>.amplifyapp.com/signup',
        },
        {
          edgeId: 'browser-api',
          title: 'You press Sign up',
          explanation:
            'The app posts your name, email and password. This route has no authorizer: you can\'t have a token before you have an account.',
          payloadExample: { full_name: 'Asha Rao', email: 'asha@example.com', password: '********' },
        },
        {
          edgeId: 'api-auth',
          title: 'API Gateway calls the auth Lambda',
          explanation:
            'With a Lambda proxy integration, the whole HTTP request becomes the `event`. `auth_service.py` picks sign-up by looking at the method and path.',
          payloadExample: { httpMethod: 'POST', path: '/v1/users', body: '{"full_name": "Asha Rao", ...}' },
        },
        {
          nodeId: 'auth',
          title: 'Check and hash',
          explanation:
            'It checks the email format and an 8+ character password, then hashes the password with PBKDF2-SHA256, 200,000 rounds. Slow on purpose: it makes guessing stolen hashes expensive.',
        },
        {
          edgeId: 'auth-users',
          title: 'Save the account',
          explanation:
            'A PutItem with `attribute_not_exists(email)`, so signing up twice with one email returns 409 instead of overwriting the first account.',
          payloadExample: {
            email: 'asha@example.com',
            user_id: '6f1c2b9e-...',
            name: 'Asha Rao',
            password: '<salt>$<pbkdf2 hash>',
            created_at: 1795255200,
            last_login_at: 1795255200,
            login_count: 1,
          },
        },
        {
          nodeId: 'auth',
          title: 'Sign three tokens',
          explanation:
            'Each token is JSON claims plus an HMAC-SHA256 signature made with a secret only the auth Lambda and the authorizer know. ID and access tokens last 1 hour, the refresh token 30 days.',
          payloadExample: { sub: '6f1c2b9e-...', email: 'asha@example.com', name: 'Asha Rao', iat: 1795255200, ver: 0, typ: 'id', exp: 1795258800 },
        },
        {
          edgeId: 'browser-api',
          reverse: true,
          title: 'You are signed in',
          explanation:
            'Status 201 with the tokens. The app keeps them in localStorage and swaps the refresh token for new ones a minute before they expire.',
          payloadExample: {
            id_token: 'eyJzdWIiOiI2ZjFj....Qk3x',
            access_token: '...',
            refresh_token: '...',
            token_type: 'Bearer',
            expires_in: 3600,
            role: 'user',
            user_id: '6f1c2b9e-...',
            email: 'asha@example.com',
          },
        },
      ],
    },
    {
      id: 'upload',
      title: 'Uploading a file',
      summary: 'Lambda hands out a presigned URL; the bytes go straight to S3.',
      steps: [
        {
          edgeId: 'browser-api',
          title: 'Ask to upload',
          explanation:
            'The app sends only the file\'s name, type and size, with `Authorization: Bearer <id_token>`. No file bytes yet.',
          payloadExample: { file_name: 'lab-notes.pdf', content_type: 'application/pdf', size: 2400000 },
        },
        {
          edgeId: 'api-authorizer',
          title: 'Check the token first',
          explanation:
            'API Gateway runs the Lambda authorizer before the route. If it already said yes to this token in the last 5 minutes, the cached answer is reused and this hop is skipped.',
          payloadExample: { type: 'TOKEN', authorizationToken: 'Bearer eyJzdWIiOiI2ZjFj....Qk3x', methodArn: 'arn:aws:execute-api:ap-south-1:...:<api-id>/dev/POST/v1/users/6f1c.../files' },
        },
        {
          edgeId: 'authorizer-users',
          title: 'Is the account still active?',
          explanation:
            'After the signature and expiry check, it reads the account: it must exist, not be suspended, and its `token_version` must equal the token\'s `ver`.',
          payloadExample: { Key: { email: 'asha@example.com' } },
        },
        {
          edgeId: 'api-files',
          title: 'Allowed: the upload Lambda runs',
          explanation:
            'The authorizer returns an Allow policy plus who you are. API Gateway passes that to `upload_file.py` in `requestContext.authorizer`.',
          payloadExample: { requestContext: { authorizer: { user_id: '6f1c2b9e-...', name: 'Asha Rao', email: 'asha@example.com' } }, path: '/v1/users/6f1c2b9e-.../files' },
        },
        {
          nodeId: 'files-fn',
          title: 'Check, then sign a URL',
          explanation:
            'The path\'s user_id must be yours, the body must match a JSON schema, and the file must fit your 10 GB quota. For files up to 100 MB it signs one PUT URL, valid for 1 hour. Signing is local maths: no call to S3.',
        },
        {
          edgeId: 'files-fn-table',
          title: 'Save an UPLOADING record',
          explanation:
            'The record says `UPLOADING` and carries a `ttl` one day away. If the upload is never finished, that ttl is what triggers the cleanup.',
          payloadExample: {
            file_id: 'a3e9d4c0-...',
            user_id: '6f1c2b9e-...',
            file_name: 'lab-notes.pdf',
            content_type: 'application/pdf',
            size: 2400000,
            uploaded_at: '2026-11-21T10:15:00.482913+00:00',
            status: 'UPLOADING',
            ttl: 1795342500,
          },
        },
        {
          edgeId: 'browser-api',
          reverse: true,
          title: 'The app gets the upload URL',
          explanation: 'Status 201 with the presigned URL. Bigger files get `upload_type: "multipart"` with a part size and count instead.',
          payloadExample: {
            file_id: 'a3e9d4c0-...',
            status: 'UPLOADING',
            upload_type: 'single',
            upload_headers: {},
            upload_url: 'https://enclave-dev-files-123456789012.s3.ap-south-1.amazonaws.com/6f1c.../a3e9.../lab-notes.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Signature=...',
          },
        },
        {
          edgeId: 'browser-bucket',
          title: 'Bytes go straight to S3',
          explanation:
            'The browser PUTs the file to the URL with the same Content-Type and shows live progress. Over 100 MB, it sends 16 MB+ parts, four at a time, retrying each part.',
          payloadExample: 'PUT <upload_url>\nContent-Type: application/pdf\n\n<2.4 MB of file bytes>',
        },
        {
          edgeId: 'browser-api',
          title: 'Finish the upload',
          explanation:
            '`POST .../complete` asks S3 for the real size (HeadObject), adds it to your usage with a conditional update, marks the file READY and removes the ttl.',
          payloadExample: { file_id: 'a3e9d4c0-...', status: 'READY', size: 2400000 },
        },
      ],
    },
    {
      id: 'share',
      title: 'Sharing a link, QR code or email',
      summary: 'Every share is a short code in DynamoDB, not a long S3 URL.',
      steps: [
        {
          edgeId: 'browser-api',
          title: 'Choose how long and how many',
          explanation:
            'For a link or QR code the app posts to `.../qr`: how long it works (15 minutes to 7 days, or "never") and an optional download limit.',
          payloadExample: { expires_in: 86400, max_downloads: 3, channel: 'qr' },
        },
        {
          edgeId: 'api-links',
          title: 'The links Lambda checks it',
          explanation:
            '`expires_in` must be one of 900, 3600, 21600, 86400, 604800 or "never". The file must be yours and READY, or you get 404 or 409.',
        },
        {
          nodeId: 'links-fn',
          title: 'Make a short code',
          explanation:
            '`secrets.token_urlsafe(9)` gives a 12-character code with about 72 bits of randomness. A presigned URL would be about 1,500 characters: too dense for a QR code.',
          payloadExample: 'Xk2p9vQa7LmR',
        },
        {
          edgeId: 'links-table',
          title: 'Store the link',
          explanation:
            'The link is its own item. Its `ttl` is 30 days after expiry, so the stats stay visible for a while before DynamoDB deletes it.',
          payloadExample: {
            file_id: 'QR#Xk2p9vQa7LmR',
            kind: 'qr_link',
            target_file_id: 'a3e9d4c0-...',
            owner_id: '6f1c2b9e-...',
            created_at: 1795256400000,
            channel: 'qr',
            downloads: 0,
            max_downloads: 3,
            expires_at: 1795342800,
            ttl: 1797934800,
          },
        },
        {
          edgeId: 'browser-api',
          reverse: true,
          title: 'Show the QR code',
          explanation: 'The reply holds the short URL. The browser draws the QR code itself (the `qrcode.react` package).',
          payloadExample: {
            short_url: 'https://<api-id>.execute-api.ap-south-1.amazonaws.com/dev/v1/d/Xk2p9vQa7LmR',
            expires_at: 1795342800,
            max_downloads: 3,
          },
        },
        {
          edgeId: 'browser-api',
          title: 'Or: share by email',
          explanation: 'To email people instead, the app posts up to 10 addresses to `.../share`.',
          payloadExample: { share_with: ['ravi@example.com'], expires_in: 86400, max_downloads: null },
        },
        {
          edgeId: 'api-files',
          title: 'The share Lambda runs',
          explanation:
            '`share_file.py` validates the list, then makes one short link per recipient (channel `email`), so each person\'s downloads are counted and can be turned off separately.',
        },
        {
          edgeId: 'files-ses',
          title: 'SES sends each email',
          explanation:
            'One SendEmail per person from your verified `sender_email`. In the SES sandbox, unverified recipients are refused: that link is deleted and the reply lists the address under `failed`.',
          payloadExample: {
            file_id: 'a3e9d4c0-...',
            file_name: 'lab-notes.pdf',
            status: 'SHARED',
            expires_at: 1795342800,
            max_downloads: null,
            sent: ['ravi@example.com'],
            failed: [],
          },
        },
      ],
    },
    {
      id: 'open-link',
      title: 'Opening a shared link',
      summary: 'Checks, an atomic download count, then a fresh 5-minute S3 URL.',
      steps: [
        {
          edgeId: 'recipient-api',
          title: 'The recipient taps the link',
          explanation: 'A plain GET to `/v1/d/{code}`. This route is public: no token, no authorizer.',
          payloadExample: 'GET /dev/v1/d/Xk2p9vQa7LmR',
        },
        {
          edgeId: 'api-links',
          title: 'The links Lambda takes it',
          explanation: '`qr_link.py` first checks the code looks like one it would make (URL-safe, at most 32 characters) before touching the table.',
        },
        {
          edgeId: 'links-table',
          title: 'Load the link and its file',
          explanation: 'Two GetItem calls: `QR#Xk2p9vQa7LmR`, then the file it points to. An unknown code gets a friendly 404 page.',
        },
        {
          nodeId: 'links-fn',
          title: 'Is it still usable?',
          explanation:
            'In order: file deleted or not READY (404), link turned off (410), past `expires_at` (410 "Link expired", with the date), download limit used up (410). Otherwise: active.',
          payloadExample: 'active | file_missing | revoked | expired | limit_reached',
        },
        {
          edgeId: 'recipient-api',
          reverse: true,
          title: 'A limited link shows a button first',
          explanation:
            'Links with a download limit answer GET with a small page and a Download button (a POST). Email scanners and chat previews open links by themselves; a plain GET would use up a one-time link.',
          payloadExample: '200 text/html: "lab-notes.pdf", Download (2.3 MB), "This link can be used 3 more times."',
        },
        {
          edgeId: 'recipient-api',
          title: 'They press Download',
          explanation: 'The button posts the same URL. Links without a limit skip the page and go straight to the next step.',
          payloadExample: 'POST /dev/v1/d/Xk2p9vQa7LmR',
        },
        {
          edgeId: 'links-table',
          title: 'Count it, atomically',
          explanation:
            'One UpdateItem adds 1 to `downloads` only if `downloads < :max`. If two people press for the last download at once, DynamoDB lets just one write succeed.',
          payloadExample: {
            UpdateExpression: 'ADD downloads :one SET last_downloaded_at = :now, first_downloaded_at = if_not_exists(first_downloaded_at, :now)',
            ConditionExpression: 'attribute_exists(file_id) AND downloads < :max',
          },
        },
        {
          edgeId: 'recipient-api',
          reverse: true,
          title: 'Redirect to a fresh URL',
          explanation:
            'The Lambda signs a brand-new presigned GET that lives 5 minutes and answers 303 (302 for unlimited links) with it in the Location header.',
          payloadExample: { statusCode: 303, headers: { Location: 'https://enclave-dev-files-123456789012.s3.ap-south-1.amazonaws.com/6f1c.../a3e9.../lab-notes.pdf?response-content-disposition=attachment...&X-Amz-Expires=300&X-Amz-Signature=...', 'Cache-Control': 'no-store' } },
        },
        {
          edgeId: 'recipient-bucket',
          title: 'Download from S3',
          explanation:
            'The browser follows the redirect and downloads from the private bucket under the original file name. Lambda never touches the bytes.',
        },
      ],
    },
    {
      id: 'cleanup',
      title: 'An abandoned upload cleans itself up',
      summary: 'TTL deletes the record, the stream wakes a Lambda, the parts are thrown away.',
      steps: [
        {
          edgeId: 'browser-bucket',
          title: 'An upload starts, then stops',
          explanation:
            'A 2 GB video goes up in 16 MB parts, then the laptop dies. The parts already in S3 are invisible, but they are stored and billed.',
          payloadExample: 'PUT <part URL> (part 37 of 128) ... connection lost',
        },
        {
          nodeId: 'files-table',
          title: 'The record waits',
          explanation:
            'The record still says UPLOADING. Every batch of part URLs pushed its `ttl` a day ahead; with no activity, the day runs out.',
          payloadExample: { file_id: 'c71d0f2a-...', status: 'UPLOADING', upload_id: '2~fXk...', part_size: 16777216, part_count: 128, ttl: 1795342500 },
        },
        {
          nodeId: 'files-table',
          title: 'TTL deletes it',
          explanation:
            'Once `ttl` is in the past, DynamoDB\'s TTL process deletes the item in the background, usually within a few days of expiry. TODO(verify)',
        },
        {
          edgeId: 'table-cleanup',
          title: 'The deletion lands on the stream',
          explanation:
            'The stream records the removed item (OLD_IMAGE). A filter on the trigger passes only TTL deletions of UPLOADING records, so ordinary deletes never wake the Lambda.',
          payloadExample: {
            eventName: 'REMOVE',
            userIdentity: { type: 'Service', principalId: 'dynamodb.amazonaws.com' },
            dynamodb: { OldImage: { status: { S: 'UPLOADING' }, upload_id: { S: '2~fXk...' }, file_name: { S: 'trip.mp4' } } },
          },
        },
        {
          nodeId: 'cleanup',
          title: 'Double-check in code',
          explanation: '`cleanup.py` repeats the same checks itself and rebuilds the old item from DynamoDB\'s typed JSON with `TypeDeserializer`.',
        },
        {
          edgeId: 'cleanup-bucket',
          title: 'Abort and delete',
          explanation:
            'AbortMultipartUpload throws away the stored parts; DeleteObject removes a half-uploaded single file (no error if nothing is there).',
          payloadExample: { cleaned: 1 },
        },
        {
          nodeId: 'bucket',
          title: 'A safety net',
          explanation: 'An S3 lifecycle rule also aborts any multipart upload left incomplete for a day, in case the Lambda ever misses one.',
        },
      ],
    },
  ],
  whatIfs: [
    {
      id: 'guess-link',
      question: 'someone tries to guess a share link?',
      answer:
        'Codes come from `secrets.token_urlsafe(9)`: 12 characters, about 72 bits of randomness, so roughly 4.7 x 10^21 possible codes. Every guess is an HTTP request, and the API stage is throttled to 50 requests a second, so finding a live code by guessing is hopeless. Even a lucky guess only works until the link expires, runs out of downloads or is turned off.',
      relatedNodeIds: ['recipient', 'api', 'links-fn'],
    },
    {
      id: 'last-download',
      question: 'two people press Download for the last download at the same moment?',
      answer:
        'Only one wins. `record_download` adds 1 with the condition `downloads < :max`, and DynamoDB checks the condition and writes as one step per item. The second request fails the condition and sees the "Download limit reached" page. No locks or transactions needed.',
      relatedNodeIds: ['recipient', 'links-fn', 'files-table'],
    },
    {
      id: 'big-file',
      question: 'someone uploads a 5 GB video?',
      answer:
        'Over 100 MB, `upload_file.py` starts an S3 multipart upload and picks a part size: at least 16 MB and big enough to stay under S3\'s 10,000-part limit (about 320 parts here). The browser sends four parts at a time straight to S3, retrying each up to four times. Lambda never sees the bytes, so its size limit doesn\'t matter; your 10 GB quota still does.',
      relatedNodeIds: ['browser', 'files-fn', 'bucket'],
    },
    {
      id: 'tab-closed',
      question: 'I close the tab halfway through a big upload?',
      answer:
        'The app remembers the upload in `localStorage`. Add the same file again (same name, size and date) and it asks S3 which parts arrived and sends only the rest. If you never come back, the record\'s `ttl` runs out, DynamoDB deletes it, and the cleanup Lambda aborts the multipart upload so you stop paying for orphaned parts.',
      relatedNodeIds: ['browser', 'files-table', 'cleanup', 'bucket'],
    },
    {
      id: 'monthly-cost',
      question: 'I leave it running for a month?',
      answer:
        'The README puts it at about $0 to $1 a month for personal or demo use TODO(verify). Lambda, API Gateway and DynamoDB on-demand charge per request, and S3 storage is about $0.025 per GB-month TODO(verify). The steady cost is the 13 CloudWatch alarms, about $0.10 each beyond the free 10 TODO(verify). `kms_mode = "per_user"` adds about $1 per user per month TODO(verify).',
      relatedNodeIds: ['api', 'files-fn', 'files-table', 'bucket', 'alerts'],
    },
    {
      id: 'suspended-token',
      question: 'an admin suspends an account that still has a valid token?',
      answer:
        'Suspending (or signing out) bumps the account\'s `token_version`, and the authorizer rejects tokens whose `ver` no longer matches. But API Gateway caches the authorizer\'s yes for each token for up to `authorizer_cache_seconds` (300), so the old token can keep working for up to 5 minutes. Lower the setting for a faster cut-off, at the cost of more authorizer calls.',
      relatedNodeIds: ['api', 'authorizer', 'users-table'],
    },
  ],
  codePeeks: [
    {
      id: 'presigned-upload',
      nodeId: 'files-fn',
      title: 'Starting an upload: record first, presigned URL back',
      language: 'python',
      filePath: 'endpoints/upload-file/src/upload_file.py',
      code: `    file_id = str(uuid.uuid4())
    item = {
        'file_id': file_id, 'user_id': user_id, 'file_name': file_name,
        'content_type': content_type, 'size': size,
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
        'status': 'UPLOADING', 'ttl': int(time.time()) + ABANDON_AFTER,
    }
    params = {'Bucket': storage.bucket(), 'Key': storage.object_key(item), 'ContentType': content_type}
    ...
    response = {'file_id': file_id, 'status': 'UPLOADING'}
    if size > multipart_threshold():
        upload_id = storage.s3().create_multipart_upload(**params)['UploadId']
        part_size = part_size_for(size)
        item.update(upload_id=upload_id, part_size=part_size, part_count=math.ceil(size / part_size))
        response.update(upload_type='multipart', part_size=part_size, part_count=item['part_count'])
    else:
        ...
        response.update(upload_type='single', upload_headers=upload_headers,
                        upload_url=storage.presign_s3().generate_presigned_url(
                            'put_object', Params=params, ExpiresIn=3600))
    storage.table().put_item(Item=item)
    return 201, response`,
      explanation:
        'The new record starts as `UPLOADING` with a `ttl` one day out (`ABANDON_AFTER = 86400`), which is what makes abandoned uploads clean themselves up. Small files get one presigned PUT URL valid for an hour; files over 100 MB start an S3 multipart upload instead. `generate_presigned_url` signs locally with the function\'s credentials, so the browser can upload without ever holding AWS keys.',
      highlightLines: [6, 11, 18, 19, 20],
    },
    {
      id: 'authorizer',
      nodeId: 'authorizer',
      title: 'The Lambda authorizer: signature, then the account',
      language: 'python',
      filePath: 'endpoints/authorizer/src/authorizer.py',
      code: `def caller(token):
    '''(user_id, name, email) for a valid token, else None.'''
    if os.getenv('TOKEN_SECRET'):
        claims = tokens.verify(tokens.strip_bearer(token), ('id', 'access'))
        if not claims:
            return None
        if os.getenv('USERS_TABLE') and not accounts.session_valid(accounts.get_user(claims.get('email')), claims):
            return None
        return claims['sub'], claims.get('name', ''), claims.get('email', '')
    user_id, name, email = auth.resolve_user(token)
    return (user_id, name or '', email or '') if user_id else None
...
def lambda_handler(event, _context):
    user = caller((event or {}).get('authorizationToken'))
    if not user:
        # This exact message makes API Gateway answer 401 (any other is a 500).
        raise Exception('Unauthorized')
    user_id, name, email = user
    return {
        'principalId': user_id,
        ...
        'context': {'user_id': user_id, 'name': name, 'email': email},
    }`,
      explanation:
        'First the token\'s HMAC signature, type and expiry are checked with no database call. Then the account is read: `session_valid` turns away deleted, suspended or signed-out accounts. To say no, the function raises exactly `Unauthorized`, which API Gateway turns into a 401. To say yes, it returns a policy plus a `context` that every file Lambda receives as `requestContext.authorizer`.',
      highlightLines: [4, 7, 17, 22],
    },
    {
      id: 'follow-link',
      nodeId: 'links-fn',
      title: 'Following a short link',
      language: 'python',
      filePath: 'endpoints/qr-link/src/qr_link.py',
      code: `    item = storage.get_file(link['target_file_id'])
    state = links.status(link, item)
    if state != 'active':
        return unusable_page(state, link)
    if link.get('max_downloads') and event.get('httpMethod') != 'POST':
        return download_button_page(link, item)
    if not links.record_download(table, link):
        return unusable_page('limit_reached', link)
    return {'statusCode': 303 if event.get('httpMethod') == 'POST' else 302, 'body': '',
            'isBase64Encoded': False,
            'headers': {'Location': storage.presigned_download(item, REDIRECT_TTL), 'Cache-Control': 'no-store'}}`,
      explanation:
        'This is the whole public download path. Dead links get a readable page (expired, turned off, limit reached). Limited links make you press a button first, so link previews can\'t use them up. Then the download is counted and the visitor is redirected to a presigned GET that lives only `REDIRECT_TTL = 300` seconds. Because each visit signs a new URL, a link can work for 7 days, or forever.',
      highlightLines: [5, 7, 11],
    },
    {
      id: 'record-download',
      nodeId: 'files-table',
      title: 'A download counter nobody can race',
      language: 'python',
      filePath: 'endpoints/common/python/links.py',
      code: `def record_download(table, link):
    '''Count one download. False if the link has used up its download limit
       (checked atomically, so two people can't both take the last one).'''
    now = int(time.time())
    condition = 'attribute_exists(file_id)'
    values = {':one': 1, ':now': now}
    if link.get('max_downloads'):
        condition += ' AND downloads < :max'
        values[':max'] = int(link['max_downloads'])
    try:
        table.update_item(
            Key={'file_id': link['file_id']},
            UpdateExpression='ADD downloads :one SET last_downloaded_at = :now, '
                             'first_downloaded_at = if_not_exists(first_downloaded_at, :now)',
            ConditionExpression=condition,
            ExpressionAttributeValues=values)
    except table.meta.client.exceptions.ConditionalCheckFailedException:
        return False`,
      explanation:
        'Reading the count and then writing it back would let two requests both see "2 of 3 used" and both download. A conditional update does the check and the write in one step on the server: if `downloads < :max` is false, DynamoDB refuses the write and raises `ConditionalCheckFailedException`.',
      highlightLines: [8, 13, 15, 17],
    },
    {
      id: 'cleanup-filter',
      nodeId: 'cleanup',
      title: 'Waking the cleanup Lambda only when needed',
      language: 'hcl',
      filePath: 'terraform/cleanup.tf',
      code: `resource "aws_lambda_event_source_mapping" "cleanup" {
  event_source_arn                   = aws_dynamodb_table.files.stream_arn
  function_name                      = aws_lambda_function.fn["cleanup"].arn
  starting_position                  = "LATEST"
  batch_size                         = 25
  ...
  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName    = ["REMOVE"]
        userIdentity = { type = ["Service"], principalId = ["dynamodb.amazonaws.com"] }
        dynamodb     = { OldImage = { status = { S = ["UPLOADING"] } } }
      })
    }
  }`,
      explanation:
        'An event source mapping connects the table\'s stream to the Lambda. Without the filter, the function would run for every write to the table. With it, the function runs only for deletions made by DynamoDB itself (TTL) of records that were still `UPLOADING`.',
      highlightLines: [2, 10, 11, 12],
    },
    {
      id: 'private-bucket',
      nodeId: 'bucket',
      title: 'A bucket that is private, but browsers can still use',
      language: 'hcl',
      filePath: 'terraform/s3.tf',
      code: `resource "aws_s3_bucket_public_access_block" "files" {
  bucket                  = aws_s3_bucket.files.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
...
resource "aws_s3_bucket_cors_configuration" "files" {
  bucket = aws_s3_bucket.files.id
  cors_rule {
    allowed_methods = ["PUT", "GET"]
    # the hosted web app (web.tf) is always allowed, plus any extra origins
    allowed_origins = concat([local.web_url], var.allowed_origins)
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}`,
      explanation:
        'The public access block makes sure nothing in the bucket can ever be made public. CORS is a different thing: it tells browsers that JavaScript on your web app\'s address may PUT and GET here. A request still only works with a valid presigned URL.',
      highlightLines: [3, 4, 5, 6, 12, 14],
    },
  ],
  prerequisites: [
    'create-aws-account',
    'secure-your-account',
    'billing-alarm',
    'iam-user-and-keys',
    'install-tools',
    'configure-aws-cli',
    'install-terraform',
  ],
  costBreakdown: [
    {
      service: 'API Gateway (REST)',
      freeTierCovers: '1 million REST calls a month on the 12-month Free Tier; newer accounts get credits instead TODO(verify)',
      beyondFreeTier: 'About $3.50 per million requests TODO(verify)',
    },
    {
      service: 'Lambda',
      freeTierCovers: '1 million requests and 400,000 GB-seconds a month, always free TODO(verify)',
      beyondFreeTier: 'About $0.20 per million requests plus compute time TODO(verify)',
    },
    {
      service: 'DynamoDB (on-demand)',
      freeTierCovers: '25 GB of storage always free TODO(verify)',
      beyondFreeTier: 'A small charge per million reads and writes; a demo makes a few thousand TODO(verify)',
    },
    {
      service: 'S3',
      freeTierCovers: '5 GB of storage on the 12-month Free Tier TODO(verify)',
      beyondFreeTier: 'About $0.025 per GB-month (README), plus request and download (data out) fees TODO(verify)',
    },
    {
      service: 'SES',
      freeTierCovers: 'A few thousand emails a month on the Free Tier TODO(verify)',
      beyondFreeTier: 'About $0.10 per 1,000 emails TODO(verify)',
    },
    {
      service: 'Amplify Hosting',
      freeTierCovers: 'Some storage and GB served a month on the 12-month Free Tier TODO(verify)',
      beyondFreeTier: 'Cents per GB stored and served; a small React app is a few MB TODO(verify)',
    },
    {
      service: 'CloudWatch',
      freeTierCovers: '10 alarms and 5 GB of log data a month TODO(verify)',
      beyondFreeTier: 'This app has 13 alarms: about $0.10 a month for each one past 10 (README) TODO(verify)',
    },
    {
      service: 'SNS (extra credit)',
      freeTierCovers: '1,000 email notifications a month TODO(verify)',
      beyondFreeTier: 'About $2 per 100,000 emails TODO(verify)',
    },
    {
      service: 'EventBridge (extra credit)',
      freeTierCovers: 'The 5-minute schedule rule is not charged TODO(verify)',
      beyondFreeTier: 'Free for schedules; each run is a normal Lambda invocation TODO(verify)',
    },
    {
      service: 'KMS (optional)',
      freeTierCovers: 'Not used by default: the default encryption mode is free',
      beyondFreeTier: 'About $1 per key per month: one for "shared", one per user for "per_user" (README) TODO(verify)',
    },
    {
      service: 'CloudFront (optional)',
      freeTierCovers: 'Not used by default (web_hosting = "amplify"); has an always-free monthly allowance TODO(verify)',
      beyondFreeTier: 'Per GB served and per request TODO(verify)',
    },
    {
      service: 'IAM',
      freeTierCovers: 'Always free',
      beyondFreeTier: 'Free',
    },
  ],
  links: [
    { label: 'README on GitHub', href: 'https://github.com/Yash19k/dropvault#readme' },
    { label: 'Run it offline (local/README.md)', href: 'https://github.com/Yash19k/dropvault/blob/main/local/README.md' },
    { label: 'Postman collection', href: 'https://github.com/Yash19k/dropvault/blob/main/postman/DropVault.postman_collection.json' },
  ],
};

export default project;
