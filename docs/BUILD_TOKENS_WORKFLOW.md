# Build Tokens Workflow

`.github/workflows/build-tokens.yml` builds CSS output from token files and,
when configured, pushes the generated files to target repositories.

## When It Runs

The workflow runs on pushes to `main` when one of these files changes:

```text
tokens.json
demo/tokens.json
react/tokens.json
```

## Flow

1. Check out the repository with enough history to compare the latest commit
   with the previous commit.
2. Install Node.js 18 dependencies with `npm ci`.
3. Detect which token files changed.
4. Run `npm run build -- <token-file>` only for the changed token files.
5. Deploy each changed build output with `.github/scripts/deploy-token-build.sh`.

## Token Targets

| Token file | Build command | Output directory | Deploy name |
| --- | --- | --- | --- |
| `tokens.json` | `npm run build -- tokens.json` | `build/css` | `root` |
| `demo/tokens.json` | `npm run build -- demo/tokens.json` | `build/demo` | `demo` |
| `react/tokens.json` | `npm run build -- react/tokens.json` | `build/react` | `react` |

## Required Secret

Set this GitHub Actions secret when deployment is enabled:

```text
DESIGN_TOKENS_DEPLOY_TOKEN
```

The token must be able to clone, commit, and push to the configured target
repositories. If pull requests or merge requests are enabled, it must also be
able to create them.

## Target Variables

Each target has its own repository variables:

```text
ROOT_TARGET_PROVIDER
ROOT_TARGET_REPOSITORY
ROOT_TARGET_BRANCH
ROOT_TARGET_PATH

DEMO_TARGET_PROVIDER
DEMO_TARGET_REPOSITORY
DEMO_TARGET_BRANCH
DEMO_TARGET_PATH

REACT_TARGET_PROVIDER
REACT_TARGET_REPOSITORY
REACT_TARGET_BRANCH
REACT_TARGET_PATH
REACT_MERGE_TARGET_BRANCH
REACT_CREATE_MERGE_REQUEST
```

`*_TARGET_PROVIDER` supports:

```text
github
gitlab
```

`*_TARGET_REPOSITORY` can be either a short repository path or a full HTTPS Git
URL:

```text
owner/repo
group/project
https://github.com/owner/repo.git
https://gitlab.com/group/project.git
```

Leave `*_TARGET_REPOSITORY` empty to build that target without deploying it.

## Deploy Behavior

The deploy script:

1. Skips deployment when the target repository is empty.
2. Clones the target repository and branch.
3. Copies the generated build output into `*_TARGET_PATH`, or into the
   repository root when the target path is empty.
4. Commits only when files changed.
5. Pushes to the configured target branch.
6. Optionally creates a pull request or merge request.

For the React target, set:

```text
REACT_CREATE_MERGE_REQUEST=true
REACT_MERGE_TARGET_BRANCH=<target branch>
```

When those values are present, the workflow pushes the React build to
`REACT_TARGET_BRANCH`, then opens a GitHub pull request or GitLab merge request
into `REACT_MERGE_TARGET_BRANCH`.

## Why The Workflow Was Split

The original workflow had a large inline Bash block for deployment. That made
the build job hard to scan because build orchestration and deployment
implementation were mixed in the same YAML file.

The workflow is now split into:

```text
.github/workflows/build-tokens.yml        # CI trigger, change detection, build steps
.github/scripts/deploy-token-build.sh     # GitHub/GitLab deployment implementation
```

This keeps the workflow readable while preserving the current serial deployment
behavior.

## Can It Be Split Further?

Yes, but split it carefully.

The safest current split is the one already used here: keep one build job and
move deployment logic into a script. This avoids concurrent pushes when two
targets are configured to deploy to the same repository and branch.

A future split into separate jobs can work when the targets are independent:

```text
detect-changes
build-root
build-demo
build-react
```

Use that structure only when each target deploys to a separate repository or a
separate branch. If two jobs push to the same branch at the same time, one push
can overwrite or reject the other unless extra locking, retries, or a final
serial deploy job is added.

If the workflow is split into separate jobs later, keep deployment in
`.github/scripts/deploy-token-build.sh` so the provider-specific GitHub/GitLab
logic is not duplicated across jobs.
