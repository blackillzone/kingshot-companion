# Architecture de l'application

## Vue d'ensemble

HOT - Kingshot Tools est une Single Page Application (SPA) qui calcule la formation optimale pour un rally Bear Trap dans Kingshot. Elle est entièrement statique (pas de backend), toutes les données sont gérées localement dans le navigateur.

```
formation-calculator/
├── public/              # Assets statiques (favicon, icônes SVG)
├── src/
│   ├── assets/          # Images (hero.png)
│   ├── components/      # Composants React (voir détail ci-dessous)
│   ├── hooks/           # Hooks React réutilisables
│   ├── lib/             # Logique métier pure (formules, héros, storage, catalogue)
│   ├── store/           # État global Zustand
│   ├── types/           # Types TypeScript centralisés
│   ├── index.css        # Styles globaux (Tailwind v4 import)
│   └── main.tsx         # Point d'entrée React (wrappé dans ErrorBoundary)
├── doc/                 # Cette documentation
├── .github/workflows/   # GitHub Actions CI/CD
├── index.html           # Shell HTML principal
├── vite.config.ts       # Configuration Vite
└── tsconfig.json        # Configuration TypeScript
```

---

## Composants (`src/components/`)

```
components/
├── App.tsx                        # Routeur par onglet (formation / participants / profiles / guide)
├── ErrorBoundary.tsx              # React class ErrorBoundary — wrapping global de l'app
├── Guide.tsx                      # Onglet Guide — explications textuelles du calcul
├── ui.tsx                         # Primitives réutilisables : SectionCard, Field, Select, NumberInput, MiniInput
├── Layout/
│   ├── Header.tsx                 # Barre de navigation + sélecteur de profil
│   └── Footer.tsx                 # Liens de sources (Frakinator, Kingshot Simulator)
├── LeaderStats/
│   ├── StatsForm.tsx              # Grille 5×3 INF/CAV/ARC : ATK%, LET%, Widget, Lead Hero
│   └── HeroSelect.tsx             # Dropdown Lead Hero avec badges de génération colorés
├── Profiles/
│   ├── ProfileManager.tsx         # Création / sélection / suppression de profils
│   ├── GovDataEditor.tsx          # Éditeur de données gouverneur (héros, gov-gear, stats statiques, troupes)
│   ├── HeroRoster.tsx             # Grille de héros avec filtres (type, génération, possédés)
│   ├── HeroDetailPanel.tsx        # Panneau de détail héros (niveau, étoiles, gear, widget)
│   ├── StaticStatsEditor.tsx      # Éditeur de bonus statiques (recherche, alliance, pets…)
│   └── TroopEditor.tsx            # Éditeur d'inventaire de troupes (par niveau et type)
├── RallyConfig/
│   └── RallyConfig.tsx            # Capacité du rally, participants, niveau du Bear Trap
└── Results/
    ├── OptimalRatioPie.tsx        # Camembert Recharts — répartition optimale INF/CAV/ARC
    ├── TroopTable.tsx             # Tableau de distribution des troupes par participant
    ├── DamageScore.tsx            # Score de dommage estimé + barre de fill
    ├── ParticipantGraph.tsx       # BarChart Recharts — damage vs nombre de participants
    └── JoinerRecommender.tsx      # Recommandations de héros joiners (top 3, cliquables)
```

### Composants UI primitifs (`ui.tsx`)

| Composant | Rôle |
|---|---|
| `SectionCard` | Bloc avec header coloré et contenu, sans `overflow-hidden` sur l'outer div (requis pour les dropdowns) |
| `Field` | Wrapper label + input |
| `Select<T>` | `<select>` typé générique avec styles cohérents |
| `NumberInput` | Input numérique (float, `px-3 py-2`, sync valeur externe via `useEffect`) |
| `MiniInput` | Input numérique compact (int, `text-xs`, centré — utilisé dans HeroDetailPanel) |

---

## Hooks (`src/hooks/`)

| Hook | Rôle |
|---|---|
| `useHeroRosterNavigation(selectedHero, setSelectedHero)` | Navigation clavier (flèches) dans la grille héros + scroll automatique. Retourne `filteredHeroesRef` à synchroniser avec la liste filtrée. |
| `useAnimatedHeroPanel()` | Gestion des transitions d'entrée/sortie du panneau de détail héros. Retourne `{ selectedHero, renderedHero, panelState, panelDx, handleSelectHero }`. |

---

## Logique métier (`src/lib/`)

### `formulas.ts` — Calculs principaux

| Fonction | Description |
|---|---|
| `attackFactor(atk, let)` | Calcule `(1 + atk/100) × (1 + let/100)` — facteur d'attaque combiné |
| `archerTierMultiplier(tier, tg)` | Multiplicateur archers : `1.1` de base, `×1.1` si T7+ et TG3+ |
| `computeOptimalRatio(stats, widgets, tier, tg, joiners)` | Multiplicateurs de Lagrange : calcule les fractions optimales INF/CAV/ARC |
| `computeDamageScore(...)` | Score relatif de dommage pour une distribution donnée |
| `computeFormation(...)` | Résultat complet : ratio + distribution + score |
| `computeParticipantCurve(...)` | Courbe de damage en fonction du nombre de participants (1–15) |

**Formule de ratio optimal** (Multiplicateurs de Lagrange) :
```
α = A_inf / 3
β = A_cav
γ = (4.4 / 3) × A_arc × archerMult

f_inf = α² / (α² + β² + γ²)
f_cav = β² / (α² + β² + γ²)
f_arc = γ² / (α² + β² + γ²)
```

### `heroCatalog.ts` — Métadonnées UI des héros

Centralise toutes les métadonnées UI (chemins d'images, badges de génération, ordre d'affichage). Isolé de `heroes.ts` qui ne contient que les données de jeu.

| Export | Description |
|---|---|
| `HERO_IMG` | Chemins d'images pour chaque `HeroName` (utilise `import.meta.env.BASE_URL`) |
| `WIDGET_IMG` / `WIDGET_NAME` | Image et nom affichable de chaque widget |
| `GX_HEROES` | Set des héros GX (génération spéciale) |
| `HERO_GROUPS` | Groupes de héros par génération (`G1`…`G6`, `Epic`, `Rare`) |
| `heroGenOrder(name)` | Rang de tri d'un héros dans l'affichage |
| `ALL_HEROES_SORTED` | Liste complète triée selon `heroGenOrder` |
| `GEN_BADGE` | Config de badge par génération (label + couleur Tailwind) |

### `heroes.ts` — Base de données des héros

- Interface `HeroData` : `name`, `type`, `atk_bonus`, `let_bonus`, `skill_bonuses[5]`, `bonus_type`, `widget_effect`, `generation`, `skill`, `description`
- `HERO_DB` : dictionnaire complet de tous les héros modélisés
- `LEAD_INF/CAV/ARC_HEROES` : listes ordonnées (G1 → G2 → … → Epic → Rare → None/Other)
- `JOINER_HEROES` : pool de héros utilisables comme joiners

**Types de bonus joiner :**
- `atk_all` : ajoute X% ATK à tous les types de troupes (ex: Amane)
- `let_all` : ajoute X% LET à tous les types de troupes (ex: Chenko, Yeonwoo, Amadeus)
- `none` : pas d'effet joiner modélisé

**Effets widget :**
- `rally_atk` : le widget augmente l'ATK des troupes du rally
- `rally_let` : le widget augmente la LET des troupes du rally
- `none` : widget sans effet rally

### `storage.ts` — Persistance localStorage

- `CURRENT_PROFILE_VERSION` : version courante du schéma (à incrémenter à chaque changement de format)
- `migrateProfile(raw)` : migre un objet brut vers le format courant (ajoute les champs manquants)
- `validateProfile(data)` : valide et migre un objet inconnu → retourne `PlayerProfile | null`
- `loadProfiles()` / `saveProfiles()` : sérialisation JSON + migration automatique via `validateProfile`
- `createProfile(name)` : crée un profil avec stats/widgets à 0 et `_version: CURRENT_PROFILE_VERSION`
- `importProfileFromJson(json)` : parse + valide + réassigne un nouvel ID et timestamp
- `defaultStats()`, `defaultWidgets()`, `defaultWidgetLevels()` : valeurs par défaut

---

## État global (`src/store/useRallyStore.ts`)

Zustand avec `subscribeWithSelector`. L'état se synchronise automatiquement avec le `localStorage` via un subscriber.

**Slices de l'état :**

| Slice | Description |
|---|---|
| `profiles[]` | Liste des profils joueur |
| `activeProfileId` | ID du profil actif |
| `activeProfile` | Profil actif (calculé) |
| `rallyConfig` | Capacité, participants, Bear Trap level, 4 slots joiner |
| `result` | Résultat calculé (ratio, distribution, score) |
| `activeTab` | Onglet courant |

**Actions principales :**
- `newProfile(name)` / `selectProfile(id)` / `updateProfile(partial)` / `removeProfile(id)`
- `importProfile(profile)` — importe un profil depuis l'extérieur (JSON), l'ajoute et le sélectionne
- `setRallyConfig(partial)` — met à jour la config rally
- `setJoiner(slot, update)` — met à jour un slot joiner (0–3)
- `setActiveTab(tab)` — navigation par onglet

---

## Types (`src/types/index.ts`)

```typescript
TroopType = 'inf' | 'cav' | 'arc'
TroopTier = 'T1-T6' | 'T7-T9' | 'T10' | 'T11'
TGLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
TroopLevel = 'T1'…'T10' | 'TG1'…'TG8'

TroopStats      // ATK% et LET% par type de troupe (inf_atk, inf_let, ...)
WidgetStats     // Bonus widget par type de troupe
WidgetLevels    // Niveau de widget par type (0 = non possédé, 1–10)
OwnedHeroData   // Héros possédé : owned, level, stars, starSubLevel, widgetLevel, gear
HeroGearData    // Pièce d'équipement héros : level (0–200), masteryLevel (0–20)
GovGearData     // Équipement gouverneur : 4 pièces (helm/gloves/shroud/greaves), 0–26 chacune
StaticBonuses   // Bonus globaux (recherche, alliance, île, pets…) par type de troupe
TroopInventory  // Inventaire de troupes par type et niveau (Record<TroopLevel, number>)
PlayerProfile   // Profil complet : stats + widgets + hero leads + tier + TG + héros possédés
                //   + govGear + govCharmLevel + staticBonuses + troops + _version
RallyConfig     // Capacité + participants + bear level + 4 joiners
JoinerSlot      // { hero: HeroName, skillLevel: 1–5 }
OptimalRatio    // { inf: number, cav: number, arc: number }
FormationResult // ratio + troop distribution + damage score
```

---

## Flux de données

```
User input (StatsForm / RallyConfig)
         │
         ▼
  useRallyStore (Zustand)
         │  auto-save localStorage
         │
         ▼
  computeFormation() [formulas.ts]
         │
         ▼
  result: FormationResult
         │
    ┌────┴────────────────┐
    ▼                     ▼
OptimalRatioPie     TroopTable / DamageScore
(Recharts PieChart) (chiffres + barres)
                          │
                    JoinerRecommender
                    (top 3 combos)
```
