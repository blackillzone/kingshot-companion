# 🌶️ HOT — Kingshot Tools

A free, static web app to calculate the optimal troop formation for the **Bear Trap rally event** in Kingshot.

🔗 **Live app:** https://blackillzone.github.io/hot-bear-trap-calculator/

Based on battle mechanics research from [Frakinator](https://frakinator.streamlit.app/) and [Kingshot Simulator](https://kingshotsimulator.com/).

---

## Features

- **Optimal ratio calculator** — analytically computes the ideal Infantry / Cavalry / Archery split using Lagrange multipliers
- **Troop distribution table** — exact troop counts per participant given rally capacity and number of players
- **Damage score estimator** — relative damage score based on your stats
- **Participant optimizer** — bar chart showing estimated damage vs number of participants (1–15)
- **Joiner recommendations** — top 3 hero combos ranked by predicted damage, one-click to apply
- **Hero database** — 30+ heroes (lead + joiner) with modeled ATK/LET bonuses and generation badges
- **Widget support** — per-hero exclusive gear level selector (levels 0–10)
- **Saved profiles** — multiple player profiles persisted in localStorage
- **Real-time updates** — results recalculate instantly on every input change
- **100% static** — no backend, no account needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Persistence | localStorage |
| Deployment | GitHub Pages via GitHub Actions |

→ See [doc/tech-stack.md](doc/tech-stack.md) for detailed rationale and usage patterns.

---

## Getting Started

**Prerequisites:** Node.js 18+, npm

```bash
cd formation-calculator
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/ (fully static)
npm run lint       # Check code quality with Biome
npm run lint:fix   # Auto-fix linting issues
```

→ See [doc/deployment.md](doc/deployment.md) for GitHub Actions CI/CD details.
→ See [doc/code-quality.md](doc/code-quality.md) for linting configuration and Biome migration details.

---

## How to Get Your Stats

1. Equip the heroes and gear you plan to use for bear
2. Launch a **Terror Rally** (not a beast attack)
3. After the battle, open the **battle report**
4. Copy the ATK% and LET% values for each troop type into the calculator

> Widget bonuses are included in Terror rally stats — leave widget fields at 0 in that case.

---

## Documentation

| File | Description |
|---|---|
| [doc/architecture.md](doc/architecture.md) | Component tree, data flow, formulas, types |
| [doc/kingshot-game.md](doc/kingshot-game.md) | Game mechanics, hero tables, resources & links |
| [doc/deployment.md](doc/deployment.md) | GitHub Actions, Pages config, deploy process |
| [doc/tech-stack.md](doc/tech-stack.md) | React, Vite, Tailwind, Zustand, Recharts |

---

## Credits

- Battle mechanics: [Frakinator](https://frakinator.streamlit.app/)
- Hero data: [kingshotdata.com](https://kingshotdata.com) · [Kingshot Simulator](https://kingshotsimulator.com/)
- Built with ❤️ for the Kingshot community
```
