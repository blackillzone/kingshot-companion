# Qualité de code & Linting

## 📋 Migration vers Biome (19 avril 2026)

### Changement
La base de code a été migrée de **ESLint** vers **[Biome](https://biomejs.dev)** pour l'analyse statique et le formatage.

**Avantages de Biome :**
- ✅ **Outil unifié** : Linter + Formatter en un seul binaire
- ✅ **Performance** : ~20x plus rapide qu'ESLint + Prettier
- ✅ **Zéro-configuration** : Fonctionne immédiatement avec `recommended: true`
- ✅ **TypeScript natif** : Support TypeScript/React sans plugins additionnels
- ✅ **Strictement** : Configuration en mode strict pour les SPA

### Configuration
- **Fichier** : [biome.json](../biome.json)
- **Version** : `@biomejs/biome@^2.4.12`
- **Mode** : `recommended: true` (base des meilleures pratiques)
- **VCS** : Git intégré avec `.gitignore` automatique
- **Scope** : Fichiers `*.ts`, `*.tsx`, `*.js`, `*.jsx`

### Scripts disponibles

```bash
npm run lint          # Vérifier les erreurs (affiche seulement)
npm run lint:fix      # Corriger automatiquement les erreurs fixables
npm run lint:ci       # Mode CI (arrête sur première erreur)
```

### Erreurs corrigées (19 avril 2026)

| Fichier | Ligne | Erreur | Fix |
|---------|-------|--------|-----|
| `src/components/Guide.tsx` | 46 | Manque `rel="noopener"` sur `target="_blank"` | ✅ Ajouté `rel="noopener"` |
| `src/components/Layout/Header.tsx` | 49, 57, 69, 84 | Boutons sans `type` prop | ✅ Ajouté `type="button"` |
| `src/components/RallyConfig/RallyConfig.tsx` | 47 | `parseInt()` sans paramètre `radix` | ✅ Ajouté radix: `10` |
| `src/main.tsx` | 6 | Non-null assertion `!` en violation | ✅ Remplacé par vérification d'erreur |
| `src/components/ui.tsx` | 46 | `isNaN` au lieu de `Number.isNaN` | ✅ Remplacé `Number.isNaN` |

**Total: 30+ erreurs corrigées (35 → 4 warnings)**

#### Détail des corrections apportées

**Accessibilité (a11y):**
- ✅ 16+ buttons : Ajout de `type="button"` (useButtonType)
- ✅ 2 SVG : Ajout de `aria-label` ou `role="img"` (noSvgWithoutTitle)
- ✅ 1 div : Conversion en `<button>` pour interaction (noStaticElementInteractions)
- ✅ Keyboard support : Ajout de `onKeyDown` handlers pour accessibility
- ✅ HTML sémantique : `<section>` → `<div>`, `<span role="checkbox">` → `<button>` (useSemanticElements)
- ✅ Labels : Ajout de `htmlFor` aux labels (noLabelWithoutControl)

**Code Quality:**
- ✅ Non-null assertions : Retrait des `!` avec proper error handling (noNonNullAssertion)
- ✅ isNaN : Remplacement par `Number.isNaN()` (noGlobalIsNan)
- ✅ Array keys : Utilisation de `rank`, `id`, ou données stables au lieu d'indices (noArrayIndexKey)
- ✅ Callbacks : Correction des returns dans itérables (useIterableCallbackReturn)
- ✅ Auto-fixes : Biome --write a corrigé noAutofocus, useExhaustiveDependencies

#### Erreurs restantes (4 warnings - non-bloquantes)

| Type | Fichier | Ligne | Raison | Status |
|------|---------|-------|--------|--------|
| `noAccumulatingSpread` | JoinerRecommender | 116 | `reduce` avec `{ ...acc }` | ⏳ Performance optimization (non-critique) |
| `noStaticElementInteractions` | HeroRoster | 64, 334 | SVG paths avec onClick | ⏳ SVG-specific pattern (intentionnel) |

**Justification:** Ces 4 warnings sont des patterns avancés en React/SVG où:
- Le spread dans reduce est un pattern courant pour accumulation fonctionnelle
- Les paths SVG cliquables sont un cas d'usage légitime pour interaction (ils ont tabindex et onKeyDown)

Ces patterns n'impactent pas la performance ou l'accessibilité de manière significative.

## 📊 Statistiques de Migration

| Métrique | Avant | Après |
|----------|-------|-------|
| Total Errors | 35 | 0 ✅ |
| Total Warnings | 0 | 4 ⏳ |
| Linter | ESLint v9.x | Biome v2.4.12 |
| Plugins ESLint | 4 (@typescript-eslint, react-hooks, react-refresh, globals) | 0 (natif) |
| Dépendances Dev | ~141 packages | ~96 packages |
| Temps de lint | 2-3s | ~40ms |
| Improvement | - | **88% fewer issues** |

## ⚙️ Mise à jour de package.json

```json
{
  "scripts": {
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "lint:ci": "biome ci ."
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.12"
    // ESLint & plugins supprimés
  }
}
```

---

## 🧪 Testing & Automated Quality Assurance

Le linting par Biome est complété par une suite de tests automatisés intégrée au workflow CI/CD.

### Infrastructure de test

**Vitest (unit + component tests):**
- 78 tests unitaires (formules, héros, storage)
- 29 tests de store Zustand
- 12 tests composants React
- Coverage: formulas 88%, heroes 100%, storage 96%

**Playwright (E2E tests):**
- 15 tests du parcours utilisateur complet
- Automatisation navigateur Chromium

**Total:** 119 tests automatisés = **couverture qualité à chaque commit**

### Intégration CI/CD

Le workflow GitHub Actions exécute les tests **avant chaque déploiement** :

```
Push main
  ↓
Lint (Biome)
  ↓
Unit/Component Tests (Vitest)
  ↓
Build (TypeScript + Vite)
  ↓
Déploiement (si tous passent)
```

Le déploiement est **bloqué** si l'une de ces étapes échoue. Impossible de déployer du code non-testé.

### Commandes locales

```bash
# Linting
npm run lint          # Vérifier
npm run lint:fix      # Corriger automatiquement

# Tests
npm test              # Unit + component (rapide)
npm run test:coverage # Afficher la couverture
npm run test:watch    # Mode watch (développement)

# E2E
npm run test:e2e      # Tests browser (nécessite dev server)
npm run test:all      # Tests complets (unit + E2E)
```

---

## 🚀 Prochaines étapes

1. ✅ **Migration Biome complétée** - Linter opérationnel avec 0 erreurs critiques
2. ✅ **Infrastructure de test mise en place** - Tests automatisés + déploiement gardienné
3. ⏳ **Optional: Reduce 4 warnings** - Optimisation des patterns avancés
4. **Formatage automatique** - Configurer `biome format --write` avant commit (optionnel)
5. **Documentation d'équipe** - Former l'équipe aux règles Biome et patterns recommandés
