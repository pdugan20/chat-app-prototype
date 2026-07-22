import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');
const workflowsDirectory = join(root, '.github', 'workflows');
const workflowFiles = readdirSync(workflowsDirectory)
  .filter(file => /\.ya?ml$/.test(file))
  .sort();
const workflows = new Map(
  workflowFiles.map(file => [file, read(`.github/workflows/${file}`)])
);

const ci = workflows.get('ci.yml');
const codeql = workflows.get('codeql.yml');
const prLint = workflows.get('pr-lint.yml');
const release = workflows.get('release.yml');
const dependabot = read('.github/dependabot.yml');
const pkg = JSON.parse(read('package.json'));

function indentedBlock(text, heading, nextIndent) {
  const start = text.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading.trim()}`);
  const tail = text.slice(start + heading.length);
  const endPattern = new RegExp(`^ {${nextIndent}}\\S`, 'm');
  const end = tail.search(endPattern);
  return end === -1 ? tail : tail.slice(0, end);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function assertDependabotCooldownPolicy(text) {
  const updateHeadings = [
    ...text.matchAll(/^  - package-ecosystem:\s*['"]?([a-z-]+)['"]?\s*$/gm),
  ];
  assert.deepEqual(
    updateHeadings.map(([, ecosystem]) => ecosystem).sort(),
    ['github-actions', 'npm'],
    'Dependabot must contain exactly one npm updater and one github-actions updater'
  );

  for (const ecosystem of ['npm', 'github-actions']) {
    const headingIndex = updateHeadings.findIndex(
      ([, candidate]) => candidate === ecosystem
    );
    const start = updateHeadings[headingIndex].index;
    const end = updateHeadings[headingIndex + 1]?.index ?? text.length;
    const block = text.slice(start, end);
    assert.match(
      block,
      /^    cooldown:\s*\n      default-days:\s*14\s*$/m,
      `${ecosystem} must delay newly released versions for 14 days`
    );
    assert.equal(
      count(block, /^    cooldown:\s*$/gm),
      1,
      `${ecosystem} must declare exactly one cooldown block`
    );
  }
  assert.equal(
    count(text, /cooldown:\s*\n\s+default-days:\s*14/g),
    2,
    'Dependabot must declare exactly two 14-day cooldowns'
  );
}

function jobNames(text) {
  return [
    ...indentedBlock(text, 'jobs:\n', 0).matchAll(
      /^ {2}([a-z0-9][a-z0-9-]*):\s*$/gm
    ),
  ].map(match => match[1]);
}

function assertNoPullRequestMutation(text, source) {
  assert.doesNotMatch(
    text,
    /gh\s+(?:api\b|pr\s+(?:merge|review)\b)|--auto\b|https?:\/\/api\.github\.com|\/pulls\/[^\s'"]+\/merge|enablePullRequestAutoMerge|mergePullRequest|approvePullRequest|createReview|submitReview|github\.rest\.pulls\.(?:merge|createReview)|github\.graphql|octokit\.request/i,
    `${source} contains a PR merge or approval path`
  );
}

function assertNoMergeAction(actionRef, source) {
  assert.doesNotMatch(
    actionRef,
    /\/[^@]*merge/i,
    `${source} contains a merge-capable action: ${actionRef}`
  );
}

function assertNoBroadPermissionForm(text, source) {
  assert.doesNotMatch(
    text,
    /^\s*permissions\s*:\s*(?:write-all\b|\{[^\n}]*\bwrite\b)/m,
    `${source} contains a broad or inline writable permission map`
  );
}

function assertLeastPrivilegePermissions(text, file) {
  assertNoBroadPermissionForm(text, file);

  const approvedWritableScopes = new Map([
    ['ci.yml', ['pull-requests']],
    ['codeql.yml', ['security-events']],
    ['pr-lint.yml', []],
    ['release.yml', []],
  ]);
  const writableScopes = [
    ...text.matchAll(/^\s+([a-z][a-z-]*):\s*write\s*(?:#.*)?$/gm),
  ].map(match => match[1]);
  assert.deepEqual(
    writableScopes,
    approvedWritableScopes.get(file) ?? [],
    `${file} contains an unapproved writable permission scope`
  );

  if (!approvedWritableScopes.has(file)) {
    assert.equal(
      count(text, /^\s*permissions\s*:/gm),
      1,
      `${file} must declare exactly one explicit read-only permission block`
    );
    assert.equal(
      count(text, /^permissions:\s*$/gm),
      1,
      `${file} must declare its read-only permission block at workflow scope`
    );
    assert.equal(
      indentedBlock(text, 'permissions:\n', 0).trim(),
      'contents: read',
      `${file} must default to contents: read and nothing else`
    );
  }
}

test('dependency automation cannot approve or merge pull requests', () => {
  assert.equal(
    workflowFiles.includes('dependabot-auto-merge.yml'),
    false,
    'the legacy Dependabot merge workflow must be deleted'
  );

  for (const [file, text] of workflows) {
    assertNoPullRequestMutation(text, file);
    assertLeastPrivilegePermissions(text, file);
  }
});

test('policy guards reject alternate merge and permission bypass forms', () => {
  assert.throws(
    () =>
      assertNoPullRequestMutation(
        'run: gh api --method PUT repos/example/example/pulls/1/merge',
        'fixture'
      ),
    /PR merge or approval path/
  );
  assert.throws(
    () => assertNoBroadPermissionForm('permissions: write-all', 'fixture'),
    /broad or inline writable permission map/
  );
  assert.throws(
    () =>
      assertNoBroadPermissionForm(
        'permissions: { contents: read, pull-requests: write }',
        'fixture'
      ),
    /broad or inline writable permission map/
  );
  assert.throws(
    () =>
      assertLeastPrivilegePermissions(
        'permissions:\n  contents: write\n',
        'new-workflow.yml'
      ),
    /unapproved writable permission scope/
  );
  assert.throws(
    () => assertLeastPrivilegePermissions('name: New workflow\n', 'new.yml'),
    /exactly one explicit read-only permission block/
  );
  assert.throws(
    () =>
      assertLeastPrivilegePermissions(
        'name: New workflow\njobs:\n  first:\n    runs-on: ubuntu-latest\n  second:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n',
        'job-only.yml'
      ),
    /at workflow scope/
  );
  assert.throws(
    () =>
      assertNoMergeAction(
        'example/merge-action@0123456789abcdef0123456789abcdef01234567',
        'fixture'
      ),
    /merge-capable action/
  );
  assert.throws(
    () =>
      assertDependabotCooldownPolicy(`
version: 2
updates:
  - package-ecosystem: npm
    cooldown:
      default-days: 14
  - package-ecosystem: npm
    cooldown:
      default-days: 14
  - package-ecosystem: github-actions
`),
    /exactly one npm updater and one github-actions updater/
  );
});

test('every external action is pinned to an immutable commit', () => {
  for (const [file, text] of workflows) {
    const actionLines = [...text.matchAll(/^\s*-?\s*uses:\s*(.+?)\s*$/gm)];
    assert.equal(
      actionLines.length,
      count(text, /^\s*-?\s*uses\s*:/gm),
      `${file} contains an action reference the strict validator did not discover`
    );

    for (const [, rawAction] of actionLines) {
      const [actionRef] = rawAction.split(/\s+#\s*/, 1);
      if (actionRef.startsWith('./') || actionRef.startsWith('docker://'))
        continue;
      assert.match(
        actionRef,
        /^[^\s@]+@[0-9a-f]{40}$/,
        `${file} has a mutable action reference: ${actionRef}`
      );
      assert.doesNotMatch(
        actionRef,
        /auto.?merge|merge-pull-request|pull-request-automerge/i,
        `${file} contains an auto-merge action: ${actionRef}`
      );
      assertNoMergeAction(actionRef, file);
      const versionComment = rawAction.match(/^\S+\s+#\s*(v\d+)\s*$/)?.[1];
      assert.match(
        versionComment ?? '',
        /^v\d+$/,
        `${file} must document the reviewed major for ${actionRef}`
      );
    }
  }
});

test('the Node, npm, and local lint toolchain is deterministic', () => {
  assert.equal(pkg.packageManager, 'npm@11.5.2');
  assert.equal(pkg.engines?.node, '22.x');
  assert.equal(pkg.engines?.npm, '11.x');
  assert.equal(pkg.devDependencies['claude-code-lint'], '0.2.0-beta.2');

  for (const [file, text] of workflows) {
    const installs = [...text.matchAll(/^\s*run:\s*npm ci\s*$/gm)];
    const installCount = installs.length;
    assert.equal(
      installCount,
      count(text, /\bnpm ci\b/g),
      `${file} contains an npm ci invocation the strict validator did not discover`
    );
    if (installCount === 0) continue;

    assert.equal(
      count(text, /node-version:\s*['"]?22\.18\.0['"]?/g),
      installCount,
      `${file} must select Node 22.18.0 before every npm ci`
    );
    assert.equal(
      count(text, /run:\s*npm install --global npm@11\.5\.2/g),
      installCount,
      `${file} must install npm 11.5.2 before every npm ci`
    );
    assert.equal(
      count(text, /run:\s*test "\$\(npm --version\)" = "11\.5\.2"/g),
      installCount,
      `${file} must verify npm 11.5.2 before every npm ci`
    );

    for (const install of installs) {
      const prefix = text.slice(0, install.index);
      const jobStarts = [...prefix.matchAll(/^ {2}[a-z0-9-]+:\s*$/gm)];
      const jobStart = jobStarts.at(-1)?.index ?? 0;
      const jobPrefix = prefix.slice(jobStart);
      const nodeIndex = jobPrefix.lastIndexOf("node-version: '22.18.0'");
      const npmIndex = jobPrefix.lastIndexOf(
        'run: npm install --global npm@11.5.2'
      );
      const verifyIndex = jobPrefix.lastIndexOf(
        'run: test "$(npm --version)" = "11.5.2"'
      );

      assert.ok(
        nodeIndex >= 0 && nodeIndex < npmIndex && npmIndex < verifyIndex,
        `${file} must select Node, install npm, and verify npm in order before npm ci`
      );
    }
  }

  assert.match(ci, /run:\s*npm run lint:claude/);
  assert.doesNotMatch(ci, /npx\s+claude-code-lint(?:@latest)?/);
  const codeQualityBlock = indentedBlock(ci, '  code-quality:\n', 2);
  const installIndex = codeQualityBlock.indexOf('run: npm ci');
  const policyIndex = codeQualityBlock.indexOf(
    'run: npm run test:automation-policy'
  );
  const claudeIndex = codeQualityBlock.indexOf('run: npm run lint:claude');
  assert.ok(
    installIndex >= 0 &&
      installIndex < policyIndex &&
      policyIndex < claudeIndex,
    'Code Quality Checks must enforce policy immediately after install and before application validation'
  );
  assert.equal(
    count(ci, /run:\s*npm run test:automation-policy/g),
    1,
    'automation policy must run exactly once in required CI'
  );
  assert.equal(
    indentedBlock(
      codeQualityBlock,
      '      - name: Validate automation policy\n',
      6
    ).trim(),
    'run: npm run test:automation-policy',
    'automation policy step must be unconditional and blocking'
  );
});

test('Dependabot groups only patch and minor updates with bounded queues', () => {
  assert.equal(
    count(dependabot, /timezone:\s*['"]America\/Los_Angeles['"]/g),
    2
  );
  assertDependabotCooldownPolicy(dependabot);
  assert.match(
    dependabot,
    /package-ecosystem:\s*['"]npm['"][\s\S]*?open-pull-requests-limit:\s*5/
  );
  assert.match(
    dependabot,
    /package-ecosystem:\s*['"]github-actions['"][\s\S]*?open-pull-requests-limit:\s*2/
  );
  assert.equal(
    count(
      dependabot,
      /dependency-name:\s*['"]\*['"][\s\S]*?update-types:\s*\[['"]version-update:semver-major['"]\]/g
    ),
    2,
    'both ecosystems must ignore major upgrades'
  );

  for (const group of [
    'expo',
    'react-native',
    'storybook',
    'ai-sdks',
    'dev-dependencies',
    'actions-minor-patch',
  ]) {
    const block = indentedBlock(dependabot, `      ${group}:\n`, 6);
    assert.match(
      block,
      /update-types:\s*\n\s*- ['"]minor['"]\s*\n\s*- ['"]patch['"]/,
      `${group} must contain only patch/minor update types`
    );
    assert.doesNotMatch(block, /major/);
  }
});

test('ordinary CI is read-only and preserves required job identities', () => {
  assert.deepEqual(jobNames(ci), [
    'code-quality',
    'test',
    'build-validation',
    'bundle-comment',
    'summary',
  ]);
  assert.equal(
    count(ci, /^\s*permissions\s*:/gm),
    2,
    'CI must contain only the top-level read block and bundle-comment write block'
  );
  assert.equal(
    indentedBlock(ci, 'permissions:\n', 0).trim(),
    'contents: read',
    'ordinary CI must default to contents: read and nothing else'
  );
  assert.doesNotMatch(ci, /^\s+contents:\s*write\s*$/m);
  assert.doesNotMatch(ci, /\bnode_modules\b/);

  assert.match(ci, /^\s+code-quality:\s*\n\s+name:\s*Code Quality Checks\s*$/m);
  assert.match(ci, /^\s+test:\s*\n\s+name:\s*Unit Tests\s*$/m);
  assert.match(
    ci,
    /^\s+build-validation:\s*\n\s+name:\s*Build Validation\s*$/m
  );
  assert.match(ci, /^\s+summary:\s*\n\s+name:\s*CI Summary\s*$/m);
  assert.match(ci, /needs:\s*\[code-quality, test, build-validation\]/);
  assert.equal(
    count(ci, /^\s+[a-z-]+:\s*write\s*$/gm),
    1,
    'only the isolated bundle comment may request write permission'
  );

  const summaryBlock = indentedBlock(ci, '  summary:\n', 2);
  assert.match(summaryBlock, /if:\s*always\(\)/);
  assert.doesNotMatch(summaryBlock, /continue-on-error/);
  assert.equal(
    count(
      summaryBlock,
      /\[ "\$\{\{ needs\.(?:code-quality|test|build-validation)\.result \}\}" != "success" \]/g
    ),
    3,
    'CI Summary must fail unless all required jobs succeed'
  );
  const failureIfIndex = summaryBlock.indexOf(
    'if [ "${{ needs.code-quality.result }}" != "success" ]'
  );
  const thenIndex = summaryBlock.indexOf('; then', failureIfIndex);
  const exitIndex = summaryBlock.indexOf('exit 1', thenIndex);
  const fiIndex = summaryBlock.indexOf('\n          fi', exitIndex);
  assert.ok(
    failureIfIndex >= 0 &&
      thenIndex > failureIfIndex &&
      exitIndex > thenIndex &&
      fiIndex > exitIndex,
    'CI Summary comparisons must execute exit 1 in their failure branch'
  );
});

test('CI cancellation keeps every push-to-main canary', () => {
  assert.match(
    ci,
    /group:\s*\$\{\{ github\.workflow \}\}-\$\{\{ github\.event\.pull_request\.number \|\| github\.run_id \}\}/
  );
  assert.match(
    ci,
    /cancel-in-progress:\s*\$\{\{ github\.event_name == ['"]pull_request['"] \}\}/
  );
});

test('bundle comments are isolated from untrusted code and required checks', () => {
  const buildBlock = indentedBlock(ci, '  build-validation:\n', 2);
  const commentBlock = indentedBlock(ci, '  bundle-comment:\n', 2);
  const summaryBlock = indentedBlock(ci, '  summary:\n', 2);

  assert.match(
    buildBlock,
    /outputs:\s*\n\s+bundle_size_mb:\s*\$\{\{ steps\.bundle_size\.outputs\.bundle_size_mb \}\}/
  );
  assert.doesNotMatch(buildBlock, /pull-requests:\s*write|github-script/);
  assert.match(commentBlock, /needs:\s*build-validation/);
  assert.equal(
    indentedBlock(commentBlock, '    permissions:\n', 4).trim(),
    'pull-requests: write',
    'the bundle comment job must have only pull-requests: write'
  );
  assert.doesNotMatch(commentBlock, /actions\/checkout|\brun:/);
  assert.doesNotMatch(
    commentBlock,
    /github\.rest\.pulls|github\.graphql|github\.request/
  );
  assert.equal(
    count(commentBlock, /^\s*uses:/gm),
    1,
    'bundle comment must use exactly one reviewed action'
  );
  assert.match(
    commentBlock,
    /uses:\s*actions\/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9/
  );
  assert.match(
    commentBlock,
    /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/
  );
  assert.match(
    commentBlock,
    /github\.event\.pull_request\.user\.login != ['"]dependabot\[bot\]['"]/
  );
  assert.doesNotMatch(summaryBlock, /bundle-comment/);
});

test('privileged workflows keep narrow event and credential boundaries', () => {
  assert.deepEqual(jobNames(codeql), ['analyze']);
  assert.deepEqual(jobNames(prLint), ['validate-title']);
  assert.deepEqual(jobNames(release), ['release']);
  assert.equal(count(codeql, /^\s*permissions\s*:/gm), 1);
  assert.equal(count(prLint, /^\s*permissions\s*:/gm), 1);
  assert.equal(count(release, /^\s*permissions\s*:/gm), 1);
  const codeqlJob = indentedBlock(codeql, '  analyze:\n', 2);
  assert.equal(
    indentedBlock(codeqlJob, '    permissions:\n', 4).trim(),
    'actions: read\n      contents: read\n      security-events: write',
    'CodeQL must retain its exact permission map'
  );
  assert.equal(count(codeql, /^\s+[a-z-]+:\s*write\s*$/gm), 1);

  assert.match(prLint, /^\s*pull_request_target:\s*$/m);
  assert.equal(
    indentedBlock(prLint, 'permissions:\n', 0).trim(),
    'pull-requests: read',
    'PR lint must have only pull-requests: read'
  );
  assert.doesNotMatch(prLint, /actions\/checkout|^\s+-?\s*run:/m);

  assert.match(release, /^on:\s*\n\s+push:\s*$/m);
  assert.doesNotMatch(release, /pull_request(?:_target)?:/);
  assert.doesNotMatch(release, /^\s+(?:schedule|workflow_dispatch):/m);
  assert.match(release, /branches:\s*\n\s+- main\s*\n\s+- master\s*(?:\n|$)/);
  assert.equal(
    indentedBlock(release, 'permissions:\n', 0).trim(),
    'contents: read',
    'release workflow-provided permissions must be read-only'
  );
  assert.equal(
    count(release, /\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}/g),
    2,
    'the release PAT must appear only in checkout and semantic-release'
  );
  assert.doesNotMatch(release, /\$\{\{ secrets\.GITHUB_TOKEN \}\}/);

  const checkoutStep = indentedBlock(release, '      - name: Checkout\n', 6);
  const releaseStep = indentedBlock(release, '      - name: Release\n', 6);
  assert.equal(
    count(checkoutStep, /\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}/g),
    1,
    'checkout must receive exactly one release PAT reference'
  );
  assert.match(
    checkoutStep,
    /uses:\s*actions\/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6[\s\S]*fetch-depth:\s*0[\s\S]*token:\s*\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}/
  );
  assert.equal(
    count(releaseStep, /\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}/g),
    1,
    'semantic-release must receive exactly one release PAT reference'
  );
  assert.match(
    releaseStep,
    /env:\s*\n\s+GITHUB_TOKEN:\s*\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}[\s\S]*run:\s*npx semantic-release\s*$/
  );
  assert.doesNotMatch(releaseStep, /^\s*uses:/m);

  const allWorkflowText = [...workflows.values()].join('\n');
  assert.equal(count(allWorkflowText, /\$\{\{ secrets\.EXPO_TOKEN \}\}/g), 1);
  assert.equal(
    count(allWorkflowText, /\$\{\{ secrets\.CODECOV_TOKEN \}\}/g),
    1
  );
  assert.equal(
    count(allWorkflowText, /\$\{\{ secrets\.SEMANTIC_RELEASE_TOKEN \}\}/g),
    2
  );
  assert.equal(
    count(
      indentedBlock(ci, '  build-validation:\n', 2),
      /\$\{\{ secrets\.EXPO_TOKEN \}\}/g
    ),
    1
  );
  assert.equal(
    count(
      indentedBlock(ci, '  test:\n', 2),
      /\$\{\{ secrets\.CODECOV_TOKEN \}\}/g
    ),
    1
  );

  for (const [file, text] of workflows) {
    if (file === 'codeql.yml') continue;
    assert.doesNotMatch(text, /^\s+security-events:\s*write\s*$/m);
  }
});
