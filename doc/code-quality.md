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

### Erreurs restantes (35 + 4 warnings)

Les erreurs suivantes sont en cours de résolution :
- **Accessibility (a11y)** : Boutons sans `type`, labels sans `htmlFor`, SVG sans `title`
- **Performance** : Spreading d'objets accumulé, itérables sans `return`
- **Style** : Éléments statiques avec interactions

**Raison** : Liées à des patterns React avancés et l'accessibilité qui nécessitent des refactorages plus larges du composant. Ces corrections seront faites lors des passes de nettoyage ultérieures.

## 📊 Statistiques

| Métrique | Avant | Après |
|----------|-------|-------|
| Linter | ESLint v9.x | Biome v2.4.12 |
| Plugins ESLint | 4 (@typescript-eslint, react-hooks, react-refresh, globals) | 0 (natif dans Biome) |
| Dépendances Dev | ~141 packages | ~96 packages |
| Temps de lint (approx) | 2-3s | ~0.1-0.2s |

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

## 🚀 Prochaines étapes

1. **Corriger les 35 erreurs restantes** (surtout l'accessibilité)
2. **Tests automatisés** : Ajouter Biome à la CI/CD
3. **Formatage automatique** : Configurer `biome format` si besoin (actuellement seulement linting)
