# Déploiement

## Repository GitHub

| Info | Valeur |
|---|---|
| Repository | https://github.com/blackillzone/kingshot-companion |
| Branche principale | `main` |
| Branche de déploiement | `gh-pages` (générée automatiquement) |
| URL de production | https://blackillzone.github.io/kingshot-companion/ |

---

## GitHub Actions

Le déploiement est entièrement automatisé. À chaque push sur `main`, le workflow CI/CD :

1. **Checkout** le code source
2. **Installe** les dépendances (`npm ci`)
3. **Build** l'application (`npm run build` → dossier `dist/`)
4. **Déploie** le contenu de `dist/` sur la branche `gh-pages`

### Fichier de workflow
`.github/workflows/deploy.yml`

Le workflow CI/CD exécute une pipeline de qualité avant tout déploiement :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      
      - name: Lint with Biome
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
          clean: true
```

**Pipeline de qualité :** Le déploiement n'est possible que si ✅ Lint, ✅ Tests, ✅ Build tous réussissent.

### Action utilisée
[JamesIves/github-pages-deploy-action@v4](https://github.com/JamesIves/github-pages-deploy-action) — déploie un dossier local sur une branche GitHub.

**Pourquoi cette action et pas `actions/deploy-pages` ?**  
`actions/deploy-pages` nécessite de configurer manuellement la source GitHub Pages sur "GitHub Actions" dans les Settings du repo, ce qui peut être oublié ou écrasé. `JamesIves` crée directement une branche `gh-pages` qui est servie sans configuration supplémentaire, tant que la source Pages est "Deploy from branch: gh-pages".

---

## Configuration GitHub Pages

Dans **Settings → Pages** du repository :
- **Source** : `Deploy from a branch`
- **Branch** : `gh-pages` / `/ (root)`

---

## Configuration Vite pour GitHub Pages

L'application étant servie sous un sous-chemin (`/kingshot-companion/`), Vite doit générer les assets avec la bonne base URL.

Dans `vite.config.ts` :
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/kingshot-companion/',
})
```

Sans cette option, les assets CSS/JS seraient référencés en chemin absolu (`/assets/...`) et ne se chargeraient pas sous le sous-chemin GitHub Pages.

---

## Développement local

```bash
# Installation des dépendances
cd formation-calculator
npm install

# Serveur de développement (hot reload)
npm run dev
# → http://localhost:5173/ (ou 5174 si port occupé)

# Build de production
npm run build
# → dist/

# Prévisualiser le build localement
npm run preview
```

---

## Processus de mise à jour

```
1. Modifier le code dans src/
2. Tester localement : npm run dev
3. Vérifier le build : npm run build
4. Commit + push sur main
   → GitHub Actions déclenche automatiquement le déploiement
   → Disponible sur github.io en ~1 minute
```

---

## Fichiers importants pour le déploiement

| Fichier | Rôle |
|---|---|
| `.github/workflows/deploy.yml` | Workflow CI/CD |
| `vite.config.ts` | Base URL pour GitHub Pages |
| `public/.nojekyll` | Désactive le traitement Jekyll sur gh-pages (requis pour les assets avec `_` dans le nom) |
| `index.html` | Shell HTML — référence le favicon et le point d'entrée JS |
