# LAB04 architecture

LAB04 is organized by business domain. UI primitives and project contracts live in `shared`; product capabilities live in `features`; global CSS is split by responsibility in `styles`.

## Boundaries

- `components/Login.tsx`: session entry and role selection.
- `features/dashboard`: presentation-oriented executive closure.
- `features/portfolio`: presentation entry point and practical-case selection.
- `features/operations`: independent operational shell and day-to-day project workspaces. It does not reuse the presentation composition.
- `features/usecase`: guided use-case walkthrough that narrates the practical case scene by scene and deep-links into the live stage modules. Scene structure lives in `scenes.ts`; all copy is in the i18n catalog.
- `features/glossary`: searchable project-management and construction reference, independent from transactional project state.
- `features/pmo`: cross-stage governance and decisions, split by workflow tab.
- `features/project`: one component per PMI stage.
- `features/admin`: access and team administration.
- `components/Workspace.tsx`: application shell and cross-feature overlays only.
- `shared`: UI primitives, contracts, formatting and dependency-free hooks.

Feature modules may import from `shared`, but must not import implementation details from another feature. Backend integration enters through typed service modules inside each feature; UI components must not call transport clients directly.

## Dependency policy

Runtime dependencies are limited to React and internationalization. New packages require a clear owner, active maintenance, a compatible license, a security review and a measurable advantage over platform APIs.

## State and service policy

Current state is intentionally in-memory. The composition root injects `AppServices`; UI modules consume typed repository ports and never depend on mocks or transport clients. `ServiceResult<T>` makes success and expected failures explicit, while mock adapters provide deterministic session-only data.

The composition root keeps two stable service instances for the active demo session. **Presentation** serves the accepted project at 09 Oct 2026; **natural state** serves the same project at the operational cutoff of 12 Jul 2026 (64% actual vs 67% planned, CPI 1.04 and SPI 0.96). Keeping the instances separate prevents a schedule, document or workflow mutation made in one moment from leaking into the other. Changing the demonstrative role updates the session capabilities without rebuilding either instance, so captured records remain visible while the UI changes between editable and read-only behavior. Switching modes also changes the application shell and information architecture, while preserving the same contracts and visual tokens. No state survives logout or reload.

The demo portfolio contains projects in active, completed, cancelled and on-hold states. Only `Interconexión El Encino - La Laguna` is eligible to enter the complete PMI workflow; the other records are read-only context. The practical case has two coherent readings: a **finished lifecycle** for the guided presentation and an **active operational snapshot** for day-to-day use. Monthly performance, schedule, WBS, budget lines, quality metrics, weekly reports, audits, closure summary and document metadata are served by the same project repository contract (`listBudget`, `listQuality`, `listWeeklyReports`, `listAudits`, `getClosureSummary`).

The natural-state workspace is built as an operational application rather than a narrated dashboard. Its areas are `overview`, `planning`, `schedule`, `costs`, `risks`, `changes`, `documents` and `field`. Every area owns its forms and read views, while mutations cross the same typed in-memory ports so records survive navigation during the session.

Every operational control must produce an observable response: a state change, accessible modal, contextual menu, preview, confirmation, retry or permission explanation. The shell exposes the current role scope and labels each work area as operable or read-only from the capability matrix. Read-only access remains navigable so the client can inspect the complete system without implying authorization to mutate data.

Operational additions extend the transport-neutral boundary with cost estimates, field reports and incidents, plus creation/status mutations for risks and changes. These contracts describe product behavior only; they do not prescribe HTTP endpoints or persistence technology.

Schedule mutations (`addScheduleTask`, `updateScheduleTask`, progress updates and guarded deletion) remain transport-neutral repository operations. The mock prevents deleting activities with successors and recalculates their demo timeline position; Backend must ultimately validate dependency cycles, calendars, permissions and concurrent updates.

Document upload stores only file metadata in memory (name, size, owner and date). It does not upload bytes, persist files or emulate backend storage. A future adapter must replace this behavior with the agreed object-storage and document API flow.

## Form and dialog policy

All in-application data-entry and edit forms use the shared `FormModal` pattern. It renders through a portal so the application background can become inert, traps keyboard focus, closes with Escape or backdrop activation, prevents background scrolling and restores focus to the opening control. Read-only record and document views (project charter, risk detail, weekly report, acceptance certificate) use `DetailModal`, which shares the same `useDialog` accessibility contract but renders content with a single close control instead of a form and submit action. Filters, view selectors and immediate status toggles remain inline because they do not create or edit records. The login form remains the dedicated access screen rather than an in-application modal.

The global “New entry” overlay renders domain-specific fields for initiation, planning, schedule, risks, monitoring, closeout and team administration. Additional detail dialogs cover project previews, documents, baselines, activity history and profile options. Destructive schedule actions require explicit confirmation. Direct navigation, exports and immediate filters remain direct actions instead of artificial dialogs.

## Backend integration boundary

- `UserSession` carries role and capabilities. Frontend visibility is an experience aid only; Backend remains the authority for authentication, authorization and validation.
- `ProjectRepository`, `RiskRepository`, `ChangeRepository` and `GovernanceRepository` are the replacement points for future HTTP adapters.
- Keep DTO mappers in the adapter layer when an API payload differs from the frontend domain contract.
- The role selector remains clearly labelled as demo-only until session data comes from Backend.

## Quality gates

Before merging a frontend change, run lint, formatting verification, unit tests, build and E2E tests. Unit and component tests use Vitest with Testing Library; Playwright covers desktop and mobile flows.

## Typography

Typography uses a native system stack: San Francisco on Apple platforms and Segoe UI Variable on Windows. The current global scale is 25% larger than the previous 5% scale, with a 12.5px minimum for compact labels. The `CONTROL DE OBRA` welcome block deliberately preserves its previous scale. Responsive `clamp()` and `min()` font values follow the global scale outside that exception. The `--font`, `--font-display` and `--mono` tokens are the supported font entry points.
