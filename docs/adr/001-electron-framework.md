# ADR 001: Choose Electron for the desktop application framework

## Status

Accepted

## Context

When we started building the RG432 test rig, I needed to figure out what framework to use for the Windows desktop application. The factory operators need a proper UI to work with, and the app has to talk to Jeff's native DLLs, save test results locally, and be installable as a standalone package.

I looked at a few options:

- **Electron** - uses Chromium and Node.js, works across platforms
- **Tauri** - lighter weight, uses the system webview and Rust
- **Pure Node with CLI** - no GUI, which wouldn't work in a factory
- **Web app with local server** - needs a browser, not great for a kiosk setup

## Decision

I went with **Electron** for the desktop framework.

### Why this made sense

Electron gives us full access to Node.js APIs, which means we can use Koffi to talk to the native DLLs. I'm already comfortable with React for building UIs, so that fits well with what I know. The ecosystem around Electron is solid too - electron-builder handles packaging nicely, and generating a Windows installer is straightforward. It also lets us work with the local file system and integrate SQLite easily. Since Jeff's DLLs are built for Windows, and Electron has good Windows support, it felt like the right fit.

## What this means for us

### The good stuff

- We can move fast with React and TypeScript
- DevTools makes debugging much easier
- Native modules like better-sqlite3 and Koffi work well
- One codebase for both the UI and the main process logic

### The trade-offs

- The app bundle will be bigger because Chromium is bundled with it
- It uses more memory than a native app would
- We need to be careful with security - context isolation, CSP, sandboxing and all that

### How we're handling the downsides

- Using electron-builder to create a compact NSIS installer
- Following Electron's security best practices (they've got a good checklist)
- Keeping the UI lightweight to keep resource usage reasonable
