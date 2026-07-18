# Sprint 1 Retrospective

**Dates:** 3 July – 16 July 2026  
**Sprint Goal:** Get the development environment fully set up and deliver a working operator interface for board registration and test initiation.

## What went well

The environment setup with TypeScript, ESLint, Vite and Electron came together pretty quickly. I got the board registration form working with validation, and the test initiation UI with live progress display is up and running. The pass/fail visual feedback and error handling are in place too. The CI/CD pipeline is set up with commitlint, linting, type checking, tests and a Windows build. I managed to complete the DLL integration using Koffi, so we can now make real hardware calls. The Git workflow is established with feature branches and pull requests.

## What slowed me down

**Preload script errors** - I initially wrote the preload script as an ES module, which caused a `SyntaxError: Cannot use import statement outside a module`. Had to convert it to CommonJS and adjust the Vite config to fix that.

**404 errors** - The Vite dev server expected `index.html` at the project root, but I'd put it in `src/renderer/`. Moving the file sorted that out.

**CSP security warnings** - Electron was showing warnings about an insecure Content-Security-Policy in dev mode. I added a proper CSP meta tag and disabled the warnings in dev mode.

**Native module rebuild issues** - `better-sqlite3` was compiled for the system Node.js version, not Electron, which caused a `NODE_MODULE_VERSION` mismatch. Had to run `electron-rebuild` and add it to `postinstall` to fix this.

**Commitlint failures in CI** - The GitHub Actions checkout didn't fetch enough history for `HEAD~1` to exist, so commitlint failed. Setting `fetch-depth: 0` fixed it.

**Electron-builder auto-publishing** - The builder tried to auto-publish releases in CI, which failed without `GH_TOKEN`. Setting `publish: null` in the config stopped that.

## What to improve next sprint

**Electron preload understanding** - Need to remember that preload scripts must be CommonJS, not ES modules, and configure the build accordingly from the start.

**Vite dev server structure** - Make sure `index.html` is at the project root so the Vite dev server serves it correctly.

**Security configuration** - Configure CSP and Electron security settings early to avoid seeing the same warnings repeatedly.

**Native module automation** - Ensure `postinstall` runs `electron-rebuild` so native modules are rebuilt automatically after `npm install`.

**CI checkout depth** - Configure GitHub Actions checkout with `fetch-depth: 0` for branches that use commitlint.

**Electron-builder publishing** - Set `publish: null` unless I explicitly want auto-publishing to GitHub releases.

## Action items for Sprint 2

- Keep following the sprint plan strictly and avoid implementing features from future sprints.
- Apply the lessons learned from the CI/CD and Electron configuration issues to the Sprint 2 work.
- Hold a retrospective at the end of Sprint 2 to review progress again.
