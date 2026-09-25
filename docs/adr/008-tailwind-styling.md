# ADR 008: Choose Tailwind CSS for UI styling

## Status

Accepted

## Context

The original operator UI was built with ad-hoc inline styles - functional but
visually bare, and it left two documented requirements unmet: the large
colour-coded Pass/Fail display (Use Case 3) and history search (Use Case 4). I
needed a styling approach that could produce a modern industrial UI quickly and
support light/dark themes for variable factory lighting.

Options considered:

- **Tailwind CSS** - utility classes compiled to a static stylesheet
- **MUI / Ant Design** - full React component libraries
- **shadcn/ui** - component primitives, needs Radix + more setup
- **Hand-written CSS** - no dependency, but slower to iterate

## Decision

I went with **Tailwind CSS v4** via the `@tailwindcss/vite` plugin.

### Why this made sense

The app is a single screen, so a component library's main value (pre-built
complex widgets) buys little, while its cost (bundle size, theme boilerplate,
dependency surface on a locked-down factory PC) is real. Tailwind compiles to a
plain CSS file at build time, so there is no runtime dependency and the
existing CSP (`style-src 'self'`) is untouched. Dark mode is a `dark` class
variant on `<html>` - a few lines of state, persisted to `localStorage`,
defaulting to the OS preference.

## What this means for us

### The good stuff

- Zero runtime styling dependency - just a compiled stylesheet
- Dark/light theming via class variants, no theme provider machinery
- Design tokens (spacing, colours) consistent by construction
- The redesign also closed the Pass/Fail badge and history search requirement gaps

### The trade-offs

- Utility classes make JSX verbose - mitigated by shared class constants
- Another build-time dependency to keep updated

### How we're handling the downsides

- Repeated class strings (inputs, buttons, cards) are extracted into constants
  in `App.tsx`
- Version pinned in `package.json`; CI builds the production bundle every push
