# ADR 001: Choose Electron for the desktop application framework

## Status

Accepted

## Context

The RG432 test rig requires a Windows desktop application that can:

- Communicate with native DLLs via FFI
- Provide a UI for factory operators
- Persist test results locally
- Be packaged as a standalone installer

Options considered:

- **Electron**: Cross-platform desktop framework using Chromium and Node.js
- **Tauri**: Lightweight alternative using system webview and Rust
- **Pure Node with CLI**: No GUI, not suitable for factory environment
- **Web app with local server**: Requires browser, not suitable for kiosk use

## Decision

Use **Electron** as the desktop application framework.

### Rationale

- Electron provides full access to Node.js APIs, enabling native DLL interop via Koffi
- Familiar React-based UI development, aligning with existing web skills
- Strong ecosystem and tooling (electron-builder for packaging)
- Windows installer generation is straightforward
- Supports local file system access and SQLite integration
- Jeff's existing DLLs are designed for Windows, and Electron is well-supported on Windows

## Consequences

### Positive

- Fast development using React and TypeScript
- Easy debugging with DevTools
- Native module support (better-sqlite3, Koffi)
- Single codebase for UI and main process logic

### Negative

- Larger application bundle size due to bundled Chromium
- Higher memory usage compared to native apps
- Requires careful security configuration (context isolation, CSP, sandbox)

### Mitigations

- Use electron-builder to produce a compact NSIS installer
- Follow Electron security best practices (documented in the security checklist)
- Keep the UI lightweight to minimise resource usage
