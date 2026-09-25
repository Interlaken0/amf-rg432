# ADR 005: Choose TypeScript over JavaScript

## Status

Accepted

## Context

When I started building the RG432 test rig, I needed to decide whether to use JavaScript or TypeScript for the codebase. The project involves native DLL interop, database operations, and a React UI - all of which have complex data structures that could easily lead to runtime errors if not handled carefully.

I had a few options to consider:

- **TypeScript** - JavaScript with static typing and compile-time checking
- **JavaScript** - Dynamic typing, no compile-time checks
- **JavaScript with JSDoc** - Adds type annotations but less comprehensive than TypeScript
- **Flow** - Alternative type system for JavaScript, less popular now

## Decision

I went with **TypeScript** for the entire codebase.

### Why this made sense

TypeScript gives us static type checking, which is really valuable for this project. The DLL interop with Koffi requires precise type definitions for C functions, and TypeScript lets us define interfaces for those exports so type mismatches get caught at compile time rather than runtime. The database schema and TypeScript types can stay in sync - if a column changes, TypeScript flags where the code assumes the old structure. React components get type-checked props, preventing bugs where the wrong data gets passed around. Refactoring is much safer too - when I change a function signature, TypeScript shows all the places that need updating across the main process, renderer, and native modules. The IDE support with autocomplete and inline documentation works better with types, especially for the DLL interface and database queries. Plus, compile-time error detection catches issues like null/undefined access, wrong property names, or missing imports before the app even runs.

## What this means for us

### The good stuff

- Type safety for DLL interop catches FFI mismatches early
- Database schema alignment prevents data structure bugs
- React component props are validated at compile time
- Refactoring is safer with type checking across the codebase
- Better IDE support with autocomplete and documentation
- Compile-time error detection catches bugs before runtime

### The trade-offs

- Slightly more verbose code with type annotations
- Requires a build step (TypeScript compilation)
- Learning curve if you're not used to typed languages
- Some JavaScript libraries have weaker TypeScript support

### How we're handling the downsides

- The type annotations add clarity and documentation value
- The build step is already part of the Electron workflow
- I'm already comfortable with TypeScript from previous work
- The libraries we're using (React, Electron, better-sqlite3, Koffi) have good TypeScript support
