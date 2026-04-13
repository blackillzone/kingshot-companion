# 🐻 Kingshot — Bear Trap Formation Calculator

A free, static web app to calculate the optimal troop formation for the **Bear Trap rally event** in Kingshot.

Based on battle mechanics research from [Frakinator](https://frakinator.streamlit.app/) and [Kingshot Simulator](https://kingshotsimulator.com/).

---

## Features

- **Optimal ratio calculator** — analytically computes the ideal Infantry / Cavalry / Archery split using Lagrange multipliers
- **Troop distribution table** — exact troop counts per participant given rally capacity and number of players
- **Damage score comparison** — shows how much better the optimal ratio is vs a naive 33/33/33 split
- **Participant optimizer** — graph showing estimated damage vs number of participants (1–15)
- **Hero database** — 30 heroes (lead + joiner) with modeled ATK/LET bonuses
- **Saved profiles** — up to 10 player profiles persisted in localStorage, with JSON export/import
- **Real-time updates** — results recalculate instantly on every input change
- **100% static** — no backend, no account needed. Deployable to GitHub Pages, Vercel, or Netlify.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Persistence | localStorage |
| Deployment | GitHub Pages (planned) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & run locally

```bash
cd formation-calculator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

Output is in `dist/` — fully static, ready to deploy anywhere.

---

## Project Structure

```
src/
├── components/
│   ├── Layout/          # Header (tabs + profile switcher), Footer
│   ├── LeaderStats/     # ATK/LET stats form, hero selectors, troop tier
│   ├── RallyConfig/     # Capacity input, participant slider, joiner heroes
│   ├── Results/         # Pie chart, troop table, damage score, participant graph
│   ├── Profiles/        # Profile manager (create, delete, export, import)
│   ├── Guide.tsx        # In-app documentation
│   ├── App.tsx          # Tab router
│   └── ui.tsx           # Shared UI components (Field, NumberInput, Select, etc.)
├── lib/
│   ├── formulas.ts      # Lagrange optimal ratio, damage score, distribution
│   ├── heroes.ts        # Hero database with ATK/LET/global bonuses
│   └── storage.ts       # localStorage CRUD + export/import helpers
├── store/
│   └── useRallyStore.ts # Zustand global state + derived selectors
└── types/
    └── index.ts         # All TypeScript types
```

---

## Battle Mechanics

Formulas sourced from Frakinator's reverse-engineered bear hunt mechanics.

### Damage formula (T6 troops, Bear Trap Level 5)

```
D = L × [ (1/3)×A_inf×√f_inf  +  A_cav×√f_cav  +  (4.4/3)×A_arc×√f_arc ]
```

Where:
- `A_type = (1 + ATK%/100) × (1 + LET%/100)` — the Attack Factor
- `f_inf + f_cav + f_arc = 1` — troop fractions
- Archer coefficient ×1.1 (bear = full infantry, archers +10% vs infantry)
- Additional ×1.1 for T7+ troops with TG3+ gilded level

### Optimal ratio (Lagrange multipliers)

```
α = A_inf/3,  β = A_cav,  γ = (4.4/3) × A_arc × arcMult

f_inf = α² / (α²+β²+γ²)
f_cav = β² / (α²+β²+γ²)
f_arc = γ² / (α²+β²+γ²)
```

---

## How to Get Your Stats

The most accurate method:
1. Equip the heroes and gear you plan to use for bear
2. Launch a **Terror Rally** (not a beast attack)
3. After the battle, open the **battle report**
4. Copy the ATK% and LET% values for each troop type into the calculator

Widget bonuses are already included in Terror rally stats — leave widget fields at 0.

---

## Credits

- Battle mechanics: [Frakinator](https://frakinator.streamlit.app/)
- Hero database: [Kingshot Simulator](https://kingshotsimulator.com/)
- Built with ❤️ for the Kingshot community

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
