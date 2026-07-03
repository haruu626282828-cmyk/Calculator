# CalcPro

A premium scientific calculator web app with glassmorphism design, full keyboard support, memory functions, and searchable calculation history.

## Run & Operate

- `pnpm --filter @workspace/calcpro run dev` — run the calculator web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion (this monorepo uses React + Vite instead of Next.js)
- No backend/database — CalcPro is a fully client-side app; history and preferences persist in localStorage

## Where things live

- `artifacts/calcpro/src/lib/calculator-engine.ts` — expression tokenizer/parser/evaluator (no `eval`), plus `formatResult` for display formatting
- `artifacts/calcpro/src/lib/use-calculator.ts` — main calculator state hook (expression building, memory, execute)
- `artifacts/calcpro/src/lib/use-history.ts` — localStorage-backed calculation history
- `artifacts/calcpro/src/lib/use-sound.ts` — optional button/equals/error sound effects
- `artifacts/calcpro/src/lib/use-keyboard-shortcuts.ts` — global keyboard shortcut wiring

## Architecture decisions

- Calculator logic (parsing/evaluation, history, memory, sound) was built by the main agent as plain hooks/modules; the UI was built by a design subagent that consumes those hooks — keeps business logic testable and separate from presentation.
- Expressions are parsed with a hand-written recursive-descent parser rather than `eval`, for safety and precise control over scientific notation, postfix operators (`!`, `%`, `²`, `³`, `⁻¹`), and DEG/RAD-aware trig functions.
- Other artifacts in this workspace (`api-server`, `mockup-sandbox`) are scaffolding not used by CalcPro.

## Product

- Standard calculator: add, subtract, multiply, divide, percentage, parentheses, decimals
- Scientific functions: sin/cos/tan and inverses, log, ln, exponentials, powers, roots, factorial, absolute value, constants (π, e), random number, DEG/RAD toggle
- Memory functions: MC, MR, M+, M-, MS
- Searchable history with delete, clear-all, copy result, and reuse-expression
- Dark/light mode, sound toggle, full keyboard shortcuts, responsive glassmorphism UI

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
