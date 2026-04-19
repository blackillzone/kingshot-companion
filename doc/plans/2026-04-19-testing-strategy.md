# Plan : Mise en place des tests sur formation-calculator

Date: 2026-04-19

## TL;DR

Initialiser une couverture de tests sur la codebase existante avant le refactoring, en deux couches : **Vitest** pour les tests unitaires/intégration (fonctions pures, store, storage) et **Playwright** pour les tests UI end-to-end des fonctionnalités principales. Intégrer le tout dans le CI GitHub Actions avant le deploy.

## Contexte

- **Stack** : React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + Zustand 5
- **Tests existants** : aucun (0 tests, 0 dépendances test, 0 script `test`)
- **CI existant** : GitHub Actions `deploy.yml` — build + deploy GitHub Pages, sans tests ni lint
- **Fichiers critiques identifiés par l'audit** : `formulas.ts`, `storage.ts`, `useRallyStore.ts`

## Choix technologiques

| Outil | Rôle | Justification |
|---|---|---|
| **Vitest** | Tests unitaires + intégration | Intégration native Vite, même config/plugins, ESM natif, rapide, API compatible Jest |
| **@testing-library/react** | Tests composants React | Standard de facto, encourage les tests orientés utilisateur |
| **jsdom** (via Vitest) | DOM simulé | Environnement léger pour les tests composants |
| **@vitest/coverage-v8** | Couverture de code | Rapide, intégré Vitest, basé sur V8 native |
| **Playwright** | Tests E2E / UI | Multi-navigateur, rapide, API moderne, bon support CI, test generator |
| **MSW** (optionnel, futur) | Mock API réseau | Non nécessaire immédiatement (pas de fetch), à prévoir si API ajoutée |

## Steps

### Phase 1 — Infrastructure (bloque les phases suivantes)

**1. Installer les dépendances de test**

```bash
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm i -D @playwright/test
npx playwright install --with-deps chromium
```

**2. Configurer Vitest**

- Ajouter la config test dans `vite.config.ts` (bloc `test: {}`) ou créer `vitest.config.ts` séparé
- Config : `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/test/setup.ts']`, `include: ['src/**/*.test.{ts,tsx}']`
- Coverage : `provider: 'v8'`, `reporter: ['text', 'lcov']`, `include: ['src/**']`, `exclude: ['src/test/**']`

**3. Créer le fichier setup de test**

- `src/test/setup.ts` : importer `@testing-library/jest-dom/vitest` pour les matchers DOM

**4. Configurer Playwright**

- Créer `playwright.config.ts` à la racine de `formation-calculator/`
- Config : `baseURL: 'http://localhost:5173/hot-bear-trap-calculator/'`, `webServer` qui lance `npm run dev`, `projects: [{ name: 'chromium' }]`
- Dossier : `e2e/` à la racine de `formation-calculator/`

**5. Ajouter les scripts npm**

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:all": "vitest run && playwright test"
}
```

**6. Mettre à jour tsconfig**

- Ajouter un `tsconfig.test.json` ou inclure les types vitest dans `tsconfig.app.json` (`types: ["vitest/globals"]`)

### Phase 2 — Tests unitaires des fonctions pures (*parallélisable*)

**7. Tests `src/lib/formulas.ts`** → `src/lib/formulas.test.ts`

- `attackFactor()` : cas nominaux, valeurs à 0, grandes valeurs
- `archerTierMultiplier()` : chaque combinaison tier/tg pertinente
- `computeOptimalRatio()` : stats symétriques → ratio ~33/33/33, stats asymétriques → ratio déséquilibré, vérifier somme = 1
- `computeDamageScore()` : score optimal > score 33/33/33
- `computeDistribution()` : somme des troupes = capacité, répartition cohérente avec le ratio
- `computeFormation()` : test d'intégration complet, vérifier la structure du résultat
- `computeParticipantCurve()` : 15 points retournés, scores décroissants avec plus de participants

**8. Tests `src/lib/heroes.ts`** → `src/lib/heroes.test.ts`

- `getJoinerBonus()` : chaque héro joiner × skill levels
- `getJoinerAtkAllBonus()` / `getJoinerLetAllBonus()` : combinaisons de joiners, cas "None"
- Vérifier l'intégrité du `HERO_DB` : tous les héros ont des champs requis, `skill_bonuses` a 5 entrées
- Vérifier les listes filtrées (`LEAD_INF_HEROES`, etc.) sont des sous-ensembles valides

**9. Tests `src/lib/storage.ts`** → `src/lib/storage.test.ts`

- Mock `localStorage` via `vi.stubGlobal` ou `vitest-localstorage-mock`
- `createProfile()` : vérifier structure, ID unique, valeurs par défaut
- `upsertProfile()` : ajout nouveau, mise à jour existant
- `deleteProfile()` : suppression, profil absent = no-op
- `loadProfiles()` / `saveProfiles()` : sérialisation/désérialisation roundtrip
- `importProfileFromJson()` : JSON valide → profil avec nouvel ID, JSON invalide → gestion erreur
- `exportProfile()` : format JSON correct
- `migrateOwnedHeroData()` : données legacy migrées correctement
- `defaultStats()` / `defaultWidgets()` / etc. : snapshot ou vérification de structure

### Phase 3 — Tests du store Zustand (*dépend de phase 1*)

**10. Tests `src/store/useRallyStore.ts`** → `src/store/useRallyStore.test.ts`

- Tester le store sans React (API Zustand directe : `useRallyStore.getState()`, `.setState()`)
- Mock `localStorage` pour la persistance
- `newProfile()` : ajoute un profil, le sélectionne
- `selectProfile()` : change le profil actif, recompute le résultat
- `updateProfile()` : met à jour et persiste
- `removeProfile()` : supprime, bascule vers un autre profil
- `setRallyConfig()` : recompute le résultat
- `setJoiner()` : met à jour un slot, recompute
- Sélecteurs dérivés : `selectStats`, `selectWidgets`, `selectHeroes`, `selectTier`, `selectTG` retournent les bonnes valeurs

### Phase 4 — Tests composants React (*parallélisable avec phase 3*)

**11. Tests composants critiques** (avec @testing-library/react)

- `src/components/Results/DamageScore.test.tsx` : render avec un result mocké, vérifier affichage score et % amélioration
- `src/components/Results/TroopTable.test.tsx` : render avec distribution, vérifier les lignes inf/cav/arc, coloration
- `src/components/Results/OptimalRatioPie.test.tsx` : render sans crash avec données valides
- `src/components/RallyConfig/RallyConfig.test.tsx` : interaction slider participants, sélection bear level
- `src/components/LeaderStats/StatsForm.test.tsx` : modification d'un champ ATK, vérification propagation

### Phase 5 — Tests E2E Playwright (*dépend de phase 1*)

**12. Tests E2E des parcours principaux** → `e2e/`

- `e2e/bear-trap-calculator.spec.ts` :
  - Navigation entre les 3 vues (Profiles, User Data, Bear Trap)
  - Parcours complet : saisir stats → configurer rally → vérifier que les résultats s'affichent (pie chart, tableau, score)
  - Modifier le nombre de participants → le graphe se met à jour
- `e2e/profiles.spec.ts` :
  - Créer un nouveau profil
  - Renommer un profil
  - Supprimer un profil
  - Vérifier la persistance (reload page)
- `e2e/user-data.spec.ts` :
  - Naviguer vers User Data
  - Modifier des données gouverneur
  - Sélectionner/configurer un héros

### Phase 6 — Intégration CI (*dépend de toutes les phases précédentes*)

**13. Modifier `.github/workflows/deploy.yml`**

- Ajouter les steps **avant** le build :
  - `npm run lint`
  - `npm run test` (Vitest)
  - `npm run test:coverage` (optionnel : upload vers Codecov ou artifact)
- Ajouter un job **séparé** pour les tests E2E (ou dans le même job après build) :
  - `npx playwright install --with-deps chromium`
  - `npm run test:e2e`
- Le deploy ne se déclenche que si lint + tests + build passent

**14. (Optionnel) Ajouter un workflow PR**

- Créer `.github/workflows/ci.yml` déclenché sur `pull_request`
- Steps : install → lint → test unitaires → build → test E2E
- Pas de deploy, juste validation

## Fichiers à créer

| Fichier | Rôle |
|---|---|
| `vitest.config.ts` (ou bloc dans `vite.config.ts`) | Config Vitest |
| `src/test/setup.ts` | Setup global (matchers DOM) |
| `src/lib/formulas.test.ts` | Tests unitaires formulas |
| `src/lib/heroes.test.ts` | Tests unitaires heroes |
| `src/lib/storage.test.ts` | Tests unitaires storage |
| `src/store/useRallyStore.test.ts` | Tests store |
| `src/components/Results/DamageScore.test.tsx` | Test composant |
| `src/components/Results/TroopTable.test.tsx` | Test composant |
| `src/components/Results/OptimalRatioPie.test.tsx` | Test composant |
| `src/components/RallyConfig/RallyConfig.test.tsx` | Test composant |
| `src/components/LeaderStats/StatsForm.test.tsx` | Test composant |
| `playwright.config.ts` | Config Playwright |
| `e2e/bear-trap-calculator.spec.ts` | E2E calcul principal |
| `e2e/profiles.spec.ts` | E2E gestion profils |
| `e2e/user-data.spec.ts` | E2E user data |
| `.github/workflows/ci.yml` | CI sur PR |

## Fichiers existants à modifier

| Fichier | Modification |
|---|---|
| `package.json` | Ajouter dépendances test + scripts |
| `vite.config.ts` | Ajouter config test (si inline) |
| `tsconfig.app.json` | Ajouter types vitest |
| `.github/workflows/deploy.yml` | Ajouter steps lint + test avant deploy |
| `.gitignore` | Ajouter `playwright-report/`, `test-results/`, `coverage/` |

## Vérification

1. `npm run test` — tous les tests unitaires passent (exit 0)
2. `npm run test:coverage` — couverture affichée, cibles :
   - `formulas.ts` : >90%
   - `heroes.ts` : >80%
   - `storage.ts` : >80%
   - `useRallyStore.ts` : >70%
   - Global : >50% sur les fichiers ciblés
3. `npm run test:e2e` — tous les scénarios E2E passent sur Chromium
4. `npm run lint` — pas d'erreur (prérequis audit)
5. `npm run build` — build propre (prérequis audit)
6. Push sur une branche → le CI exécute lint + tests + build + E2E sans erreur
7. Vérifier que le deploy ne se déclenche que si toute la pipeline est verte

## Décisions

- **Vitest plutôt que Jest** : intégration native Vite, même pipeline de transform, plus rapide, config minimale
- **Playwright plutôt que Cypress** : plus rapide en CI, multi-navigateur natif, meilleur support des apps modernes, pas de dépendance serveur
- **Un seul navigateur (Chromium) en CI** : suffisant pour une SPA sans besoins cross-browser spécifiques, réduit le temps CI
- **Tests composants avec Testing Library plutôt que Playwright component testing** : plus léger, plus rapide, adapté aux tests d'interaction simples
- **Pas de MSW pour l'instant** : l'app n'a pas de calls API réseau
- **Scope exclu** : pas de refactoring du code source, pas de correction des erreurs lint/build existantes (sera fait séparément selon l'audit)
- **Phase 2 et 4 parallélisables** : les tests unitaires purs et les tests composants peuvent être écrits en parallèle

## Considérations

1. **Erreurs lint/build existantes** : l'audit signale que `npm run build` et `npm run lint` échouent. Il faudra les corriger avant ou en parallèle pour que le CI soit vert. Recommandation : corriger les 3-4 erreurs identifiées dans l'audit (variables inutilisées, composant dans le render) en amont ou dans un step dédié de la phase 1.
2. **Couverture minimale vs exhaustive** : ce plan vise une couverture initiale solide (~50 tests unitaires + ~10 scénarios E2E). L'objectif est d'avoir un filet de sécurité avant le refactoring, pas une couverture exhaustive. La couverture sera enrichie au fil des refactors.
3. **Seuil de couverture CI** : possibilité d'ajouter un seuil minimal dans Vitest (`coverage.thresholds`) pour empêcher la régression. Recommandation : l'ajouter après la phase 2, une fois le baseline établi.
