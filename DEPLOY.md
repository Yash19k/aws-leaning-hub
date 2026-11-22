# Deploying the AWS Learning Hub

The site is static files in a **private S3 bucket** behind **CloudFront**, defined in
[`infra/template.yaml`](infra/template.yaml) (plain CloudFormation, deployed with the SAM CLI so it
matches what students learn). GitHub Actions deploys every push to `main` using **GitHub OIDC**:
no AWS access keys are stored in GitHub.

```
Browser ──HTTPS──► CloudFront ──(OAC-signed GetObject)──► S3 bucket (private)
                     │  viewer-request: CloudFront Function adds /index.html to extension-less paths
                     └─ 403/404 from S3 → /index.html (200), so React Router deep links work
GitHub Actions ──OIDC──► IAM deploy role ──► s3 sync + cloudfront create-invalidation
```

## Two hosting modes

`infra/template.yaml` has a `HostingMode` parameter:

| Mode | What it creates | When |
| --- | --- | --- |
| `amplify` (default) | An AWS Amplify Hosting app; `deploy:site` uploads `dist/` as a zip (manual deployment) | Works on any account. **The live site uses this** (`https://aws-learning-hub.d1mth3xfrof3ju.amplifyapp.com`) |
| `cloudfront` | Private S3 bucket + CloudFront + OAC + CloudFront Function (described below) | Once AWS Support has enabled CloudFront on the account |

In `amplify` mode the address is `https://<SiteBranchName>.<app-id>.amplifyapp.com`. Amplify picks the
app ID; the `SiteBranchName` parameter (default `aws-learning-hub`) sets the first part. The site's first
address, `https://main.<app-id>.amplifyapp.com`, is kept: `deploy:site` publishes a one-file page to the
`main` branch that forwards every path to the same path on the site branch.

Switch with `cd infra && sam deploy --parameter-overrides HostingMode=cloudfront`, then `npm run deploy:site`
(the script reads the stack outputs and picks the right upload path). The site URL changes, so update any shared links.

## Before you start

- AWS CLI v2 configured (`aws sts get-caller-identity` works) and the AWS SAM CLI installed.
- Node.js 22+.
- **CloudFront must be enabled on the account.** New AWS accounts can be blocked from creating
  CloudFront distributions until AWS Support verifies the account. If the stack fails with an
  account-verification error on `Distribution`, open a support case (Account and billing) asking
  them to enable CloudFront, then deploy again. TODO(verify) the exact error text.
- A billing alarm on the account that hosts the site.

## 1. Build

```bash
npm ci
npm run build      # validate content -> type-check -> vite build -> pre-render page meta
```

`dist/` now holds the app plus one `index.html` per known route (e.g. `dist/projects/dropvault/index.html`).

## 2. Create the infrastructure (once)

```bash
npm run deploy:infra        # = cd infra && sam deploy
```

SAM shows the change set; type `y`. It creates the bucket, the Origin Access Control, the CloudFront
Function, the distribution (this step takes several minutes), the GitHub OIDC provider and the deploy
role. Then note the outputs:

| Output | Use |
| --- | --- |
| `SiteUrl` | the live site (`https://<id>.cloudfront.net`) |
| `BucketName` | where `deploy:site` uploads |
| `DistributionId` | what `deploy:site` invalidates |
| `DeployRoleArn` | the role GitHub Actions assumes |

**Already have a GitHub OIDC provider** in the account (one per account)? Deploy with:

```bash
cd infra
sam deploy --parameter-overrides CreateGitHubOidcProvider=false ExistingGitHubOidcProviderArn=arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com
```

**Forked the repo?** Add `GitHubRepo=<owner>/<repo>` to the overrides; the role only trusts that repo's `main` branch.

## 3. Publish the site

```bash
npm run deploy:site
```

[`scripts/deploy-site.ts`](scripts/deploy-site.ts) reads the stack outputs and:

1. uploads `assets/` (content-hashed JS/CSS/fonts) with `Cache-Control: public, max-age=31536000, immutable`
2. uploads other static files with `max-age=86400`
3. uploads every `*.html` with `max-age=0, must-revalidate`
4. deletes files that no longer exist (old hashed assets are kept so open tabs keep working)
5. creates a CloudFront invalidation for `/*`

Set `STACK_NAME` / `AWS_REGION` to override the defaults (`aws-learning-hub`, `ap-south-1`).

## 4. Turn on automatic deploys (GitHub OIDC)

1. GitHub repo → **Settings → Secrets and variables → Actions → Variables** → add
   `AWS_DEPLOY_ROLE_ARN` = the `DeployRoleArn` output. (It is not a secret: without a token from
   this repo's `main` branch, nobody can assume the role.)
2. Optional: **Settings → Environments → New environment** `production` to require approval before deploys.
3. Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs lint + build on
   every push and pull request, and on `main` it assumes the role and runs `npm run deploy:site`.

The role can only `ListBucket`/`Get`/`Put`/`DeleteObject` on this bucket, invalidate this distribution and
read this stack's outputs. Nothing else.

## 5. Check it

- Open `SiteUrl`.
- Open a deep link directly in a new tab, e.g. `<SiteUrl>/projects/dropvault/build`. It must load the page,
  not an error. If it shows an XML `AccessDenied`, the custom error responses or the CloudFront Function are missing.
- Open a made-up path like `<SiteUrl>/nope`: the site's own 404 page should appear.

## Custom domain (optional)

1. Request a certificate in **ACM in us-east-1** (CloudFront only uses us-east-1 certificates) and validate it by DNS.
2. Uncomment `Aliases` and `ViewerCertificate` in `infra/template.yaml`, fill them in, run `npm run deploy:infra`.
3. Point a CNAME (or a Route 53 alias record) for the domain at the distribution domain name.

## Cost

No servers. You pay for S3 storage and requests, CloudFront data transfer and requests, and invalidation
paths beyond the free allowance. A club-sized audience fits in the Free Tier. TODO(verify) current CloudFront
and S3 Free Tier amounts for your account's plan.

## Tear down

```bash
aws s3 rm s3://<BucketName> --recursive
cd infra && sam delete
```

CloudFront distributions take a few minutes to disable and delete; `sam delete` waits for it.
