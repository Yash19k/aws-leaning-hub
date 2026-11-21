import type { TroubleshootingItem } from '../../lib/types';

/** Real errors beginners hit, searchable by pasting the error text on /troubleshooting. */
export const troubleshootingItems: TroubleshootingItem[] = [
  // ------------------------------------------------------------------ browser
  {
    id: 'cors-blocked',
    title: 'The browser blocks your API call (CORS)',
    errorMessage:
      "Access to fetch at 'https://<api-id>.execute-api.ap-south-1.amazonaws.com/<path>' from origin 'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
    cause:
      'Your page and your API (or S3 bucket) are on different origins (a different domain, port or http/https). The browser only lets your page read the answer if the server replies with an `Access-Control-Allow-Origin` header that allows your page. Very often the real problem is another error (401, 403, 500) whose answer has no CORS headers, so the browser reports CORS instead.',
    fix: [
      'Open DevTools > **Network**, click the red request and read its real status code. A 401, 403 or 500 there means: fix that error first, CORS is only the messenger.',
      "Check the URL itself. A typo, a missing stage (like `/dev`) or the wrong API ID gets API Gateway's own 403 `Missing Authentication Token`, which may have no CORS headers.",
      '**DropVault**: uploads go from the browser straight to S3, which only allows the hosted app plus the `allowed_origins` in `terraform.tfvars` (default `["http://localhost:3001"]`). Add your origin there and run `bash deploy.sh` again.',
      '**Quibble**: the HTTP API allows the S3 website addresses plus one `ExtraCorsOrigin` (default `http://localhost:5050`). Deploy with yours: `npm run deploy -- ExtraCorsOrigin=http://localhost:5173`.',
      "Your own Lambda behind API Gateway? Return the CORS headers on **every** response, errors included (DropVault's `api.py` does this), and answer the `OPTIONS` preflight request.",
      'Browsers cache CORS answers for a while, so hard-refresh after a fix: Ctrl+Shift+R (Windows, Linux) or Cmd+Shift+R (macOS).',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'CORS',
      'Access-Control-Allow-Origin',
      'preflight',
      'blocked by CORS policy',
      'origin',
      'OPTIONS',
      'fetch',
      'XMLHttpRequest',
      'Failed to fetch',
    ],
  },

  // ------------------------------------------------------------------ credentials & permissions
  {
    id: 'access-denied-not-authorized',
    title: 'You are not allowed to do that (AccessDenied)',
    errorMessage:
      'An error occurred (AccessDenied) when calling the <Operation> operation: User: arn:aws:iam::123456789012:user/<name> is not authorized to perform: <service>:<Action> on resource: <arn> because no identity-based policy allows the <service>:<Action> action',
    cause:
      'AWS knows who you are, but no IAM policy on that user or role allows this action on this resource (or an explicit `Deny` blocks it). The message names the exact action and resource, which is your best clue. If it says `assumed-role/...`, the caller is a role (for example a Lambda function), not you.',
    fix: [
      'Check who you are: `aws sts get-caller-identity`. Make sure it is the user or profile you expected.',
      'Read the action in the message, for example `cloudformation:CreateChangeSet` or `s3:PutObject`. That is the missing permission.',
      'For your own CLI user: in the IAM console, give the user (or its group) a policy that allows that action. See [Create your working user](/setup/iam-user-and-keys).',
      "If the caller is a Lambda role (`assumed-role/...`), add the permission to that function's role in the template (`template.yaml` for SAM, the `.tf` files for Terraform) and deploy again, instead of editing it by hand in the console.",
      'A plain S3 `Access Denied` with no details can also come from a bucket policy, Block Public Access, a KMS key policy, or simply a wrong bucket or file name. Check those too.',
      'IAM changes can take a few seconds to apply. Wait a moment, then retry.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'AccessDenied',
      'AccessDeniedException',
      'not authorized to perform',
      'Access Denied',
      'permission',
      'IAM policy',
      'explicit deny',
      'Forbidden',
      'PutObject',
      'assumed-role',
    ],
  },
  {
    id: 'unable-to-locate-credentials',
    title: 'The AWS CLI cannot find your credentials',
    errorMessage: 'Unable to locate credentials. You can configure credentials by running "aws configure".',
    cause:
      'The AWS CLI (or a tool that uses the same settings, like SAM or Terraform) looked in all the usual places and found no access key or login session, so it cannot sign your request and AWS cannot tell who you are.',
    fix: [
      'Run `aws configure` and paste your access key ID and secret access key (see [Connect the AWS CLI](/setup/configure-aws-cli)).',
      "Saved them under a named profile? Add `--profile <name>` to the command, or set it for the session: `export AWS_PROFILE=<name>` (macOS, Linux, Git Bash) or `$env:AWS_PROFILE='<name>'` (PowerShell).",
      'Using IAM Identity Center (SSO)? Sign in first: `aws sso login --profile <name>`.',
      'WSL and Windows each have their own `.aws` folder. On Windows the files live in `C:\\Users\\<you>\\.aws\\`; inside WSL they are in `~/.aws/`.',
      'Check it worked: `aws sts get-caller-identity` should print your account ID.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'credentials',
      'aws configure',
      'profile',
      'NoCredentialsError',
      'Could not load credentials from any providers',
      'CredentialsProviderError',
      'AWS_PROFILE',
    ],
  },
  {
    id: 'invalid-client-token',
    title: 'AWS does not recognise your access key',
    errorMessage:
      'An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation: The security token included in the request is invalid.',
    cause:
      'The access key ID you sent does not exist (deleted, deactivated or mistyped), or the secret key does not match it (then the error is `SignatureDoesNotMatch`). A common hidden cause: old `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` environment variables override the keys you just saved with `aws configure`.',
    fix: [
      'See which keys the CLI is using and where they come from: `aws configure list`. The `Type` column says `env` or `shared-credentials-file`.',
      'If it says `env`, clear the old variables: `unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN` (macOS, Linux, Git Bash) or `Remove-Item Env:AWS_ACCESS_KEY_ID, Env:AWS_SECRET_ACCESS_KEY, Env:AWS_SESSION_TOKEN -ErrorAction SilentlyContinue` (PowerShell). Also check they are not set permanently in your system settings or shell profile.',
      'In the IAM console, open your user > **Security credentials** and check the key is **Active**. If in doubt, create a new access key and delete the old one.',
      'Run `aws configure` again and paste both values carefully, with no spaces at the ends. Then test with `aws sts get-caller-identity`.',
      'Fails in only one region? That region may be an opt-in region (such as Hyderabad, `ap-south-2`) that is not enabled for your account TODO(verify).',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'InvalidClientTokenId',
      'security token included in the request is invalid',
      'SignatureDoesNotMatch',
      'UnrecognizedClientException',
      'access key',
      'secret key',
      'aws configure list',
    ],
  },
  {
    id: 'expired-token',
    title: 'Your temporary credentials have expired',
    errorMessage:
      'An error occurred (ExpiredToken) when calling the GetCallerIdentity operation: The security token included in the request is expired',
    cause:
      'You are using temporary credentials (from IAM Identity Center / SSO, an assumed role, or a lab account such as AWS Academy) and they have run out. Temporary credentials last minutes to hours, on purpose.',
    fix: [
      'SSO profile: sign in again with `aws sso login --profile <name>`, then rerun your command.',
      'Lab account (AWS Academy, workshops): start the lab session again and copy the fresh credentials, including the `aws_session_token` line TODO(verify).',
      'Pasted temporary keys into environment variables earlier? The old `AWS_SESSION_TOKEN` keeps winning. Clear it (`unset AWS_SESSION_TOKEN` in bash, `Remove-Item Env:AWS_SESSION_TOKEN` in PowerShell) or open a new terminal.',
      'If the message says `Signature expired` or `RequestTimeTooSkewed` instead, your computer clock is wrong. Sync it (Windows: **Settings > Time & language > Date & time > Sync now**) and retry.',
      'Test with `aws sts get-caller-identity`.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'ExpiredToken',
      'ExpiredTokenException',
      'expired',
      'sso',
      'Token has expired and refresh failed',
      'session token',
      'AWS_SESSION_TOKEN',
      'Signature expired',
      'RequestTimeTooSkewed',
    ],
  },

  // ------------------------------------------------------------------ deploys
  {
    id: 'stack-rollback-complete',
    title: 'SAM deploy fails because the stack is in ROLLBACK_COMPLETE',
    errorMessage:
      'An error occurred (ValidationError) when calling the CreateChangeSet operation: Stack:arn:aws:cloudformation:ap-south-1:123456789012:stack/quibble/<id> is in ROLLBACK_COMPLETE state and can not be updated.',
    cause:
      'The very first deploy of this stack failed, and CloudFormation rolled back by deleting everything it had created. A stack in `ROLLBACK_COMPLETE` is an empty shell: it can only be deleted, never updated. The real reason is the first `CREATE_FAILED` line from that first deploy.',
    fix: [
      'Find the original reason: `aws cloudformation describe-stack-events --stack-name quibble --query "StackEvents[?ResourceStatus==\'CREATE_FAILED\'].[LogicalResourceId,ResourceStatusReason]" --output table` (works in PowerShell and bash).',
      'Fix that cause first. Common ones: a missing permission, a bucket policy blocked by Block Public Access ([see this fix](/troubleshooting#quibble-bucket-policy-blocked)), or a name that already exists.',
      'Delete the failed stack: `sam delete --stack-name quibble` (or `aws cloudformation delete-stack --stack-name quibble`), then wait until it is gone: `aws cloudformation wait stack-delete-complete --stack-name quibble`.',
      'Deploy again: `npm run deploy` for Quibble, or `sam deploy` for your own app.',
      'Next time, read the first red `CREATE_FAILED` row in the deploy output. The rows after it are only the rollback.',
    ],
    relatedProjects: ['quibble'],
    keywords: [
      'ROLLBACK_COMPLETE',
      'can not be updated',
      'ValidationError',
      'CreateChangeSet',
      'Failed to create changeset',
      'rollback',
      'CREATE_FAILED',
      'sam deploy',
      'CloudFormation',
    ],
  },
  {
    id: 'command-not-found',
    title: 'The terminal cannot find aws, sam or terraform',
    errorMessage:
      "'aws' is not recognized as an internal or external command, operable program or batch file.\nThe term 'sam' is not recognized as the name of a cmdlet, function, script file, or operable program.\nbash: terraform: command not found",
    cause:
      'Your shell looks for programs in the folders listed in the `PATH` variable. Either the tool is not installed, its folder is not on `PATH`, or the terminal was opened before you installed it and still has the old `PATH`.',
    fix: [
      'Close **every** terminal and VS Code window, open a new one and try again. Installers change `PATH`, but only new windows see the change.',
      'Check where it is: `where.exe aws` (Windows) or `which aws` (macOS, Linux, Git Bash). No result means it is not on `PATH`.',
      'Not installed? Follow [Install your tools](/setup/install-tools), [Install the SAM CLI](/setup/install-sam-cli) or [Install Terraform](/setup/install-terraform). On Windows, `winget install Amazon.AWSCLI`, `winget install Amazon.SAM-CLI` and `winget install Hashicorp.Terraform` also work TODO(verify).',
      "Installed but not found? The usual Windows folders are `C:\\Program Files\\Amazon\\AWSCLIV2\\` (aws) and `C:\\Program Files\\Amazon\\AWSSAMCLI\\bin\\` (sam). For the current PowerShell window: `$env:Path += ';C:\\Program Files\\Amazon\\AWSSAMCLI\\bin'`. To fix it for good, search the Start menu for **Edit the system environment variables** > **Environment Variables** > **Path** > **Edit** > **New**.",
      'Git Bash uses the same Windows `PATH`, but only picks up changes after you restart it. If you unzipped `terraform.exe` yourself, add its folder to `PATH` the same way.',
      'PowerShell says "running scripts is disabled on this system" for `npm` or `sam`? Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then open a new window TODO(verify).',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'not recognized',
      'command not found',
      'PATH',
      'sam',
      'terraform',
      'Windows',
      'cmdlet',
      'install',
      'where.exe',
      'running scripts is disabled',
    ],
  },

  // ------------------------------------------------------------------ Lambda
  {
    id: 'lambda-timeout',
    title: 'Your Lambda function runs out of time',
    errorMessage: 'Task timed out after 3.00 seconds',
    cause:
      'Lambda stops any function that runs longer than its timeout. The default is 3 seconds; Quibble sets 15 seconds for most functions and DropVault 15 to 30. Usually the code is stuck waiting: a slow external API, a loop that never ends, or a huge file. Newer runtimes may show `Status: timeout` on the `REPORT` log line as well TODO(verify).',
    fix: [
      'Find what was slow in the logs. Quibble: `aws logs tail /quibble/quibble/api --since 15m` (also `/quibble/quibble/websocket` and `/quibble/quibble/game-timer`). DropVault: `aws logs tail /aws/lambda/enclave-dev-<function> --since 15m`. In Git Bash, put `MSYS_NO_PATHCONV=1` in front so the `/...` name is not turned into a Windows path.',
      'If a call to another service or website hangs, give that call its own shorter timeout and handle the error, so your function fails fast with a clear message.',
      'Raise the timeout only if the work really needs it: `Timeout:` in `template.yaml` (SAM) or `timeout` in the `.tf` file (Terraform), then deploy again. The maximum is 900 seconds (15 minutes).',
      'Behind API Gateway, the browser gets an error first, because API Gateway waits only about 29 to 30 seconds TODO(verify). Long jobs need another design: start the work in the background and let the browser check back.',
      'More memory also gives a function more CPU, so CPU-heavy code finishes sooner (Quibble gives its `api` function 1769 MB because password hashing is CPU-bound).',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'Task timed out',
      'timed out',
      'timeout',
      'Status: timeout',
      'Sandbox.Timedout',
      'Endpoint request timed out',
      'Gateway Timeout',
      'duration',
      'Lambda',
    ],
  },
  {
    id: 'lambda-import-module-error',
    title: 'Lambda cannot find your code or a library (ImportModuleError)',
    errorMessage:
      "Runtime.ImportModuleError: Unable to import module '<module>': No module named '<package>'",
    cause:
      'Lambda started your function but could not load a file or library it needs. Either the handler setting points at a file or function that is not there, or a library was never packaged with the code. Lambda only has what you upload, plus the AWS SDK (`boto3` for Python, AWS SDK v3 for Node.js). Node.js prints `Cannot find module` or `Cannot find package` instead TODO(verify) exact wording.',
    fix: [
      'Read the name in the message. If it is your own file, check the handler setting matches the file and function name: Quibble uses `src/handlers/http.handler` (file `src/handlers/http.js`, export `handler`), DropVault uses `upload_file.lambda_handler` (file `upload_file.py`, function `lambda_handler`).',
      '**Quibble (SAM)**: run `sam build` before every `sam deploy`, so the libraries in `aws/backend/package.json` are packaged (`npm run deploy` does both). Add a new library with `npm install <package> --prefix aws/backend`.',
      '**DropVault (Terraform)**: libraries come from a layer that `terraform/build.sh` builds during `terraform apply`. If that step failed (often a wrong `python_bin` on Windows), fix it and run `bash deploy.sh` again. A new library has to be added as a layer in `build.sh` and `layers.tf`.',
      "Built on Windows or macOS? Libraries with compiled parts (like `rpds-py`, which `jsonschema` needs) must be Linux builds. DropVault's `build.sh` asks pip for Linux wheels (`--platform manylinux2014_x86_64`); for SAM, `sam build --use-container` builds inside a Lambda-like Docker container.",
      'Deploy again and test. The error appears in the function logs and in the response of a test invoke.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'ImportModuleError',
      'Runtime.ImportModuleError',
      'No module named',
      'Unable to import module',
      'Cannot find module',
      'Cannot find package',
      'ERR_MODULE_NOT_FOUND',
      'HandlerNotFound',
      'dependency',
      'layer',
      'node_modules',
    ],
  },

  // ------------------------------------------------------------------ region & S3
  {
    id: 'wrong-region-not-found',
    title: 'Resource not found (you are looking in the wrong region)',
    errorMessage:
      'An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id quibble does not exist',
    cause:
      'Most AWS resources live in one region. Your command (or the console) is pointed at a different region from the one you deployed to, so AWS really cannot see the stack, table or function there. The same mistake shows up as `ResourceNotFoundException`, `Function not found` or an empty console page.',
    fix: [
      "Check the CLI's region: `aws configure get region`. If it prints nothing, commands fail with `You must specify a region`. Set it with `aws configure set region ap-south-1`.",
      'Check the region in the top-right corner of the console. These projects use Mumbai (`ap-south-1`) unless you changed it. DropVault uses `aws_region` from `terraform.tfvars`, which can differ from your CLI region.',
      'For one command, add `--region ap-south-1`. The `AWS_REGION` and `AWS_DEFAULT_REGION` environment variables override your config, so check them too: `echo $AWS_REGION` (bash) or `$env:AWS_REGION` (PowerShell).',
      'Check the account too: `aws sts get-caller-identity`. Another profile means another account, where the resource really does not exist.',
      'Check the name. The Quibble stack is called `quibble` unless you set `QUIBBLE_STACK`.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'does not exist',
      'ResourceNotFoundException',
      'Requested resource not found',
      'Function not found',
      'region',
      'wrong region',
      'You must specify a region',
      'You can also configure your region by running "aws configure"',
      'NoRegionError',
      'ap-south-1',
    ],
  },
  {
    id: 's3-wrong-endpoint',
    title: 'S3 says to use a different endpoint (the bucket is in another region)',
    errorMessage:
      'The bucket you are attempting to access must be addressed using the specified endpoint. Please send all future requests to this endpoint.',
    cause:
      "Bucket names are global, but each bucket lives in one region. Your request went to the wrong region's S3 address (error code `PermanentRedirect`, status 301). It happens when your CLI region, your code's region or a hard-coded URL does not match the bucket's region. A similar message is `AuthorizationHeaderMalformed ... the region 'us-east-1' is wrong`.",
    fix: [
      "Find the bucket's region: `aws s3api get-bucket-location --bucket <bucket>`. A `null` location means `us-east-1`.",
      "Use that region: `aws s3 ls s3://<bucket> --region <region>`, or set it in your code, for example `boto3.client('s3', region_name='ap-south-1')`.",
      "In URLs, include the region: `https://<bucket>.s3.<region>.amazonaws.com/<key>`. Quibble's `WebsiteUrl` output already has this form.",
      "Presigned URLs must be made by a client set to the bucket's region too, or the browser gets this error or a signature error.",
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: [
      'PermanentRedirect',
      'specified endpoint',
      'S3',
      'bucket',
      'region',
      'Moved Permanently',
      'AuthorizationHeaderMalformed',
    ],
  },
  {
    id: 's3-website-403',
    title: 'Your S3-hosted website shows 403 Forbidden',
    errorMessage: '403 Forbidden\nCode: AccessDenied\nMessage: Access Denied',
    cause:
      'S3 refused to hand out the file. On a website bucket this nearly always means: the bucket policy does not allow public reads, Block Public Access is overriding that policy, or the file does not exist. When visitors may not list the bucket, S3 answers a missing file with 403 instead of 404, so a typo in the URL looks like a permission problem. On the HTTPS address the same error comes as XML: `<Code>AccessDenied</Code>`.',
    fix: [
      "Check the exact URL. Quibble's HTTPS address has no index page: `https://<bucket>.s3.<region>.amazonaws.com/` on its own gives 403, so always include the file, like `/index.html` or `/play.html?code=ABC123`.",
      'Check the file is really there: `aws s3 ls s3://<bucket>/`. For Quibble, `npm run publish` uploads the frontend again.',
      "Check the bucket policy allows `s3:GetObject` for everyone on `arn:aws:s3:::<bucket>/*` (Quibble's template adds this as `PublicReadForWebsite`).",
      'Check **Block Public Access** on the bucket and for the whole account (S3 console > **Block Public Access settings for this account** TODO(verify)). If public policies are blocked or restricted there, the bucket policy is ignored. Relax only the policy settings, and only for a bucket that is meant to be public.',
      "Private bucket behind CloudFront (DropVault's `cloudfront` mode)? Then the bucket stays private on purpose and CloudFront reads it through Origin Access Control, which DropVault's `web.tf` sets up. A 403 there usually means the file path is wrong.",
    ],
    relatedProjects: ['quibble', 'dropvault'],
    keywords: [
      '403',
      'Forbidden',
      'AccessDenied',
      'Access Denied',
      'S3 website',
      'static website',
      'bucket policy',
      'index.html',
      'Block Public Access',
      'RequestId',
      'HostId',
    ],
  },

  // ------------------------------------------------------------------ Quibble
  {
    id: 'quibble-bucket-policy-blocked',
    title: 'Quibble deploy fails on the S3 bucket policy (Block Public Access)',
    errorMessage:
      'CREATE_FAILED  AWS::S3::BucketPolicy  FrontendBucketPolicy  API: s3:PutBucketPolicy Access Denied',
    cause:
      'Quibble\'s frontend bucket needs a public-read bucket policy so players can load the game. When S3 **Block Public Access** is on for your whole account, S3 refuses any public bucket policy, so this one resource fails and the first deploy rolls back. TODO(verify) exact wording: newer messages may read `Resource handler returned message: "Access Denied ..."` or mention the `BlockPublicPolicy` setting.',
    fix: [
      'Open the S3 console > **Block Public Access settings for this account** > **Edit** TODO(verify).',
      'Untick only the two settings about **bucket policies** ("new public bucket policies" and "any public bucket or access point policies"), save, and confirm. Leave the two ACL settings ticked TODO(verify).',
      'If the stack is now in `ROLLBACK_COMPLETE`, delete it first: `sam delete --stack-name quibble` (see [the ROLLBACK_COMPLETE fix](/troubleshooting#stack-rollback-complete)).',
      "Deploy again: `npm run deploy`. Only this one bucket becomes public, and it holds nothing but the game's HTML, CSS and JavaScript.",
    ],
    relatedProjects: ['quibble'],
    keywords: [
      'BlockPublicPolicy',
      'public policies are blocked',
      'PutBucketPolicy',
      'FrontendBucketPolicy',
      'Block Public Access',
      'bucket policy',
      'Access Denied',
      'CREATE_FAILED',
    ],
  },
  {
    id: 'quibble-lambda-throttled',
    title: 'Quibble is slow or shows "Server busy" (Lambda quota of 10)',
    errorMessage:
      'Lambda concurrency quota is 10. A 250-player game needs 500 or more (the AWS standard is 1000).',
    cause:
      'New AWS accounts may run only 10 Lambda functions at the same time per region, shared by every function. A big game needs far more, so extra requests are throttled. Nothing is lost (the page retries and shows "Server busy, still trying…"), but phases arrive seconds late and last-moment answers can miss the deadline. API Gateway answers a throttled call with `500 {"message":"Internal Server Error"}`. `npm run preflight` prints the message above.',
    fix: [
      'Check your quota: `npm run quota:lambda` (or `aws lambda get-account-settings --query AccountLimit.ConcurrentExecutions`).',
      'Ask AWS for the standard 1,000 (free): `npm run quota:lambda -- --request`. It is usually approved within a day, so do it days before an event.',
      'Until it is raised, give late answers more time: `npm run deploy -- LateGraceMs=5000`. After the raise, set it back with `npm run deploy -- LateGraceMs=1500`.',
      'Run `npm run preflight` before the event. It fails until the quota is at least 500 (`npm run preflight -- --allow-degraded` accepts a low quota).',
      'Do not add reserved concurrency to the functions: it takes slots out of the shared pool, and is impossible on a 10-slot account. Watch Lambda throttles on the CloudWatch dashboard (the `DashboardUrl` output).',
    ],
    relatedProjects: ['quibble'],
    keywords: [
      'throttle',
      'throttled',
      'throttling',
      'TooManyRequestsException',
      'Rate Exceeded',
      'concurrency',
      'ConcurrentExecutions',
      'L-B99A9384',
      'Server busy',
      'quibble-lambda-throttles',
      'Internal Server Error',
      'quota',
    ],
  },
  {
    id: 'quibble-websocket-401',
    title: 'Quibble cannot connect: the WebSocket closes with 401 or 1006',
    errorMessage:
      "WebSocket connection to 'wss://<api-id>.execute-api.<region>.amazonaws.com/prod?token=<token>' failed: Error during WebSocket handshake: Unexpected response code: 401",
    cause:
      'The `$connect` Lambda checks the login token in the URL and answers 401 when it is missing, invalid, signed out or the player is banned, so API Gateway refuses the socket. In code you see close code **1006** (closed without a proper goodbye), which also happens when `$connect` is throttled. TODO(verify) exact wording: each browser words the console message a little differently.',
    fix: [
      'Log out and log in again to get a fresh token. After 3 failed attempts the page checks your login by itself.',
      'Redeployed from another computer, or deleted `aws/.jwt-secret`? The deploy made a new secret, so every old token is now invalid. Everyone just logs in again; to avoid it, always deploy from one machine.',
      'Fresh stack? Run `npm run publish` so the site gets a new `config.js` that points at the current `wsUrl`.',
      'Signed out everywhere or banned by an admin? Tokens issued before that stop working by design.',
      'Code 1006 with no 401 in the Network tab during a big game? That is probably Lambda throttling on `$connect`: see [the Lambda quota fix](/troubleshooting#quibble-lambda-throttled). Logs: `aws logs tail /quibble/quibble/websocket --since 15m` (in Git Bash, put `MSYS_NO_PATHCONV=1` in front).',
    ],
    relatedProjects: ['quibble'],
    keywords: [
      'WebSocket',
      'wss',
      '1006',
      '401',
      'handshake',
      'Unexpected response code',
      'unauthorized',
      '$connect',
      'Reconnecting',
      'token',
      'jwt-secret',
    ],
  },
  {
    id: 'quibble-sam-too-old',
    title: 'Your SAM CLI is too old for Quibble',
    errorMessage: 'AWS SAM CLI <version> is too old; 1.123.0 or newer is needed (game timer RecursiveLoop).',
    cause:
      "Quibble's game-timer function uses the `RecursiveLoop: Allow` setting, because the timer deliberately triggers itself for the next phase and AWS could otherwise stop it as a runaway loop TODO(verify). SAM CLI versions before 1.123 do not know this setting, so deploying fails. `npm run preflight` prints the message above. TODO(verify) exact wording of the error SAM itself shows on old versions.",
    fix: [
      'Check your version: `sam --version`.',
      'Upgrade it. Windows: download and run the latest installer, or `winget upgrade Amazon.SAM-CLI` TODO(verify). macOS with Homebrew: `brew upgrade aws-sam-cli` TODO(verify). Linux: download the new zip and run its installer with `--update` (`sudo ./sam-installation/install --update`) TODO(verify).',
      'Open a new terminal and run `sam --version` again. An older copy earlier on `PATH` (for example one installed with pip) can still win: `where.exe sam` (Windows) or `which -a sam` (macOS, Linux) lists every copy.',
      'Run `npm run preflight`, then `npm run deploy`.',
    ],
    relatedProjects: ['quibble'],
    keywords: [
      'sam --version',
      'SAM CLI',
      'too old',
      'RecursiveLoop',
      'upgrade',
      'AWS SAM CLI not found',
      'version',
    ],
  },

  // ------------------------------------------------------------------ DropVault
  {
    id: 'dropvault-ses-not-verified',
    title: 'DropVault cannot send share emails (SES not verified or sandbox)',
    errorMessage:
      'An error occurred (MessageRejected) when calling the SendEmail operation: Email address is not verified. The following identities failed the check in region AP-SOUTH-1: <email>',
    cause:
      'Amazon SES only sends from an address you have verified, and new accounts start in the **SES sandbox**, where it also only sends **to** verified addresses. If the address in the error is your `sender_email`, you have not clicked the verification link yet: DropVault answers 502 and the alert email quotes `MessageRejected: Email address is not verified.` If it is the recipient, you are in the sandbox, and the app says "While DropVault’s email is in test mode (the Amazon SES sandbox), it can only send to addresses verified in SES."',
    fix: [
      'Find the email AWS sent to your `sender_email` after the first deploy (check spam) and click the verification link.',
      'Check the status: `aws ses get-identity-verification-attributes --identities you@example.com --region ap-south-1` should say `Success`.',
      'Lost the email? Send it again: `aws ses verify-email-identity --email-address you@example.com --region ap-south-1`.',
      "While you are in the sandbox, verify a friend's address the same way for testing, or use **Copy link** or the QR code and send the link yourself.",
      'To email anyone, request production access in the SES console (**Account dashboard** > **Request production access**) TODO(verify). AWS reviews the request, which can take a day or more TODO(verify).',
      'Verified addresses and the sandbox are per region: verify in the same region as `aws_region` in `terraform.tfvars`.',
    ],
    relatedProjects: ['dropvault'],
    keywords: [
      'SES',
      'MessageRejected',
      'Email address is not verified',
      'sandbox',
      'test mode',
      'SendEmail',
      'verify',
      'share email',
      'production access',
      'identities failed the check',
    ],
  },
  {
    id: 'dropvault-cloudfront-blocked',
    title: 'CloudFront is blocked until AWS verifies your new account',
    errorMessage:
      'AccessDenied: Your account must be verified before you can add new CloudFront resources. To verify your account, please contact AWS Support',
    cause:
      'Brand-new AWS accounts cannot create CloudFront distributions until AWS Support verifies them. DropVault only creates CloudFront when `web_hosting = "cloudfront"`; the default, `amplify`, works on new accounts. TODO(verify) exact wording of the rest of the message.',
    fix: [
      'In `terraform/terraform.tfvars`, set `web_hosting = "amplify"` (the default).',
      'Run `bash deploy.sh` again. The app is published to Amplify Hosting, at an address like `https://main.<app-id>.amplifyapp.com`.',
      'Want CloudFront later? Open a case in the AWS Support Center asking AWS to verify your account for CloudFront, and paste the error message TODO(verify) which case type to choose.',
      'Once AWS confirms, set `web_hosting = "cloudfront"` and run `bash deploy.sh` again.',
    ],
    relatedProjects: ['dropvault'],
    keywords: [
      'CloudFront',
      'account must be verified',
      'AWS Support',
      'distribution',
      'web_hosting',
      'Amplify',
      'CreateDistribution',
      'new account',
    ],
  },
  {
    id: 'dropvault-deploy-sh-windows',
    title: 'DropVault deploy fails on Windows (bash or python not found)',
    errorMessage: 'Error: local-exec provisioner error\nexec: "/bin/bash": file does not exist',
    cause:
      "DropVault's deploy is a bash script, and during `terraform apply` Terraform runs `build.sh` with the `bash_bin` and `python_bin` from `terraform.tfvars` to build the Python layers (and uses `bash_bin` again on `terraform destroy`). The defaults, `/bin/bash` and `python3`, exist on macOS and Linux but not on Windows. Typing `bash` in PowerShell may also start WSL instead of Git Bash, which has its own tools and credentials. TODO(verify) exact wording of the Terraform error.",
    fix: [
      'Install Git for Windows (it includes Git Bash) and run the deploy from the **Git Bash** app: `cd terraform`, then `bash deploy.sh`.',
      'In `terraform/terraform.tfvars`, uncomment the Windows lines: `bash_bin = "C:/Program Files/Git/bin/bash.exe"` and `python_bin = "python"` (forward slashes are fine).',
      'Check Python works in Git Bash: `python --version`. If Windows says "Python was not found; run without arguments to install from the Microsoft Store", install Python from python.org and tick "Add python.exe to PATH", or turn off the Python aliases under **Settings > Apps > Advanced app settings > App execution aliases** TODO(verify).',
      "Prefer PowerShell? Call Git Bash directly so WSL is not used: `& 'C:\\Program Files\\Git\\bin\\bash.exe' deploy.sh` (from the `terraform` folder).",
      'Run `bash deploy.sh` again. Terraform picks up from where it stopped.',
    ],
    relatedProjects: ['dropvault'],
    keywords: [
      'deploy.sh',
      'Git Bash',
      'bash_bin',
      'python_bin',
      'local-exec',
      'provisioner',
      '/bin/bash',
      'python3',
      'Python was not found',
      'run without arguments to install from the Microsoft Store',
      'App execution aliases',
      'WSL',
      'Windows Subsystem for Linux',
      'build.sh',
      'file does not exist',
    ],
  },
  {
    id: 'terraform-no-credentials',
    title: 'Terraform cannot find your AWS credentials',
    errorMessage: 'Error: No valid credential sources found',
    cause:
      "Terraform's AWS provider looks for credentials in the same places as the AWS CLI (environment variables, the `.aws` credentials file, the profile you name). It found none it could use, so it stops before creating anything. Often the CLI works with a named profile that Terraform was never told about, or an SSO session has expired.",
    fix: [
      'Check the CLI first: `aws sts get-caller-identity`. If that fails too, fix it with [Connect the AWS CLI](/setup/configure-aws-cli).',
      'Using a named profile? Set `aws_profile = "<name>"` in `terraform/terraform.tfvars` (DropVault passes it to the provider), or set `AWS_PROFILE` before running.',
      'SSO profile: run `aws sso login --profile <name>` again, then retry.',
      'Git Bash, PowerShell and cmd all read the same `C:\\Users\\<you>\\.aws` folder, but WSL has its own. Run Terraform from a shell where `aws sts get-caller-identity` works.',
      "Run `bash deploy.sh` again, or check with `terraform plan -var-file=terraform.tfvars`. In PowerShell, quote that option: `terraform plan '-var-file=terraform.tfvars'`.",
    ],
    relatedProjects: ['dropvault'],
    keywords: [
      'No valid credential sources found',
      'terraform',
      'credentials',
      'provider',
      'aws_profile',
      'failed to refresh cached credentials',
      'IMDS',
      'AWS_PROFILE',
    ],
  },
  {
    id: 'dropvault-quota-413',
    title: 'DropVault refuses an upload: not enough storage (413)',
    errorMessage:
      '413 {"message": "Not enough storage space for this file", "used_bytes": <n>, "quota_bytes": 10737418240}',
    cause:
      'This is DropVault\'s own storage limit, not an AWS limit. Each user may store `user_quota_bytes` (10 GiB by default). The upload is refused before it starts if it will not fit, and checked again when it completes, using the size S3 actually stored; a file that does not fit then is deleted. The web app shows "Not enough storage for <file> (<size>). You have <free> free."',
    fix: [
      'Look at the usage bar on the Files page and delete files you no longer need. Deleting gives the space back.',
      "Uploads still in progress count in the browser's check, so let other uploads finish first.",
      'Admin? Open `/admin`, find the user, and set their storage limit (`0` means unlimited).',
      'To change the default for everyone, set `user_quota_bytes` in `terraform/terraform.tfvars` (`0` = unlimited) and run `bash deploy.sh` again.',
      'Mind the cost: S3 storage is billed per GB per month (about USD 0.025 per GB TODO(verify)), so an unlimited quota on a public demo is risky.',
    ],
    relatedProjects: ['dropvault'],
    keywords: [
      '413',
      'quota',
      'storage',
      'Not enough storage',
      'Payload Too Large',
      'user_quota_bytes',
      'quota_bytes',
      'upload',
      'storage limit',
      'full',
    ],
  },
];
