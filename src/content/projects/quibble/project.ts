import type { Project } from '../../../lib/types';

/**
 * Quibble: a real-time multiplayer quiz on API Gateway WebSockets, Lambda and DynamoDB.
 * Every fact here comes from source-projects/quibble/ (README, aws/template.yaml, aws/backend/src, public/js).
 */
const project: Project = {
  slug: 'quibble',
  title: 'Quibble: a live multiplayer quiz',
  tagline:
    'One host, a 6-character code and up to 250 phones racing the same countdown. Real-time over WebSockets, with no game server to keep running.',
  difficulty: 'advanced',
  estimatedBuildTime: '3-4 hours',
  freeTierFriendly: {
    value: true,
    note: 'Everything is pay-per-use and nothing runs while idle except a once-a-minute uptime monitor. The README puts a 10-question game with 5 players at a fraction of a cent. TODO(verify)',
  },
  liveDemoUrl: 'https://quibble-frontendbucket-xbdspxx14ytn.s3.ap-south-1.amazonaws.com/index.html',
  githubUrl: 'https://github.com/Yash19k/quibble',
  githubBranch: 'main',
  sourceFolder: 'quibble',
  iac: 'sam',
  stack: ['Node.js 22', 'AWS SAM', 'WebSockets', 'Vanilla JS', 'DynamoDB', 'arm64'],
  order: 2,
  whatYouLearn: [
    'How a **WebSocket API** keeps a connection open, and what `$connect`, `$default` and `$disconnect` do',
    'Pushing messages from **Lambda** to browsers with the API Gateway Management API (`PostToConnection`)',
    'Running a game clock without a server: a timer **Lambda** invoked asynchronously for every deadline',
    '**DynamoDB** conditional writes and transactions, so exactly one Lambda wins a race',
    'Choosing partition keys so 250 answers in the same instant never pile onto one key',
    'Surviving dropped connections with acks, resends, version numbers and a self-healing `sync`',
    'Deploying it all with **AWS SAM**, and getting **CloudWatch** alarms by email through **SNS**',
  ],
  services: [
    {
      serviceSlug: 'api-gateway',
      roleInThisProject:
        'Two APIs: a **WebSocket API** that keeps one connection open per player for the game itself, and an **HTTP API** for sign-up, login, leaderboards and the admin console.',
      analogy:
        'A phone line that stays open for the whole quiz (WebSocket), next to a normal counter where you ask one question and get one answer (HTTP).',
      whyNotAlternative:
        'With only a REST API, 250 phones would have to ask "anything new?" every second. A WebSocket lets the server speak first, the moment something happens.',
    },
    {
      serviceSlug: 'lambda',
      roleInThisProject:
        'Six Node.js 22 functions on arm64: one per WebSocket route, the REST API, the game-timer that runs the clock, and the monitor that emails alerts.',
      analogy: 'Referees who walk onto the pitch only when something happens, and leave as soon as they have made the call.',
      whyNotAlternative:
        'A game server on EC2 could keep each game in memory, but it runs (and bills) all day and you must patch, scale and restart it. Lambda costs nothing between quiz nights.',
    },
    {
      serviceSlug: 'dynamodb',
      roleInThisProject:
        'Nine on-demand tables hold users, questions, games, answers and open sockets. Conditional writes and transactions keep a game consistent while many Lambdas act on it at once.',
      analogy: 'A scoreboard where every change says "only if the board still shows version 8", so two referees can never both change it.',
      whyNotAlternative:
        'A relational database needs a server running all the time and a pool of connections shared by hundreds of short-lived Lambdas. DynamoDB is called over HTTPS and billed per request.',
    },
    {
      serviceSlug: 's3',
      roleInThisProject:
        'Hosts the static frontend (HTML, CSS and vanilla JS, no build step) and serves it over HTTPS at the bucket\'s own `amazonaws.com` address.',
      analogy: 'A notice board anyone can read, but only you can pin things to.',
      whyNotAlternative:
        'Files that are the same for every player need no server. CloudFront would add a custom domain and `/` URLs; the README lists that as a known trade-off.',
    },
    {
      serviceSlug: 'cloudwatch',
      roleInThisProject:
        'Collects every function\'s JSON logs and custom game metrics, runs 14 alarms (errors, throttles, late timers, uptime) and draws a dashboard.',
      analogy: 'The replay booth at a match: everything is recorded, and a buzzer goes off when something looks wrong.',
      whyNotAlternative:
        'Without it you would learn a game broke when 60 people complained. Logs Insights finds every error line across all functions with one query.',
    },
    {
      serviceSlug: 'sns',
      roleInThisProject:
        'The `AlertsTopic` emails you when the site goes down, errors pile up, a deploy fails or an admin does something sensitive.',
      analogy: 'A group SMS: the monitor sends one message and everyone subscribed receives it.',
      whyNotAlternative:
        'SES can send richer email but needs verified senders. An SNS email subscription needs only one "Confirm subscription" click from the person receiving it.',
    },
    {
      serviceSlug: 'eventbridge',
      roleInThisProject:
        'Wakes the monitor every minute for uptime probes, and forwards this stack\'s failed-deploy events (CloudFormation status changes) to it.',
      analogy: 'An alarm clock and a doorbell: one rings on a schedule, the other only when a specific thing happens.',
      whyNotAlternative:
        'A cron job needs a machine that is always on. EventBridge rules are part of AWS and need no code of their own.',
    },
    {
      serviceSlug: 'iam',
      roleInThisProject:
        'SAM gives every function its own role with only what it needs, such as `execute-api:ManageConnections` to push to sockets and `lambda:InvokeFunction` on the game-timer alone.',
      analogy: 'Staff badges that open only the doors each person\'s job needs.',
      whyNotAlternative:
        'One shared admin role would let a bug in the login code delete the game tables. Least privilege keeps a mistake small.',
    },
    {
      serviceSlug: 'cloudformation',
      roleInThisProject:
        '`sam deploy` turns `aws/template.yaml` into a CloudFormation stack named `quibble`: every table, API, function, alarm and output is created, changed and deleted together.',
      analogy: 'A recipe card: AWS follows it exactly every time, and `sam delete` clears the whole table afterwards.',
      whyNotAlternative:
        'Clicking dozens of resources together in the console is slow and impossible to repeat. DropVault used Terraform for the same job; SAM is CloudFormation with shortcuts for serverless apps.',
    },
  ],
  architecture: {
    nodes: [
      {
        id: 'site',
        kind: 'service',
        serviceSlug: 's3',
        label: 'Website bucket',
        sublabel: 'S3, HTTPS endpoint',
        position: { x: 0, y: 0 },
        mobilePosition: { x: 0, y: 0 },
        description:
          'Holds `public/` (index.html, play.html, admin.html, vanilla JS) plus a generated `config.js` with the two API URLs. Players open `https://<bucket>.s3.<region>.amazonaws.com/index.html`.',
      },
      {
        id: 'browser',
        kind: 'browser',
        icon: 'smartphone',
        label: 'Player\'s phone',
        sublabel: 'play.html + realtime.js',
        position: { x: 0, y: 220 },
        mobilePosition: { x: 0, y: 130 },
        description:
          'Each player\'s browser. `realtime.js` keeps one WebSocket open, numbers every message, waits for an ack and resends anything unacknowledged with the same id. It never knows the right answer.',
      },
      {
        id: 'httpapi',
        kind: 'service',
        serviceSlug: 'api-gateway',
        label: 'HTTP API',
        sublabel: 'ANY /api/{proxy+}',
        position: { x: 215, y: 0 },
        mobilePosition: { x: 200, y: 0 },
        description:
          'Normal request-and-response calls: sign up, log in, leaderboards, match history, My quizzes and the admin console. One catch-all route sends everything to Lambda: api. Throttled at 1,000 requests/s (2,000 burst).',
      },
      {
        id: 'fnApi',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: api',
        sublabel: 'handlers/http.js',
        position: { x: 430, y: 0 },
        mobilePosition: { x: 200, y: 130 },
        description:
          'The REST API: bcrypt passwords, signed JWTs (HS256, 7 days), per-IP sign-up and failed-login limits, leaderboards and every admin page. It gets 1,769 MB because bcrypt is CPU-heavy and 200 people may sign up at once.',
      },
      {
        id: 'userTables',
        kind: 'service',
        serviceSlug: 'dynamodb',
        label: 'Users + results',
        sublabel: 'Users, Results +4 tables',
        position: { x: 860, y: 0 },
        mobilePosition: { x: 200, y: 260 },
        description:
          'Six tables that are not hot during a game: Users (accounts, currentGame, sessionVersion), Questions (the bank), Results (match history and leaderboards), Quizzes (player-made), RateLimits (sign-up and login counters) and Admin (audit log, announcement).',
      },
      {
        id: 'wsapi',
        kind: 'service',
        serviceSlug: 'api-gateway',
        label: 'WebSocket API',
        sublabel: '$connect $default $disconnect',
        position: { x: 215, y: 220 },
        mobilePosition: { x: 0, y: 390 },
        description:
          'Keeps one open connection per browser tab. It picks a route from the frame\'s `action` field; Quibble\'s frames all say `action: "message"`, which matches no named route, so they land on `$default`. Lambdas push back through its Management API (`PostToConnection`).',
      },
      {
        id: 'fnConnect',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: ws-connect',
        sublabel: 'handlers/wsConnect.js',
        position: { x: 430, y: 110 },
        mobilePosition: { x: 200, y: 520 },
        description:
          'Runs once per new socket (`$connect`). Verifies the JWT from `?token=`, reads the user (banned or signed out means 401 and the connection is refused) and saves a Connections item.',
      },
      {
        id: 'fnMessage',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: ws-message',
        sublabel: 'handlers/wsMessage.js',
        position: { x: 430, y: 220 },
        mobilePosition: { x: 0, y: 650 },
        description:
          'Every game action (`$default`): hello and sync, game:create, room:join, game:start, answer:submit, react. It re-reads the user on every message so bans apply instantly, validates the data, runs `lib/game.js` and replies with an ack.',
      },
      {
        id: 'fnTimer',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: game-timer',
        sublabel: 'handlers/gameTimer.js',
        position: { x: 215, y: 440 },
        mobilePosition: { x: 200, y: 780 },
        description:
          'The game clock. Invoked asynchronously with `{ kind, code, qIndex, dueAt }`, it sleeps until the deadline, pushes "x of y answered" about once a second, closes and scores the question, then opens the next one. It also batches lobby lists and emoji reactions.',
      },
      {
        id: 'fnDisconnect',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: ws-disconnect',
        sublabel: 'handlers/wsDisconnect.js',
        position: { x: 430, y: 440 },
        mobilePosition: { x: 200, y: 910 },
        description:
          'Runs when API Gateway notices a closed socket (best effort, not guaranteed). Deletes the Connections item, removes the socket from the member\'s `conns`, and if it was their last tab lowers the question\'s "expected" count.',
      },
      {
        id: 'gameTables',
        kind: 'service',
        serviceSlug: 'dynamodb',
        label: 'Game tables',
        sublabel: 'Games, GamePlay, Connections',
        position: { x: 645, y: 220 },
        mobilePosition: { x: 0, y: 910 },
        description:
          'Games: one ~1 KB header per game (status, question, deadlines, `version`), rewritten only on phase changes. GamePlay: everything players write at once, one partition key per item family (lobby gate, question gates, answers, scores). Connections: one item per open socket.',
      },
      {
        id: 'cw',
        kind: 'service',
        serviceSlug: 'cloudwatch',
        label: 'CloudWatch',
        sublabel: 'logs, alarms, dashboard',
        position: { x: 645, y: 440 },
        mobilePosition: { x: 0, y: 1040 },
        description:
          'Every function writes JSON log lines (14-day retention) and custom metrics in the `Quibble` namespace. AWS services add their own metrics, such as DynamoDB throttles. 14 alarms watch them all and a dashboard shows the game live.',
      },
      {
        id: 'monitor',
        kind: 'service',
        serviceSlug: 'lambda',
        label: 'Lambda: monitor',
        sublabel: 'handlers/monitor.js',
        position: { x: 860, y: 330 },
        mobilePosition: { x: 200, y: 1040 },
        description:
          'Probes the website, `/api/health` and a WebSocket handshake every minute, and turns alarms and failed deploys into plain-language emails that quote the matching log lines.',
      },
      {
        id: 'eb',
        kind: 'service',
        serviceSlug: 'eventbridge',
        label: 'EventBridge rules',
        sublabel: '1-min schedule, deploy events',
        position: { x: 860, y: 220 },
        mobilePosition: { x: 0, y: 1170 },
        description:
          'Two rules start the monitor: a `rate(1 minute)` schedule for the uptime probes, and a rule matching this stack\'s CloudFormation status events when a deploy fails or rolls back.',
      },
      {
        id: 'sns',
        kind: 'service',
        serviceSlug: 'sns',
        label: 'Alerts topic',
        sublabel: 'SNS, email',
        position: { x: 860, y: 440 },
        mobilePosition: { x: 200, y: 1170 },
        description:
          'Delivers the monitor\'s messages to every subscribed email address (the `AlertEmail` parameter). AWS asks each address to confirm once before it receives anything.',
      },
    ],
    edges: [
      { id: 'e-page', source: 'browser', target: 'site', label: 'GET index.html (HTTPS)' },
      { id: 'e-rest', source: 'browser', target: 'httpapi', label: 'HTTPS /api/*' },
      { id: 'e-rest-fn', source: 'httpapi', target: 'fnApi', label: 'invoke' },
      { id: 'e-api-db', source: 'fnApi', target: 'userTables', label: 'accounts, boards' },
      { id: 'e-ws', source: 'browser', target: 'wsapi', label: 'WebSocket (wss://)' },
      { id: 'e-connect', source: 'wsapi', target: 'fnConnect', label: '$connect' },
      { id: 'e-default', source: 'wsapi', target: 'fnMessage', label: '$default' },
      { id: 'e-disconnect', source: 'wsapi', target: 'fnDisconnect', label: '$disconnect' },
      { id: 'e-connect-users', source: 'fnConnect', target: 'userTables', label: 'read user' },
      { id: 'e-connect-sock', source: 'fnConnect', target: 'gameTables', label: 'save socket' },
      { id: 'e-msg-users', source: 'fnMessage', target: 'userTables', label: 'read user' },
      { id: 'e-msg-game', source: 'fnMessage', target: 'gameTables', label: 'conditional writes' },
      { id: 'e-invoke', source: 'fnMessage', target: 'fnTimer', label: 'async invoke', style: 'dashed' },
      { id: 'e-timer-game', source: 'fnTimer', target: 'gameTables', label: 'read gate, score' },
      { id: 'e-push', source: 'fnTimer', target: 'wsapi', label: 'PostToConnection' },
      { id: 'e-disc-game', source: 'fnDisconnect', target: 'gameTables', label: 'forget socket' },
      { id: 'e-metrics', source: 'gameTables', target: 'cw', label: 'throttle metrics', style: 'dashed' },
      { id: 'e-alarm', source: 'cw', target: 'monitor', label: 'alarm action', style: 'dashed' },
      { id: 'e-schedule', source: 'eb', target: 'monitor', label: 'every minute, deploy failed', style: 'dashed' },
      { id: 'e-email', source: 'monitor', target: 'sns', label: 'Publish', style: 'dashed' },
    ],
  },
  flows: [
    {
      id: 'join',
      title: 'Joining a game with a code',
      summary: 'From scanning the QR code to a seat in the lobby, through the WebSocket handshake.',
      steps: [
        {
          edgeId: 'e-page',
          title: 'Open the join link',
          explanation:
            'The host\'s lobby shows a code and a QR code. Your phone loads `play.html?code=K7M2QX` from the S3 website. It already holds a login token (a JWT) from `POST /api/auth/login`.',
          payloadExample: 'GET https://quibble-frontendbucket-xxxx.s3.ap-south-1.amazonaws.com/play.html?code=K7M2QX',
        },
        {
          edgeId: 'e-ws',
          title: 'Open a WebSocket',
          explanation:
            '`realtime.js` opens one long-lived connection with the token in the URL, because a browser cannot add an Authorization header to a WebSocket handshake.',
          payloadExample: 'wss://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com/prod?token=eyJhbGciOiJIUzI1NiIs...',
        },
        {
          edgeId: 'e-connect',
          title: '$connect runs ws-connect',
          explanation:
            'Before accepting the socket, API Gateway calls ws-connect. If it returns anything other than a 2xx status, the connection is refused.',
          payloadExample: {
            requestContext: { routeKey: '$connect', connectionId: 'VmT1kdLqBcwCJxQ=' },
            queryStringParameters: { token: 'eyJhbGciOiJIUzI1NiIs...' },
          },
        },
        {
          edgeId: 'e-connect-users',
          title: 'Is this player allowed in?',
          explanation:
            'It checks the JWT signature locally, then reads the user with a strongly consistent read. Banned, deleted or "signed out everywhere" means `401` and no socket.',
          payloadExample: { Key: { pk: 'USER#3f6c2a1e-8b1d-4c3e-9a57-2d0f6e1b9c44' }, ConsistentRead: true },
        },
        {
          edgeId: 'e-connect-sock',
          title: 'Remember the socket',
          explanation:
            'One Connections item per open socket. A TTL removes it after 3 hours in case `$disconnect` never arrives.',
          payloadExample: {
            connectionId: 'VmT1kdLqBcwCJxQ=',
            userId: '3f6c2a1e-8b1d-4c3e-9a57-2d0f6e1b9c44',
            tokenIat: 1763711000,
            tokenSv: 0,
            connectedAt: '2026-11-21T13:00:02.114Z',
            expiresAt: 1763722802,
          },
        },
        {
          edgeId: 'e-default',
          title: 'Send room:join',
          explanation:
            'Every frame says `action: "message"`, which matches no named route, so API Gateway hands it to `$default` and ws-message.',
          payloadExample: { action: 'message', id: '9f2c41ab-4', event: 'room:join', data: { code: 'K7M2QX' } },
        },
        {
          edgeId: 'e-msg-game',
          title: 'Claim a seat at the lobby gate',
          explanation:
            'One atomic counter update on `K7M2QX#L` (only while the lobby is open and not full), then one new member item. No read-modify-write, so 60 people joining at once never collide.',
          payloadExample: { pk: 'K7M2QX#L', sk: 'L', open: true, seq: 42, count: 42, max: 250 },
        },
        {
          edgeId: 'e-default',
          reverse: true,
          title: 'Ack: you are in',
          explanation:
            'ws-message replies through `PostToConnection` with the same `id`, so `realtime.js` stops resending. The snapshot has everything needed to draw the lobby.',
          payloadExample: {
            type: 'ack',
            id: '9f2c41ab-4',
            ok: true,
            code: 'K7M2QX',
            snapshot: { v: 1, code: 'K7M2QX', status: 'lobby', playerCount: 42, isPlayer: true, players: [{ username: 'riya', connected: true }] },
          },
        },
        {
          edgeId: 'e-invoke',
          title: 'One batched lobby update',
          explanation:
            'After the ack, ws-message claims a lobby push and async-invokes the game-timer, which pushes `room:state` to everyone within 500 ms. Joins in that window share the same push.',
          payloadExample: { kind: 'lobby', code: 'K7M2QX', due: 1763712003614, dueAt: 1763712003614 },
        },
      ],
    },
    {
      id: 'start',
      title: 'The host presses Start game',
      summary: 'One transaction opens question 1, the clock starts, and 60 phones get the question at once.',
      steps: [
        {
          edgeId: 'e-default',
          title: 'game:start',
          explanation:
            'Only the host may start. A resend after the game already started simply returns, because every action is idempotent (safe to repeat).',
          payloadExample: { action: 'message', id: 'c07d3b19-12', event: 'game:start', data: {} },
        },
        {
          edgeId: 'e-msg-game',
          title: 'Close the lobby gate',
          explanation:
            '`SET open = false` only if it is still open, so nobody joins mid-start. ws-message then waits briefly for joins that already passed the gate.',
          payloadExample: 'UpdateExpression: SET #open = :f, #closedAt = :now   ConditionExpression: #open = :t',
        },
        {
          nodeId: 'gameTables',
          title: 'One transaction opens question 0',
          explanation:
            'The question\'s gate item and the Games header change together, and only if the header still has `version` 1 and status `lobby`. If two attempts race, exactly one wins.',
          payloadExample: {
            code: 'K7M2QX',
            status: 'question',
            version: 2,
            qIndex: 0,
            questionStartedAt: 1763712060000,
            endsAt: 1763712075000,
            acceptUntil: 1763712076500,
          },
        },
        {
          edgeId: 'e-invoke',
          title: 'Start the clock before telling anyone',
          explanation:
            'The winner invokes game-timer with `InvocationType: "Event"`, which returns at once. It schedules the timer first, so a question on screen always has a clock behind it.',
          payloadExample: { kind: 'question', code: 'K7M2QX', qIndex: 0, dueAt: 1763712076500 },
        },
        {
          edgeId: 'e-default',
          reverse: true,
          title: 'Push question:show',
          explanation:
            'ws-message reads every member\'s `conns` with a strongly consistent query and calls `PostToConnection` once per socket, all in parallel.',
          payloadExample: {
            type: 'event',
            event: 'question:show',
            data: {
              v: 2,
              code: 'K7M2QX',
              type: 'choice',
              text: 'Which data structure follows FIFO (first in, first out) ordering?',
              options: ['Stack', 'Queue', 'Tree', 'Graph'],
              timeLimit: 15,
              index: 0,
              total: 10,
              endsAt: 1763712075000,
              acceptUntil: 1763712076500,
              serverNow: 1763712060042,
              playerCount: 60,
            },
          },
        },
        {
          edgeId: 'e-ws',
          reverse: true,
          title: 'Every phone shows the question',
          explanation:
            'API Gateway delivers each push down its socket. The page ignores anything with an older `v` and uses `serverNow` to line its countdown up with the server clock.',
        },
        {
          nodeId: 'fnTimer',
          title: 'The clock is running',
          explanation:
            'Meanwhile game-timer sleeps in a loop until `dueAt`, waking about once a second to check the answer count. It lives for the whole question, which is why its timeout is 120 s.',
        },
      ],
    },
    {
      id: 'answer',
      title: 'A student answers and everyone sees the result update',
      summary: 'Two conditional writes, a live count, scoring at the deadline and a result pushed to every socket.',
      steps: [
        {
          edgeId: 'e-ws',
          title: 'Tap option 2',
          explanation:
            'The browser sends only "I picked option 2". It never knows the right answer: the server holds it, runs the clock and scores.',
          payloadExample: { action: 'message', id: '5be1a0f7-31', event: 'answer:submit', data: { code: 'K7M2QX', index: 3, choice: 2 } },
        },
        {
          edgeId: 'e-default',
          title: 'API Gateway stamps the arrival time',
          explanation:
            'ws-message uses `requestTimeEpoch`, the moment API Gateway received the frame, as the answer time. A cold start or a resend never costs the player points.',
          payloadExample: { requestContext: { routeKey: '$default', connectionId: 'VmT1kdLqBcwCJxQ=', requestTimeEpoch: 1763712245123 } },
        },
        {
          edgeId: 'e-msg-game',
          title: 'Write 1: store the answer',
          explanation:
            'Put one item under `K7M2QX#A#3`, only if it does not exist yet. A resend fails that condition and the first answer and arrival time stay.',
          payloadExample: {
            pk: 'K7M2QX#A#3',
            sk: '17',
            seat: 17,
            userId: '3f6c2a1e-8b1d-4c3e-9a57-2d0f6e1b9c44',
            choice: 2,
            at: 1763712245123,
            expiresAt: 1763798645,
          },
        },
        {
          nodeId: 'gameTables',
          title: 'Write 2: count it at the gate',
          explanation:
            'An atomic `ADD answered 1, seats {17}` on the question\'s gate item, only while it is open, before `acceptUntil` and if seat 17 is not counted yet. No reads, no conflicts.',
          payloadExample: { pk: 'K7M2QX#Q', sk: '3', answered: 143, expected: 250, acceptUntil: 1763712256500 },
        },
        {
          edgeId: 'e-default',
          reverse: true,
          title: 'Locked in',
          explanation:
            'The ack goes back to this one socket. If this was the last answer expected, ws-message also closes the question early, after sending the ack.',
          payloadExample: { type: 'ack', id: '5be1a0f7-31', ok: true, locked: true, index: 3 },
        },
        {
          edgeId: 'e-push',
          title: 'Live count: 143 of 250',
          explanation:
            'The sleeping game-timer reads the gate about once a second (a cheap, eventually consistent read). When the number changed, it pushes `answer:count` to every socket.',
          payloadExample: { type: 'event', event: 'answer:count', data: { v: 8, code: 'K7M2QX', index: 3, answered: 143, total: 250 } },
        },
        {
          edgeId: 'e-timer-game',
          title: 'Deadline: close, seal and score',
          explanation:
            'At `acceptUntil` (or once everyone answered) the closer stamps `closedAt`, waits 500 ms for answers in flight, seals the gate, scores every counted answer and commits one transaction guarded by `version`.',
          payloadExample: { status: 'reveal', version: 9, revealEndsAt: 1763712261000 },
        },
        {
          edgeId: 'e-push',
          title: 'Push question:result to every socket',
          explanation:
            'Each player gets their own copy: the right answer, how everyone voted, the top 10, plus `me` and `myChoice`. The timer then schedules the next question for after the 4-second reveal.',
          payloadExample: {
            type: 'event',
            event: 'question:result',
            data: {
              v: 9,
              code: 'K7M2QX',
              index: 3,
              correctIndex: 2,
              optionCounts: [21, 38, 171, 20],
              answeredCount: 250,
              rightCount: 171,
              fastest: { username: 'riya', ms: 1840 },
              revealEndsAt: 1763712261000,
              me: { username: 'arjun', score: 3920, lastGain: 920, rank: 4, streak: 3 },
              myChoice: { choice: 2, correct: true, gained: 920, bonus: 100, streak: 3 },
            },
          },
        },
        {
          edgeId: 'e-ws',
          reverse: true,
          title: 'The leaderboard moves on every phone',
          explanation:
            'A push with an older `v` is ignored, so a late duplicate cannot drag the screen backwards. A phone that missed this push sends `sync` a few seconds later and gets a full snapshot.',
        },
      ],
    },
    {
      id: 'reconnect',
      title: 'A phone drops and reconnects',
      summary: 'Lost signal mid-question, then back in the same question with the answer still counted.',
      steps: [
        {
          nodeId: 'browser',
          title: 'Signal drops mid-question',
          explanation:
            'The socket dies, sometimes silently. `realtime.js` keeps every unacknowledged message and reconnects with a random backoff (at most 5 s) as soon as the network or the tab comes back.',
        },
        {
          edgeId: 'e-disconnect',
          title: '$disconnect, when AWS notices',
          explanation:
            'API Gateway calls ws-disconnect for a closed socket, but only on a best-effort basis: it can be late or never arrive. Nothing in Quibble depends on it.',
          payloadExample: { requestContext: { routeKey: '$disconnect', connectionId: 'VmT1kdLqBcwCJxQ=' } },
        },
        {
          edgeId: 'e-disc-game',
          title: 'Forget the socket',
          explanation:
            'Delete its Connections item and remove it from the member\'s `conns` set. If that was the player\'s last tab, the gate\'s `expected` count drops by one so nobody waits for them.',
          payloadExample: 'UpdateExpression: DELETE #conns :c   ConditionExpression: attribute_exists(#sk) AND contains(#conns, :cid)',
        },
        {
          edgeId: 'e-ws',
          title: 'Reconnect with the same token',
          explanation: 'A brand new socket with a new connectionId. Old sockets are never reused.',
          payloadExample: 'wss://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com/prod?token=eyJhbGciOiJIUzI1NiIs...',
        },
        {
          edgeId: 'e-connect',
          title: 'ws-connect runs again',
          explanation: 'Same checks as the first visit: the JWT, the user, then a new Connections item for the new socket.',
        },
        {
          edgeId: 'e-default',
          title: 'Say hello',
          explanation:
            'Every newly opened socket starts with `hello`. Messages still waiting for an ack, like an answer sent just before the drop, are resent with their original ids.',
          payloadExample: { action: 'message', id: '9f2c41ab-57', event: 'hello', data: { protocol: 3 } },
        },
        {
          edgeId: 'e-msg-game',
          title: 'Re-attach to the game',
          explanation:
            'ws-message points the socket at the game and adds it to the member\'s `conns`, so the next push reaches it. If the game looks overdue, it also schedules an un-stick run.',
          payloadExample: 'UpdateExpression: ADD #conns :c   ConditionExpression: attribute_exists(#sk)',
        },
        {
          edgeId: 'e-default',
          reverse: true,
          title: 'Snapshot: back in question 3',
          explanation:
            'The phone redraws exactly where the game is. An answer sent before the drop shows as locked, scored from its original arrival time.',
          payloadExample: {
            type: 'ack',
            id: '9f2c41ab-57',
            ok: true,
            inGame: true,
            snapshot: { v: 8, code: 'K7M2QX', status: 'question', question: { index: 3, endsAt: 1763712255000, acceptUntil: 1763712256500 }, answered: true },
          },
        },
        {
          edgeId: 'e-ws',
          reverse: true,
          title: 'Pushes resume',
          explanation:
            'The next `answer:count` or `question:result` reaches the new socket. Anything with an older `v` than the snapshot is ignored.',
        },
      ],
    },
    {
      id: 'alerts',
      title: 'The organiser gets an alert email',
      summary: 'A hot DynamoDB key throttles, an alarm fires, and the monitor emails a readable explanation.',
      steps: [
        {
          edgeId: 'e-metrics',
          title: 'A hot key throttles',
          explanation: 'DynamoDB reports throttled writes on the GamePlay table as a CloudWatch metric. Nobody has to write code for that.',
          payloadExample: {
            Namespace: 'AWS/DynamoDB',
            MetricName: 'WriteThrottleEvents',
            Dimensions: [{ Name: 'TableName', Value: 'quibble-GamePlayTable-1A2B3C4D5E' }],
          },
        },
        {
          nodeId: 'cw',
          title: 'The alarm trips',
          explanation: '`quibble-gameplay-table-write-throttles` goes to ALARM when at least one write was throttled in a minute.',
        },
        {
          edgeId: 'e-alarm',
          title: 'CloudWatch invokes the monitor',
          explanation:
            'Every alarm except the monitor\'s own names the monitor Lambda as its action, so CloudWatch calls it directly with the alarm\'s details.',
          payloadExample: {
            alarmData: { alarmName: 'quibble-gameplay-table-write-throttles', state: { value: 'ALARM' }, previousState: { value: 'OK' } },
          },
        },
        {
          nodeId: 'monitor',
          title: 'Write a readable email',
          explanation:
            'The monitor maps the alarm name to a plain explanation and advice, and quotes matching error lines from the last 15 minutes of logs.',
        },
        {
          edgeId: 'e-email',
          title: 'SNS emails you',
          explanation: 'The monitor publishes to the alerts topic, and SNS delivers it to every confirmed address.',
          payloadExample: {
            TopicArn: 'arn:aws:sns:ap-south-1:123456789012:quibble-AlertsTopic-AbC123',
            Subject: '[Quibble] DynamoDB is throttling writes on the GamePlay table',
          },
        },
        {
          edgeId: 'e-schedule',
          title: 'Also on watch: uptime and deploys',
          explanation:
            'An EventBridge schedule runs the same monitor every minute to probe the site, and an EventBridge rule forwards failed deploys. Both end up as emails like this one.',
          payloadExample: {
            source: 'aws.cloudformation',
            'detail-type': 'CloudFormation Stack Status Change',
            detail: { 'status-details': { status: 'UPDATE_ROLLBACK_COMPLETE' } },
          },
        },
      ],
    },
  ],
  whatIfs: [
    {
      id: 'answer-burst',
      question: '250 people answer in the same 100 ms?',
      answer:
        'Each answer is two small conditional writes and no reads: a new item under `<code>#A#<k>` and one atomic `ADD` on the question\'s gate item. Item families live under different partition keys and nothing does read-modify-write, so there are no conflicts to retry. The project\'s load test plays this burst and fails if any key goes above about 30% of DynamoDB\'s per-key limits. The real bottleneck is how many Lambdas may run at once (see the 10-slot question).',
      relatedNodeIds: ['browser', 'wsapi', 'fnMessage', 'gameTables'],
    },
    {
      id: 'signal-drop',
      question: 'a phone loses signal in the middle of a question?',
      answer:
        '`realtime.js` keeps every unacknowledged message and resends it with the same id after reconnecting. If the first copy reached API Gateway, the answer item already exists, so the original answer and arrival time stay; if not, the resend still counts when it arrives within `LateGraceMs` (1.5 s by default) of the buzzer. The `hello` on the new socket returns a full snapshot, so the phone lands back in the same question.',
      relatedNodeIds: ['browser', 'wsapi', 'fnDisconnect', 'fnMessage'],
    },
    {
      id: 'double-close',
      question: 'two Lambdas try to end the same question at once?',
      answer:
        'It really happens: the game-timer closes at the deadline while ws-message (last answer) or ws-disconnect (last player left) may close early. The first to set `closedAt` with a conditional write does the work and the others stop. The phase change is one transaction that only succeeds if the Games header still has the `version` it read, so not even a retried timer event can score a question twice. If the closer dies, the timer takes over after 5 seconds.',
      relatedNodeIds: ['fnMessage', 'fnTimer', 'fnDisconnect', 'gameTables'],
    },
    {
      id: 'quota-10',
      question: 'your new AWS account only allows 10 Lambdas at once?',
      answer:
        'All functions share one concurrency pool per account and Region. With 10 slots, 250 answers queue: API Gateway refuses the extra ones, the page resends them with backoff, and phases arrive seconds late. Ask for the standard 1,000 with `npm run quota:lambda -- --request` (free), and until it is approved deploy with `LateGraceMs=5000` so late answers still count. See [the quota step](/projects/quibble/build#step-18).',
      relatedNodeIds: ['fnMessage', 'fnTimer', 'fnConnect', 'cw'],
    },
    {
      id: 'timer-lost',
      question: 'the game-timer crashes in the middle of a game?',
      answer:
        'Lambda retries a failed async invoke (the template allows 2 retries) and every timer step is idempotent, so a retry is safe. If the event is lost for good, an alarm fires and the browsers notice: 4 seconds after a phase should have ended, their watchdog starts sending `sync`. Once the game is clearly overdue, the server schedules one "unstick" run under a 10-second lease, so 250 browsers trigger it only once.',
      relatedNodeIds: ['fnTimer', 'browser', 'fnMessage', 'gameTables'],
    },
    {
      id: 'cost',
      question: 'you want to know what a quiz night costs?',
      answer:
        'Almost nothing: it is all pay-per-use and nothing runs while idle. The README puts a 10-question game with 5 players at a fraction of a cent. Two things always cost a little: the game-timer is billed while it sleeps through each question, and the uptime monitor runs every minute (about 43,000 small runs a month, inside the Lambda Free Tier) with 14 alarms, and CloudWatch charges for alarms beyond the first 10. TODO(verify)',
      relatedNodeIds: ['fnTimer', 'monitor', 'eb', 'cw'],
    },
  ],
  codePeeks: [
    {
      id: 'ws-routes',
      nodeId: 'wsapi',
      title: 'The WebSocket API and its routes',
      language: 'yaml',
      filePath: 'aws/template.yaml',
      code: `WebSocketApi:
  Type: AWS::ApiGatewayV2::Api
  Properties:
    Name: !Sub '\${AWS::StackName}-ws'
    ProtocolType: WEBSOCKET
    RouteSelectionExpression: '$request.body.action'
# ...
ConnectRoute:
  Type: AWS::ApiGatewayV2::Route
  Properties:
    ApiId: !Ref WebSocketApi
    RouteKey: $connect
    AuthorizationType: NONE # the Lambda checks the JWT itself
    Target: !Sub 'integrations/\${ConnectIntegration}'
# ...
DefaultRoute:
  Type: AWS::ApiGatewayV2::Route
  Properties:
    ApiId: !Ref WebSocketApi
    RouteKey: $default
    Target: !Sub 'integrations/\${MessageIntegration}'`,
      explanation:
        'API Gateway reads `action` from each JSON frame to pick a route. The browser always sends `action: "message"`, which matches no named route, so every game action falls through to `$default`. `$connect` runs once when a socket opens (here it checks the login token) and `$disconnect` (not shown) when it closes.',
      highlightLines: [6, 12, 20],
    },
    {
      id: 'push',
      nodeId: 'wsapi',
      title: 'Pushing to every socket with PostToConnection',
      language: 'javascript',
      filePath: 'aws/backend/src/lib/push.js',
      code: `/** Send one JSON message to one socket. Resolves 'ok', 'gone' (the socket is closed) or 'failed'. Never throws. */
export async function sendTo(connectionId, message) {
  const data = JSON.stringify(message);
  try {
    const local = localTransport();
    if (local) await local.send(connectionId, data);
    else await api().send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: data }));
    return 'ok';
  } catch (err) {
    if (isGone(err)) return 'gone';
    log('warn', 'postToConnection failed', { connectionId, error: err });
    return 'failed';
  }
}
// ...
export async function emitToMembers(members, event, dataFn) {
  const jobs = [];
  for (const member of members) {
    for (const connectionId of member.conns ?? []) {
      const data = dataFn(member, connectionId);
      if (data == null) continue;
      jobs.push(sendEvent(connectionId, event, data).then((r) => (r === 'gone' ? { member, connectionId } : null)));
    }
  }
  return (await Promise.all(jobs)).filter(Boolean);
}`,
      explanation:
        'A Lambda never holds a socket. To talk to a browser it calls the API Gateway Management API with a connectionId. A broadcast is one call per open socket, all started at once and awaited together. A `GoneException` (410) means the socket already closed, so the caller cleans it up. The local dev server swaps in a fake transport.',
      highlightLines: [7, 10, 22],
    },
    {
      id: 'answer-writes',
      nodeId: 'fnMessage',
      title: 'An answer is two conditional writes',
      language: 'javascript',
      filePath: 'aws/backend/src/lib/game.js',
      code: `// 1. Write the answer BEFORE it can be counted, so a counted seat always has its answer on record.
//    A resend keeps the original answer and arrival time.
// ...
try {
  await ddb.send(new PutCommand({
    TableName: T(),
    Item: { ...gd.keys.answer(code, k, seat), seat, userId: user.id, ...given, at, expiresAt: playTtl() },
    ...gd.expr({ condition: 'attribute_not_exists(#sk)' }),
  }));
} catch (err) {
// ...
// 2. Count it at the question's gate (one small item; no read-modify-write, so no contention errors).
//    An answer that arrived before the close instant still counts until the closer seals the gate.
try {
  const res = await update(T(), gd.keys.gate(code, k), {
    update: 'ADD #answered :one, #seats :seatSet',
    condition: 'attribute_exists(#sk) AND attribute_not_exists(#sealed) AND (attribute_not_exists(#closedAt) OR #closedAt >= :at) AND #acceptUntil >= :at AND #startedAt <= :early AND #optionCount > :choice AND NOT contains(#seats, :seat)',
// ...
  }, { ReturnValues: 'ALL_NEW', ReturnValuesOnConditionCheckFailure: 'ALL_OLD' });
  metric('AnswersSubmitted');
  const gate = res.Attributes;
  if (gate.answered >= gate.expected) ctx?.defer?.(() => maybeCloseEarly(code, k));
  return { locked: true, index: k };`,
      explanation:
        'Write 1 creates the answer item only if it does not exist, so a resent answer keeps its first arrival time `at`. Write 2 adds the seat to the question\'s gate in one atomic update, and its condition checks everything at once: the gate is open, the answer arrived before `acceptUntil`, the option exists and this seat was not counted already. If everyone has answered, closing the question is deferred until after the ack.',
      highlightLines: [8, 16, 17],
    },
    {
      id: 'versioned-commit',
      nodeId: 'gameTables',
      title: 'Exactly one Lambda wins a phase change',
      language: 'javascript',
      filePath: 'aws/backend/src/lib/game.js',
      code: `/** Transaction item: header phase change, only if nobody changed the header since \`h\` was read. */
function headerUpdate(h, fields, { status, k } = {}) {
  const s = setExpr({ ...fields, version: h.version + 1 });
  let condition = '#version = :v0 AND #status = :s0';
  const values = { ...s.values, ':v0': h.version, ':s0': status ?? h.status };
  if (k !== undefined) {
    condition += ' AND #qIndex = :k0';
    values[':k0'] = k;
  }
  return { TableName: env.gamesTable, Key: { code: h.code }, ...gd.expr({ update: s.update, condition, values }) };
}
// ...
async function commit(items) {
  for (let attempt = 0; ; attempt++) {
    try {
      await ddb.send(new TransactWriteCommand({ TransactItems: items }));
      return true;
    } catch (err) {
      if (!gd.isTxCancelled(err)) throw err;
      if (gd.reasonCodes(err).includes('ConditionalCheckFailed')) return false;
      if (attempt >= 4) throw err;
      await sleep(50 * 2 ** attempt + Math.random() * 50);
    }
  }
}`,
      explanation:
        'Every phase change (open a question, show its result, end the game) bumps the header\'s `version` inside a DynamoDB transaction, on the condition that the version, status and question index are still what this Lambda read. When several Lambdas try the same step, one commit succeeds and the rest get `ConditionalCheckFailed` and quietly do nothing. Only real conflicts or throttling are retried.',
      highlightLines: [3, 4, 20],
    },
    {
      id: 'async-invoke',
      nodeId: 'fnTimer',
      title: 'Starting the clock with an async invoke',
      language: 'javascript',
      filePath: 'aws/backend/src/lib/timer.js',
      code: `// Lambdas can't keep a setTimeout running between requests, so deadlines are driven by the GameTimer Lambda: we invoke
// it asynchronously with a GameTimer event and it sleeps until \`dueAt\` (see advance() in lib/game.js):
// ...
export async function scheduleAdvance(payload) {
  const local = globalThis.__QUIBBLE_LOCAL__;
  if (local) {
    // Like Lambda's async invoke: hand the event over and don't wait for the timer to run.
    Promise.resolve(local.schedule(payload)).catch((error) => log('error', 'local timer failed', { error, payload }));
    return;
  }
  await lambda().send(new InvokeCommand({
    FunctionName: env.timerFunction,
    InvocationType: 'Event', // fire-and-forget; Lambda queues it and retries failures
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
}`,
      explanation:
        'Whoever moves a game into a new phase calls this with the deadline, for example `{ kind: "question", code, qIndex, dueAt }`. `InvocationType: "Event"` means Lambda queues the event and returns immediately, so the caller can push the new phase to players without waiting. The timer function then sleeps until `dueAt` and does the next step.',
      highlightLines: [11, 13],
    },
    {
      id: 'speed-scoring',
      nodeId: 'fnTimer',
      title: 'Speed scoring: 1000 down to 500',
      language: 'javascript',
      filePath: 'aws/backend/src/lib/scoring.js',
      code: `export const BASE_POINTS = 1000;

/**
 * Points for one answer. Computed ONLY on the server.
 * - wrong answer or no answer: 0
 * - correct and instant: 1000
 * - correct at the very end of the timer: 500 (linear in between)
 */
export function calculateScore({ correct, elapsedMs, timeLimitMs }) {
  if (!correct) return 0;
  const limit = Math.max(1, timeLimitMs);
  const ratio = Math.min(Math.max(elapsedMs / limit, 0), 1);
  return Math.round(BASE_POINTS * (1 - ratio / 2));
}
// ...
/** Bonus for a run of \`streak\` correct answers in a row (counting this one): 3 -> 100, 4 -> 200 ... capped at 500. */
export function streakBonus(streak) {
  if (streak < STREAK_FROM) return 0;
  return Math.min(STREAK_CAP, (streak - STREAK_FROM + 1) * STREAK_STEP);
}`,
      explanation:
        '`elapsedMs` is the answer\'s API Gateway arrival time minus the moment the question opened, so a slow Lambda never costs anyone points. A right answer 5.4 s into a 15 s question scores 1000 x (1 - 0.36 / 2) = 820. Double-points questions multiply this; the streak bonus is added on top and never doubled.',
      highlightLines: [13, 19],
    },
  ],
  prerequisites: [
    'create-aws-account',
    'secure-your-account',
    'billing-alarm',
    'iam-user-and-keys',
    'install-tools',
    'configure-aws-cli',
    'install-sam-cli',
    'first-sam-deploy',
  ],
  costBreakdown: [
    {
      service: 'Lambda',
      freeTierCovers: '1 million requests and 400,000 GB-seconds of compute a month TODO(verify)',
      beyondFreeTier:
        'About $0.20 per million requests plus compute time; arm64 is cheaper per GB-second. The game-timer is billed while it waits out each question. TODO(verify)',
    },
    {
      service: 'API Gateway (HTTP + WebSocket)',
      freeTierCovers: 'For 12 months: 1 million HTTP API calls, plus 1 million WebSocket messages and 750,000 connection minutes a month TODO(verify)',
      beyondFreeTier:
        'About $1 per million HTTP calls, $1 per million WebSocket messages and $0.25 per million connection minutes. The monitor adds about 43,000 calls and handshakes a month: a few cents. TODO(verify)',
    },
    {
      service: 'DynamoDB (on-demand)',
      freeTierCovers: '25 GB of storage TODO(verify)',
      beyondFreeTier:
        'Billed per read and write request; a club game is a fraction of a cent. Point-in-time recovery on 5 of the 9 tables adds a small per-GB charge. TODO(verify)',
    },
    {
      service: 'S3',
      freeTierCovers: 'For 12 months: 5 GB of storage and 20,000 GET requests a month TODO(verify)',
      beyondFreeTier: 'The site is well under 1 MB, so storage is negligible; requests cost fractions of a cent per thousand. TODO(verify)',
    },
    {
      service: 'CloudWatch',
      freeTierCovers: '10 alarms, 10 custom metrics, 5 GB of log ingestion and 3 dashboards TODO(verify)',
      beyondFreeTier:
        'README: about $0.10 a month for each alarm beyond the first 10 (there are 14) and $0.30 for each custom metric beyond the first 10. TODO(verify)',
    },
    {
      service: 'SNS',
      freeTierCovers: '1,000 email notifications a month (README) TODO(verify)',
      beyondFreeTier: 'About $2 per 100,000 emails; alert emails are rare. TODO(verify)',
    },
    {
      service: 'EventBridge',
      freeTierCovers: 'Scheduled rules and events from AWS services such as CloudFormation are not charged TODO(verify)',
      beyondFreeTier: 'Nothing extra expected for the two rules Quibble uses. TODO(verify)',
    },
    {
      service: 'CloudFormation, SAM and IAM',
      freeTierCovers: 'No charge for stacks of AWS resources or for IAM roles TODO(verify)',
      beyondFreeTier: 'Only the small S3 bucket SAM uses for deployment packages (created by `--resolve-s3`). TODO(verify)',
    },
  ],
  links: [
    { label: 'README on GitHub', href: 'https://github.com/Yash19k/quibble#readme' },
    { label: 'template.yaml', href: 'https://github.com/Yash19k/quibble/blob/main/aws/template.yaml' },
    { label: 'Game engine (lib/game.js)', href: 'https://github.com/Yash19k/quibble/blob/main/aws/backend/src/lib/game.js' },
  ],
};

export default project;
