# Personas

These personas were discussed and agreed with Jeff, the employer, mentor, and stakeholder for the RG432 Automated Test Rig project. They represent the people who will interact with the system once it is deployed on the factory floor.

---

# Persona: Dave

## More about Dave:

Dave is a factory operator on the RG432 production line. He has worked in electronics assembly for eight years and is comfortable using Windows PCs on the shop floor. He is not a software developer, but he can follow clear on-screen instructions. Dave works an eight-hour shift and tests hundreds of boards each day. He needs the test rig to be fast, obvious, and reliable because he is measured on throughput and defect escape rate.

## Interests

- Hitting daily production targets without rushing quality checks
- Understanding clearly whether a board passes or fails
- Spending minimal time on paperwork or computer navigation
- Helping engineering diagnose faults when a board fails

## Needs and expectations

- A simple screen with large, clear Pass / Fail feedback
- Minimal typing — ideally just a serial number scan or short entry
- Confidence that every test result is saved and traceable
- Quick access to the last few tests in case of a query
- No need to understand the DLL, Koffi, or internal software architecture

## Influences

- Production supervisors who monitor line output and defect rates
- Factory quality standards and audit requirements
- Engineers who investigate returns or intermittent faults
- His own experience with previous test rigs and shop-floor tools

## Motivations

- Dave wants to do his job well and avoid shipping a faulty unit
- He takes pride in spotting patterns, such as a batch of boards failing the same test
- He prefers tools that feel robust and do not slow him down

## Goals

- Register each board quickly and accurately
- Run a test in one or two clicks
- See an unambiguous Pass or Fail result
- Report failures with enough detail for engineering follow-up

## Pain points and frustrations

- Test software that crashes or freezes during a busy shift
- Confusing error messages that do not say what to do next
- Re-entering the same information multiple times
- Slow tests that create bottlenecks on the line
- Fear of accidentally shipping a board that was not tested

---

# Persona: Sarah

## More about Sarah:

Sarah is the production supervisor for the RG432 line. She has ten years of experience in manufacturing and is responsible for shift output, quality metrics, and audit readiness. She splits her time between the shop floor and a small office where she reviews reports. Sarah needs traceability data to investigate customer returns and to prove compliance during audits.

## Interests

- Daily and weekly test throughput statistics
- Defect trends and root-cause analysis
- Audit-ready records for every shipped board
- Reducing rework and returns caused by escaped defects

## Needs and expectations

- Access to a historical log of all tests with serial numbers, timestamps, operators, and results
- A way to export data for spreadsheets or engineering reports
- Confidence that operator names and serial numbers are handled securely
- Clear evidence that the test rig itself is calibrated and reliable

## Influences

- Customer returns and warranty claims
- Internal quality audits and external compliance checks
- Production planners who set daily build targets
- Jeff and the engineering team who define pass/fail criteria

## Motivations

- Sarah wants the factory to ship only fully tested, traceable units
- She values data that helps her spot problems before they become returns
- She appreciates tools that make audit preparation easier rather than harder

## Goals

- Review test history by serial number, date, or operator
- Export test records for reports and investigations
- Confirm that the test rig is in use and producing consistent results
- Support continuous improvement by identifying recurring failure modes

## Pain points and frustrations

- Missing or incomplete test records when a customer reports a fault
- Paper-based traceability that is slow to search and easy to lose
- Test data spread across multiple files or systems
- Inability to prove that a specific board was tested before shipment

---

# Persona: Jeff

## More about Jeff:

Jeff is the owner of JJ Confederation and the employer, mentor, and stakeholder for this project. He has deep knowledge of the RG432 product, the proprietary DLL, and the manufacturing process. Jeff will provide the demo DLL, final DLL, and physical prototypes as the project progresses. He needs the test rig to be reliable enough for factory deployment and maintainable enough for a solo developer to support.

## Interests

- A test rig that reduces customer returns and protects the company reputation
- Clean, well-documented code that Greg can maintain after the apprenticeship
- Straightforward user acceptance testing and factory handover
- Visibility of progress through sprint demos and releases

## Needs and expectations

- A standalone Windows installer that runs on standard factory PCs
- Mock mode so testing can continue before the final DLL and hardware arrive
- Diagnostic log export for engineering analysis
- Evidence that the project follows Agile, testing, and security best practices

## Influences

- Customer feedback and return rates
- Manufacturing costs and production efficiency
- The proprietary RG432 DLL and its interface limitations
- Greg's apprenticeship requirements and need for KSB evidence

## Motivations

- Jeff wants the RG432 product to leave the factory with guaranteed quality
- He is invested in Greg's learning and wants the project to be a strong apprenticeship outcome
- He prefers simple, maintainable solutions over over-engineered ones

## Goals

- Approve each sprint increment at the sprint review
- Validate the test rig against real RG432 boards and the final DLL
- Sign off the application for factory deployment at the end of Sprint 4
- Leave Greg with a maintainable codebase and good documentation

## Pain points and frustrations

- Tools that are hard to install or require admin rights on locked-down factory PCs
- Projects that drift from the original scope without stakeholder input
- Missing documentation when handover time arrives
- Test rigs that cannot run without physical hardware, blocking development
