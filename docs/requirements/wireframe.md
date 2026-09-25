# Wireframe — Operator Interface

Approved UI layout for the board registration and test initiation screen, designed
around the Dave persona (factory operator — needs a simple, unambiguous interface
that works with gloves-on factory conditions) and User Stories 1–4 in
`docs/requirements/user-stories.md`.

## Layout

```
+------------------------------------------------------------------+
|  AMF RG432 Test Rig                                              |
|                                                                  |
|  [x] Mock mode (simulate hardware without DLL)                   |
|                                                                  |
|  (alert/error banner appears here when something goes wrong)     |
|                                                                  |
|  Board Registration                                              |
|  +------------------+                                            |
|  | Serial Number    |  [____________________]                    |
|  | Operator         |  [____________________]                    |
|  |                  |  ( Register Board )                        |
|  +------------------+                                            |
|                                                                  |
|  Run Test                                                        |
|  +------------------+                                            |
|  | (  Start Test  ) |  "Test in progress, please wait…"          |
|  |                  |  Result: PASS / FAIL + diagnostics         |
|  +------------------+                                            |
|                                                                  |
|  Reports                                                         |
|  +------------------+                                            |
|  | (Export Batch    |                                            |
|  |       Report)    |                                            |
|  +------------------+                                            |
|                                                                  |
|  Test History                                                    |
|  +------------------+                                            |
|  | RG432-0001 - pass - Dave                                      |
|  | RG432-0002 - fail - Sarah                                     |
|  | ...                                                          |
|  +------------------+                                            |
+------------------------------------------------------------------+
```

## Components identified

| Component | Purpose | Traceability |
|-----------|---------|--------------|
| Mock mode toggle | Switch between real DLL and simulation | User story: develop/test without hardware; Sarah's visibility requirement |
| Serial Number input | Board identifier entry/scan | User Story 1; Use Case 1 step 1 |
| Operator input | Records who ran the work | User Story 1; K8 data protection note in ADR 002 |
| Register Board button | Persists board; disabled until valid | Use Case 1 steps 3–4 |
| Start Test button | Triggers test; disabled while running | Use Case 2 step 2 |
| Progress indicator | "Test in progress" during the ~4s run | Use Case 2 step 3; Dave needs obvious feedback |
| Result display | Pass/Fail + diagnostics | Use Case 2 steps 6–7 |
| Error banner | Operator-readable failure messages incl. diagnostic log path | Use Case 2 alternative 4a |
| Export Batch Report | Saves CSV report via save dialog | Use Case 5 |
| Test History list | Persistent record of all tests | Use Case 4 |

## Design decisions

- **Single screen, no navigation** — Dave does one job repeatedly; everything is
  reachable without menus (persona: minimal training, works fast).
- **Buttons disable rather than error** — invalid states are prevented before
  they can fail.
- **Persistent history on screen** — gives Dave and Sarah immediate confidence
  that results were recorded (traceability requirement).
