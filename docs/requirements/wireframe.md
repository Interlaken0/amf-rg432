# Wireframe — Operator Interface

UI layout for the board registration and test screen, designed around the Dave
persona (factory operator — needs a simple, unambiguous interface that works in
factory conditions) and User Stories 1–4 in `docs/requirements/user-stories.md`.
Updated September 2026 to document the as-built Tailwind interface.

## Layout

```
+--------------------------------------------------------------------------------+
|  AMF RG432 Test Rig                          (o) Mock mode   [Dark/Light]       |  header
+----------------------------------+---------------------------------------------+
|  BOARD REGISTRATION              |  (error/success banner when needed)          |
|  +----------------------------+  |                                             |
|  | Serial number (RG432-001)  |  |  TEST HISTORY      [search...] [Export CSV]  |
|  +----------------------------+  |  +-----------------------------------------+|
|  | Operator name              |  |  | Serial        Status   Operator  Time   ||
|  +----------------------------+  |  | RG432-003    (● pass)  Greg     14:30   ||
|  | ( Register Board )         |  |  | RG432-002    (● fail)  Greg     14:25   ||
|  +----------------------------+  |  |  View all 47 results (42 more) ↓        ||
|                                  |  +-----------------------------------------+|
|                                  |                                             |
|  RUN TEST                        |                                             |
|  +----------------------------+  |                                             |
|  | (      Start Test      )   |  |                                             |
|  |  spinner "in progress…"    |  |                                             |
|  | +------------------------+ |  |                                             |
|  | |        ✓ PASS          | |  |   large green/red result badge             |
|  | |  Details=0x1234, …     | |  |   + diagnostics                            |
|  | +------------------------+ |  |                                             |
|  +----------------------------+  |                                             |
+----------------------------------+---------------------------------------------+
```

## Components identified

| Component | Purpose | Traceability |
|-----------|---------|--------------|
| Mock mode switch | Switch between real DLL and simulation | User story: develop/test without hardware |
| Theme toggle | Light/dark appearance | Operator preference; factory lighting varies |
| Serial Number input | Board identifier entry/scan | User Story 1; Use Case 1 step 1 |
| Operator input | Records who ran the work | User Story 1; K8 data protection note in ADR 002 |
| Register Board button | Persists board; disabled until valid | Use Case 1 steps 3–4 |
| Registration confirmation | Success banner after registering | Use Case 1 step 6 |
| Start Test button | Triggers test; disabled while running | Use Case 2 step 2 |
| Progress spinner | Animated indicator during the ~7s run | Use Case 2 step 3; Dave needs obvious feedback |
| PASS/FAIL badge | Large colour-coded result (emerald/rose) + diagnostics | Use Case 2 steps 6–7; Use Case 3; User Story "obvious visual feedback" |
| Error banner | Operator-readable failure messages incl. diagnostic log path | Use Case 2 alternative 4a |
| History search field | Filters records by serial, operator, or status | Use Case 4; User Story "search test history" |
| History table | Persistent record with status pills; latest 5 shown, "View all" expands | Use Case 4 |
| Export CSV button | Saves batch report via save dialog | Use Case 4 alternative 3b; Use Case 5 |

## Design decisions

- **Single screen, no navigation** — Dave does one job repeatedly; everything is
  reachable without menus (persona: minimal training, works fast).
- **Buttons disable rather than error** — invalid states are prevented before
  they can fail.
- **Giant colour-coded result** — a plain-text status was an accessibility risk
  in a noisy factory; the badge is unambiguous at arm's length.
- **Searchable history** — Sarah's audit workflow needs filtering, not scrolling.
- **History preview, not a wall of rows** — the table shows the five most
  recent results by default and expands on demand; search still scans every
  record, so hidden rows are never lost to the fold.
- **Light/dark themes** — factory PCs run in variable lighting; the toggle
  persists across restarts and defaults to the OS preference.
- **Tailwind utility styling** — see ADR 008 for the styling decision.
