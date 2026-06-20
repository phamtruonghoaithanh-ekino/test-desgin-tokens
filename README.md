# Design Tokens

## Build

```sh
npm run build -- tokens.json
npm run build -- demo/tokens.json
npm run build -- react/tokens.json
```

## CI/CD deploy variables

The GitHub Actions workflow builds only the token file that changed, then can
push that build output into another GitHub or GitLab repository.

Create this secret:

```text
DESIGN_TOKENS_DEPLOY_TOKEN
```

Create these repository or environment variables for each target you want to
deploy:

```text
ROOT_TARGET_PROVIDER=github
ROOT_TARGET_REPOSITORY=org/root-token-builds
ROOT_TARGET_BRANCH=main
ROOT_TARGET_PATH=

DEMO_TARGET_PROVIDER=gitlab
DEMO_TARGET_REPOSITORY=group/demo-token-builds
DEMO_TARGET_BRANCH=main
DEMO_TARGET_PATH=

REACT_TARGET_PROVIDER=github
REACT_TARGET_REPOSITORY=org/react-token-builds
REACT_TARGET_BRANCH=sync/design-tokens
REACT_TARGET_PATH=
REACT_MERGE_TARGET_BRANCH=develop
REACT_CREATE_MERGE_REQUEST=true
```

`*_TARGET_PROVIDER` supports `github` or `gitlab`. `*_TARGET_REPOSITORY` can be
`owner/repo`, `group/project`, or a full HTTPS Git URL. Leave a target repository
empty to build without deploying that output.

When `REACT_CREATE_MERGE_REQUEST=true`, the React deploy creates a GitHub pull
request or GitLab merge request from `REACT_TARGET_BRANCH` into
`REACT_MERGE_TARGET_BRANCH` after new build output is pushed.
