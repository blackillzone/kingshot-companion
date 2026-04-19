# AGENTS.md — AI Agent Configuration

This file configures AI coding assistants (GitHub Copilot, Claude, ChatGPT, etc.) working on this repository.

## Required reading

Before working on this codebase, load these files to understand the project:

| File | When to read |
|---|---|
| `doc/architecture.md` | Always — component tree, data flow, store structure, types |
| `doc/kingshot-game.md` | When touching heroes, formulas, or game data |
| `doc/tech-stack.md` | When touching build config, styling, or charts |
| `doc/code-quality.md` | When adding features — testing strategy, Biome linting, CI/CD |
| `doc/deployment.md` | When touching CI/CD, GitHub Actions, or vite.config.ts |

---

## Project overview

- **App:** HOT — Kingshot Tools (Bear Trap Rally calculator)
- **Live URL:** https://blackillzone.github.io/kingshot-companion/
- **Repo:** https://github.com/blackillzone/kingshot-companion
- **Type:** Static SPA — React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **Root:** `formation-calculator/` (the workspace subfolder contains the app)

---

## Key conventions

### File structure
- All types in `src/types/index.ts` — add new types here first
- All hero data in `src/lib/heroes.ts` — `HERO_DB` + lead lists + joiner list
- Game math in `src/lib/formulas.ts` — pure functions, no side effects
- Global state in `src/store/useRallyStore.ts` — Zustand with `subscribeWithSelector`
- UI primitives in `src/components/ui.tsx` — `SectionCard`, `Select<T>`, `Field`, `Label`

### Coding rules
- Do **not** add `overflow-hidden` to `SectionCard`'s outer div — it clips dropdown menus
- Use named Zustand selectors (`selectStats`, `selectWidgets`, etc.) to avoid unnecessary re-renders
- `HeroName` in `types/index.ts` must be updated when adding a new hero
- Widget dropdowns: active = `Select<number>`, inactive = `Select<string>` with `pointer-events-none opacity-40`
- HeroSelect outside-click detection uses `click` event with `capture: true` (not `mousedown`) to avoid blocking child clicks

### Styling
- Dark theme: `gray-900` background, `gray-800` cards, `orange-400/500/600` accent
- Troop type colors: Infantry `blue-500`, Cavalry `purple-500`, Archery `green-500`
- Generation badge colors: G1–G6 orange, Epic violet, Rare blue

### Adding a hero
1. Add the name to `HeroName` in `src/types/index.ts`
2. Add a `HeroData` entry to `HERO_DB` in `src/lib/heroes.ts`
3. Add to the appropriate lead list (`LEAD_INF/CAV/ARC_HEROES`) or joiner list
4. If it's a joiner with real bonuses, add to `CANDIDATES` in `JoinerRecommender.tsx`

### Testing conventions
- **Test files:** Colocated with source (`.test.ts`, `.test.tsx` suffix) except E2E tests in `e2e/`
- **Test runner:** Vitest for unit/component tests, Playwright for E2E
- **Coverage targets:** Must pass before merging
  - `formulas.ts`: 88% (pure math functions)
  - `heroes.ts`: 100% (data integrity critical)
  - `storage.ts`: 96% (persistence critical)
  - Global: 20% minimum
- **Before committing:** Run `npm run test` locally — CI will block deploy if tests fail
- **E2E tests:** Must have dev server running (`npm run dev` in another terminal)

---

## Build & dev commands

```bash
cd formation-calculator

npm run dev           # Dev server → http://localhost:5173
npm run build         # TypeScript check + Vite build → dist/
npm run lint          # Check code quality with Biome
npm run lint:fix      # Auto-fix linting issues
npm run preview       # Preview the production build locally

# Testing
npm test              # Run unit + component tests (Vitest)
npm run test:watch    # Watch mode for TDD
npm run test:coverage # View coverage report (targets: formulas 88%, heroes 100%, storage 96%)
npm run test:e2e      # Run E2E tests (requires dev server)
npm run test:all      # Run all checks: unit tests + E2E
```

---

## Deployment

Push to `main` → GitHub Actions builds and deploys to `gh-pages` branch → GitHub Pages serves it.

The `base` in `vite.config.ts` must stay as `/kingshot-companion/` for GitHub Pages assets to resolve correctly.

---

## Data sources for game values

- Hero types, widget effects, skill bonuses: https://kingshotdata.com
- Battle mechanics formulas: https://frakinator.streamlit.app/
- Cross-reference: https://kingshotsimulator.com
