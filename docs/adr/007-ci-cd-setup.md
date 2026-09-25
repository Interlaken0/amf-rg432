# ADR 007: Set up GitHub Actions CI/CD pipeline

## Status

Accepted

## Context

When I started building the RG432 test rig, I needed to figure out how to make sure the code stays in good shape as we develop it. Without any automated checks, bugs could slip through and we might not notice until something breaks in production. I also wanted to avoid having to manually update the changelog and version numbers every time we release something.

I looked at a few options:

- **GitHub Actions** - Built into GitHub, runs workflows on push/PR
- **GitLab CI** - Similar but would require moving the repository
- **Travis CI** - External service, additional setup required
- **Jenkins** - Self-hosted, more complex to maintain
- **No CI** - Manual testing and checks, risky for production code

## Decision

I went with **GitHub Actions** for the CI/CD pipeline.

### Why this made sense

GitHub Actions is already integrated with the repository, so there's no external service to set up or manage. It runs on Windows runners which matches our target platform, and the workflow configuration is just a YAML file in the repository. I can trigger it on pushes to main and sprint branches, as well as on pull requests, which gives us continuous validation. The pipeline runs linting, type checking, unit tests, and builds the application - all the critical checks we need to catch issues early. I also added a release job that automatically updates the changelog and version number when we push to main, using commit-and-tag-version to analyse our conventional commits. This means we get proper versioning and documentation without manual work.

## What this means for us

### The good stuff

- Catches bugs early before they reach production
- Automatic feedback on pull requests with green/red status
- No local setup needed - everything runs in the cloud
- Detailed logs make debugging failures easier
- Automatic changelog and version updates save time
- Consistent build environment across all runs

### The trade-offs

- Adds a few minutes to the feedback loop on pushes
- Workflow configuration needs to be maintained
- Windows runners can sometimes have queue times
- Need to write conventional commits for changelog generation

### How we're handling the downsides

- The feedback time is acceptable for the confidence it gives us
- The workflow is simple and well-documented
- We can always add self-hosted runners if queue times become an issue
- We're already using commitlint to enforce conventional commits
