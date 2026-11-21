import type { Project } from '../../../lib/types';

/**
 * Example project with FAKE but complete data, showing every field filled in.
 * Hidden from the gallery; open /projects/example-project to test components.
 */
const project: Project = {
  slug: 'example-project',
  title: 'Photo Notes: an example project',
  tagline: 'Snap a photo, add a note, find it later. A tiny app that exists only to demo this site.',
  difficulty: 'beginner',
  estimatedBuildTime: '1 hour',
  freeTierFriendly: { value: true, note: 'A few hundred requests a month stays inside the Free Tier. TODO(verify)' },
  githubUrl: 'https://github.com/example/photo-notes',
  githubBranch: 'main',
  sourceFolder: 'example-project',
  iac: 'sam',
  stack: ['Python 3.12', 'AWS SAM', 'HTML/JS'],
  order: 99,
  hidden: true,
  whatYouLearn: [
    'How a browser talks to **API Gateway**',
    'Running code with **Lambda** without a server',
    'Saving notes in **DynamoDB** and photos in **S3**',
    'Uploading straight to S3 with a presigned URL',
  ],
  services: [
    {
      serviceSlug: 'api-gateway',
      roleInThisProject: 'Receives `POST /notes` and `GET /notes` from the browser and calls the Lambda function.',
      analogy: 'A reception desk that checks your request and points you to the right room.',
      whyNotAlternative: 'Calling Lambda directly from a browser needs AWS credentials; API Gateway gives a normal HTTPS URL.',
    },
    {
      serviceSlug: 'lambda',
      roleInThisProject: 'Validates the note, saves it, and signs an upload URL for the photo.',
      analogy: 'A chef who only cooks when an order comes in.',
      whyNotAlternative: 'An EC2 server would run (and cost) all day even when nobody uses the app.',
    },
    {
      serviceSlug: 'dynamodb',
      roleInThisProject: 'Stores each note (text, photo key, date) as one item.',
      analogy: 'A labelled filing cabinet.',
      whyNotAlternative: 'A relational database is overkill for a single list of notes and has to keep running.',
    },
    {
      serviceSlug: 's3',
      roleInThisProject: 'Keeps the photos. The browser uploads straight to it.',
      analogy: 'A cloud folder with unlimited space.',
      whyNotAlternative: 'Storing images inside DynamoDB items hits the 400 KB item limit.',
    },
  ],
  architecture: {
    nodes: [
      { id: 'browser', kind: 'browser', label: 'Browser', sublabel: 'index.html', position: { x: 0, y: 120 }, mobilePosition: { x: 0, y: 0 }, description: 'The web page where you type a note and pick a photo.' },
      { id: 'api', kind: 'service', serviceSlug: 'api-gateway', label: 'API Gateway', sublabel: 'HTTP API', position: { x: 270, y: 120 }, mobilePosition: { x: 0, y: 140 } },
      { id: 'fn', kind: 'service', serviceSlug: 'lambda', label: 'Lambda: notes', sublabel: 'notes.py', position: { x: 540, y: 120 }, mobilePosition: { x: 0, y: 280 } },
      { id: 'table', kind: 'service', serviceSlug: 'dynamodb', label: 'Notes table', sublabel: 'DynamoDB', position: { x: 810, y: 40 }, mobilePosition: { x: 0, y: 420 } },
      { id: 'bucket', kind: 'service', serviceSlug: 's3', label: 'Photos bucket', sublabel: 'private', position: { x: 810, y: 210 }, mobilePosition: { x: 200, y: 420 } },
    ],
    edges: [
      { id: 'e1', source: 'browser', target: 'api', label: 'POST /notes' },
      { id: 'e2', source: 'api', target: 'fn', label: 'invoke' },
      { id: 'e3', source: 'fn', target: 'table', label: 'PutItem' },
      { id: 'e4', source: 'fn', target: 'bucket', label: 'sign upload URL', style: 'dashed' },
      { id: 'e5', source: 'browser', target: 'bucket', label: 'PUT photo (presigned)' },
    ],
  },
  flows: [
    {
      id: 'save-note',
      title: 'Saving a note',
      summary: 'From the Save button to a row in DynamoDB.',
      steps: [
        { edgeId: 'e1', title: 'The browser sends the note', explanation: 'A fetch() call posts the text and the photo file name to the API.', payloadExample: { text: 'Lab 3 whiteboard', photo: 'board.jpg' } },
        { edgeId: 'e2', title: 'API Gateway calls Lambda', explanation: 'It wraps the HTTP request in an event object and invokes the function.' },
        { nodeId: 'fn', title: 'Lambda checks the input', explanation: 'Empty notes are rejected with a 400 before anything is saved.' },
        { edgeId: 'e3', title: 'The note is saved', explanation: 'One PutItem call writes the note to the table.', payloadExample: { pk: 'NOTE#8f2c', text: 'Lab 3 whiteboard' } },
        { edgeId: 'e2', reverse: true, title: 'Lambda answers', explanation: 'It returns the new note id and a presigned upload URL.' },
        { edgeId: 'e1', reverse: true, title: 'The browser gets the reply', explanation: 'The page shows the note and starts the photo upload.' },
      ],
    },
    {
      id: 'upload-photo',
      title: 'Uploading the photo',
      summary: 'Bytes go straight to S3, not through Lambda.',
      steps: [
        { edgeId: 'e4', title: 'Lambda signs an upload URL', explanation: 'Signing happens locally with the function\'s credentials; no S3 call is needed.' },
        { edgeId: 'e5', title: 'The browser uploads directly', explanation: 'A PUT to the presigned URL sends the photo to S3. Lambda never touches the bytes.' },
      ],
    },
  ],
  whatIfs: [
    {
      id: 'many-users',
      question: '1,000 classmates save notes at the same time?',
      answer: 'API Gateway and Lambda scale out automatically, running many copies of the function in parallel. DynamoDB on-demand absorbs the burst. You pay per request, so a busy minute costs only a little more.',
      relatedNodeIds: ['api', 'fn', 'table'],
    },
    {
      id: 'big-photo',
      question: 'someone uploads a 50 MB photo?',
      answer: 'Because the upload goes straight to S3, Lambda\'s 6 MB request limit does not apply. You could still cap the size when signing the URL.',
      relatedNodeIds: ['browser', 'bucket'],
    },
  ],
  codePeeks: [
    {
      id: 'sign-url',
      nodeId: 'fn',
      title: 'Signing the upload URL',
      language: 'python',
      filePath: 'src/notes.py',
      code: 'url = s3.generate_presigned_url(\n    "put_object",\n    Params={"Bucket": BUCKET, "Key": key},\n    ExpiresIn=900,\n)',
      explanation: 'The URL is valid for 15 minutes and only for this one object key.',
      highlightLines: [4],
    },
  ],
  prerequisites: ['create-aws-account', 'configure-aws-cli', 'install-sam-cli'],
  costBreakdown: [
    { service: 'Lambda', freeTierCovers: '1M requests a month TODO(verify)', beyondFreeTier: 'Fractions of a cent per thousand requests TODO(verify)' },
    { service: 'S3', freeTierCovers: '5 GB of storage for 12 months TODO(verify)', beyondFreeTier: 'About $0.025 per GB-month TODO(verify)' },
  ],
};

export default project;
