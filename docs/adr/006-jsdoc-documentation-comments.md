# ADR 006: Use JSDoc documentation comments for TypeScript code

## Status

Accepted

## Context

When I was adding documentation to the TypeScript codebase, I needed to decide on a consistent approach for documenting functions, interfaces, and other code elements. The options ranged from no documentation at all to various comment styles.

I had a few options to consider:

- **JSDoc comments (/** */)** - Standard documentation format with @param and @returns tags
- **Single-line comments (//)** - Simple but less structured
- **No comments** - Rely on TypeScript types alone
- **TSDoc** - A newer standard, but less widely adopted

## Decision

I went with **JSDoc documentation comments** for all TypeScript code.

### Why this made sense

JSDoc is the standard documentation format that both JavaScript and TypeScript use. IDEs like VS Code recognise the syntax and show the documentation in hover tooltips, which makes the code easier to understand and navigate. The @param and @returns tags provide clear documentation for function signatures, and TypeScript types already handle the type information so JSDoc is used purely for documentation purposes. It's a well-established format that other developers will recognise, and it works well with TypeScript's type system without any conflicts. Since this is for my apprenticeship, having proper documentation demonstrates professional coding standards and makes the codebase more maintainable.

## What this means for us

### The good stuff

- IDE hover tooltips show documentation for functions and interfaces
- Clear documentation for parameters and return values
- Standard format that other developers recognise
- Demonstrates professional coding standards for apprenticeship
- Makes the codebase easier to understand and maintain

### The trade-offs

- Slightly more verbose code
- Requires discipline to keep comments in sync with code changes
- Takes a bit more time to write initially

### How we're handling the downsides

- The documentation adds value and clarity to the code
- Keeping comments in sync is part of maintaining code quality
- The initial time investment pays off in better code documentation
