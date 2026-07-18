# ADR 003: Choose Koffi for native DLL interop

## Status

Accepted

## Context

The test rig needs to call functions in Jeff's native Windows DLL - specifically `InitialiseDevice`, `RunTest`, and `GetResult`. I needed to figure out how to make those calls from our Electron app.

I looked at a few ways to do this:

- **Koffi** - modern FFI library for Node.js, handles C function calls
- **node-ffi-napi** - older FFI library, not really maintained anymore
- **edge.js** - needs .NET runtime, not ideal for a pure Node setup
- **Custom C++ addon** - high maintenance, complex build process
- **Exec external CLI** - slow, can't handle binary data directly

## Decision

I went with **Koffi** for talking to the native DLL.

### Why this made sense

Koffi is actively maintained and built for modern Node.js. It handles both synchronous and asynchronous calls, which gives us flexibility. It properly handles C data types and pointers, and works fine with Electron's Node.js runtime. Unlike edge.js, there's no external runtime dependency needed. It's also easier to maintain than writing a custom C++ addon. Since Jeff's DLL exports standard C functions, Koffi handles that well.

## What this means for us

### The good stuff

- Direct access to DLL functions without any intermediate processes
- Type-safe FFI bindings with TypeScript definitions
- Good performance when running tests
- Easy to mock for development and testing

### The trade-offs

- It's platform-specific, so Windows only
- Need to rebuild native bindings for Electron
- Debugging DLL failures can be tricky without the source code

### How we're handling the downsides

- Isolating DLL calls behind a mockable interface
- Using the mock DLL for development and CI on non-Windows platforms
- Adding comprehensive error handling and logging
- Documenting the DLL interface clearly in the headers
