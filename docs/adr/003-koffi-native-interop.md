# ADR 003: Choose Koffi for native DLL interop

## Status

Accepted

## Context

The test rig must call functions in Jeff's native Windows DLL:

- `InitialiseDevice`
- `RunTest`
- `GetResult`

Options considered:

- **Koffi**: Modern FFI library for Node.js, supports C function calls
- **node-ffi-napi**: Older FFI library, less maintained
- **edge.js**: Requires .NET runtime, not suitable for pure Node
- **Custom C++ addon**: High maintenance, complex build process
- **Exec external CLI**: Slow, no direct binary data handling

## Decision

Use **Koffi** for native DLL interop.

### Rationale

- Koffi is actively maintained and designed for modern Node.js
- Supports both synchronous and asynchronous calls
- Handles C data types and pointers correctly
- Works with Electron's Node.js runtime
- No external runtime dependencies (unlike edge.js)
- Easier to maintain than a custom C++ addon
- Jeff's DLL exports standard C functions, which Koffi handles well

## Consequences

### Positive

- Direct access to DLL functions without intermediate processes
- Type-safe FFI bindings with TypeScript definitions
- Good performance for test execution
- Easy to mock for development and testing

### Negative

- Platform-specific (Windows only)
- Requires rebuilding native bindings for Electron
- Debugging DLL failures can be harder without source code

### Mitigations

- Isolate DLL calls behind a mockable interface
- Use the mock DLL for development and CI on non-Windows platforms
- Add comprehensive error handling and logging
- Document the DLL interface clearly in headers
