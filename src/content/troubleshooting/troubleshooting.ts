import type { TroubleshootingItem } from '../../lib/types';

/** Real errors beginners hit, searchable by pasting the error text on /troubleshooting. */
export const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: 'unable-to-locate-credentials',
    title: 'The AWS CLI cannot find your credentials',
    errorMessage: 'Unable to locate credentials. You can configure credentials by running "aws configure".',
    cause: 'The AWS CLI has no access key or SSO session to sign requests with, so AWS cannot tell who you are.',
    fix: [
      'Run `aws configure` and paste your access key ID and secret access key (see [Connect the AWS CLI](/setup/configure-aws-cli)).',
      'If you use a named profile, add `--profile <name>` or set the `AWS_PROFILE` environment variable.',
      'Check it worked with `aws sts get-caller-identity`.',
    ],
    relatedProjects: ['dropvault', 'quibble'],
    keywords: ['credentials', 'aws configure', 'profile'],
  },
];
