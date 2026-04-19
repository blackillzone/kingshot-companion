# Audit critique de la codebase

Date: 2026-04-19

Périmètre analysé: application React du dossier `formation-calculator/`.

Note de cadrage: la référence aux bonnes pratiques Vue.js n'est pas applicable telle quelle ici, car la codebase est une SPA React. Le retour ci-dessous est donc aligné sur le clean code, TypeScript et les best practices React modernes.

## Synthèse

La codebase a de bonnes bases: stack moderne, documentation présente, logique mathématique globalement isolée dans `src/lib/formulas.ts`, types centralisés et UI lisible. En revanche, l'état actuel n'est pas encore au niveau d'une base saine et durable.

Les problèmes les plus marquants sont:

- la chaîne de qualité n'est pas verte: le build et le lint échouent actuellement
- plusieurs données saisies dans l'interface ne sont jamais utilisées par le moteur de calcul
- certains composants sont devenus trop gros et mélangent plusieurs responsabilités
- le store Zustand concentre trop de responsabilités métier, UI et persistance
- il n'existe aucune couverture de tests automatisés

Conclusion: la base est exploitable fonctionnellement, mais elle a déjà franchi le seuil où la dette technique freine l'évolution du produit.

## Points positifs

- `src/lib/formulas.ts` reste relativement pur et séparé de la couche UI.
- `src/types/index.ts` sert de point d'entrée unique pour une grande partie du modèle métier.
- `src/components/ui.tsx` apporte un début de bibliothèque de composants réutilisables.
- La documentation dans `doc/` facilite la prise en main.
- Le choix React + TypeScript + Vite + Zustand est cohérent pour une SPA de cette taille.

## Constats critiques

### 1. La quality gate est cassée

État vérifié:

- `npm run build` échoue à cause d'une variable inutilisée dans `src/components/Profiles/GovDataEditor.tsx`
- `npm run lint` échoue aussi sur:
  - `src/components/Profiles/HeroRoster.tsx`
  - `src/components/Results/ParticipantGraph.tsx`

Ce point est prioritaire, car une codebase qui ne build plus proprement ne peut pas être refactorée sereinement.

Les erreurs relevées ne sont pas anecdotiques: elles signalent des écarts concrets avec les bonnes pratiques React.

- `HeroRoster.tsx` fait un `setState` synchrone dans un effet
- `HeroRoster.tsx` modifie une ref pendant le render
- `ParticipantGraph.tsx` crée un composant dans le render
- `GovDataEditor.tsx` expose une prop inutilisée

Recommandation:

- remettre le build et le lint au vert avant toute évolution fonctionnelle supplémentaire
- traiter la qualité comme un prérequis, pas comme un nettoyage ultérieur

### 2. Une partie importante des données saisies ne pilote aucun calcul

Le problème d'architecture le plus important est ici: l'application propose une zone `User Data` riche, mais une grande partie de ces données n'alimente pas la logique métier du calculateur.

Champs actuellement saisis mais non branchés au moteur de calcul:

- `bearLevel`
- `ownedHeroes`
- `govGear`
- `govCharmLevel`
- `staticBonuses`
- `troops`

Constat vérifié: `computeFormation`, `computeDamageScore` et `computeParticipantCurve` ne consomment pas ces données. Elles sont stockées et éditées, mais pas utilisées.

Conséquences:

- dette produit: l'UI suggère des capacités que le domaine métier n'implémente pas réellement
- confusion utilisateur: une donnée modifiée peut donner l'impression d'impacter le résultat alors que ce n'est pas le cas
- dette d'architecture: le modèle `PlayerProfile` grossit plus vite que le domaine réellement exécuté

Recommandation:

- soit brancher ces champs à une vraie pipeline de calcul
- soit les sortir temporairement du flux principal
- au minimum, afficher explicitement ce qui est "stocké pour plus tard" et ce qui influence réellement le résultat

### 3. Le flux d'import de profil est incohérent et potentiellement buggué

Le flux d'import dans `src/components/Profiles/ProfileManager.tsx` appelle `updateProfile(profile)` après lecture du JSON.

Or:

- `importProfileFromJson` dans `src/lib/storage.ts` génère un nouvel `id`
- `updateProfile` dans `src/store/useRallyStore.ts` fusionne le profil importé avec le profil actif, puis fait un `upsert`

Le couplage actuel est fragile et peut produire un état incohérent entre:

- `activeProfile`
- `activeProfileId`
- la liste `profiles`

Le bon contrat n'est pas clair: importer un profil devrait être une action dédiée du store, avec comportement explicite:

- ajouter un nouveau profil
- éventuellement le sélectionner
- persister correctement l'identifiant actif

Recommandation:

- créer une action store dédiée, par exemple `importProfile(profile)`
- interdire que `updateProfile` serve à la fois à l'édition courante et à l'import externe

### 4. `useRallyStore` concentre trop de responsabilités

Le store dans `src/store/useRallyStore.ts` gère à lui seul:

- l'hydratation initiale
- le bootstrap du premier profil
- la persistance locale
- la sélection du profil actif
- le calcul du résultat
- l'état de navigation UI

Ce n'est plus un simple store, c'est déjà un orchestrateur applicatif.

Conséquences:

- testabilité faible
- duplication de logique de persistance
- responsabilités mélangées domaine/UI/infrastructure
- complexité croissante à chaque nouvelle feature

Recommandation:

- séparer en slices ou en modules explicites:
  - store profil
  - store calcul/rally
  - store UI/navigation
- déplacer la persistance dans une couche dédiée ou utiliser `persist` de Zustand avec migration versionnée
- garder les calculs dérivés près du domaine, pas dispersés dans les actions

## Problèmes d'architecture et de clean code

### 5. `HeroRoster.tsx` est devenu un composant monolithe

`src/components/Profiles/HeroRoster.tsx` est le principal candidat au refactor.

Ce fichier concentre dans un seul module:

- données statiques d'images et de widgets
- filtres de vue
- tooltip
- carte héros
- panneau de détail
- logique de navigation clavier
- logique d'animation
- logique de sélection globale
- logique de mise à jour du profil

Le fichier dépasse largement le seuil d'un composant React maintenable. Ce n'est plus un composant; c'est un sous-module applicatif compressé dans un seul fichier.

Symptômes visibles:

- taille très élevée
- nombreux sous-composants locaux
- plusieurs `useState`, `useEffect` et `useRef`
- logique UI, logique métier légère et logique d'interaction entremêlées
- plusieurs patterns DOM impératifs (`document.querySelector`, `getComputedStyle`, `window.addEventListener`)

Recommandation:

- extraire au minimum:
  - `HeroFilters`
  - `HeroGrid`
  - `HeroCard`
  - `HeroDetailPanel`
  - un hook `useHeroRosterNavigation`
  - un module `heroAssets.ts` ou `heroCatalog.ts`

### 6. `UserDataPage.tsx` mélange layout, animation et navigation

`src/components/UserData/UserDataPage.tsx` porte trop de logique d'animation locale:

- `selectedHero`
- `renderedHero`
- `panelState`
- `panelDx`
- gestion manuelle d'un timer

Le composant est encore de taille raisonnable, mais il commence déjà à masquer son intention métier.

Le `useEffect` d'animation repose en plus sur un `eslint-disable` pour éviter les dépendances exhaustives. C'est un signe qu'il faut extraire le comportement dans un hook dédié.

Recommandation:

- créer un hook du type `useAnimatedHeroPanel`
- laisser `UserDataPage` gérer uniquement la composition de la page
- déplacer la logique temporelle et de transition hors du composant principal

### 7. Les métadonnées héros sont dispersées

La connaissance métier autour des héros n'est pas centralisée dans une seule source de vérité.

Aujourd'hui, elle est répartie entre:

- `src/types/index.ts`
- `src/lib/heroes.ts`
- `src/components/Profiles/HeroRoster.tsx`
- `src/components/LeaderStats/StatsForm.tsx`

Exemples de dispersion:

- `HeroName` maintenu à la main
- `HERO_DB` séparé des images locales et des widgets affichés
- groupes visuels et labels présents dans le composant au lieu d'un module métier

Conséquences:

- coût de maintenance élevé lors de l'ajout d'un héros
- risque d'oublier une synchronisation entre types, data, images et UI
- logique métier noyée dans les composants

Recommandation:

- centraliser le catalogue héros dans un module unique exportant:
  - les données métier
  - les métadonnées UI nécessaires
  - les groupes/filtres
- dériver autant que possible les types depuis la donnée source

### 8. Certaines abstractions UI sont dupliquées ou incomplètes

Le projet commence à avoir une bibliothèque UI (`src/components/ui.tsx`), mais elle n'est pas encore appliquée de façon homogène.

Exemples:

- `NumberInput` dans `ui.tsx`
- `MiniInput` redéfini dans `HeroRoster.tsx`
- plusieurs `<input>` stylés à la main dans d'autres composants

Le problème n'est pas seulement stylistique. Cela duplique les règles de parsing, clamp, synchronisation d'affichage et comportements clavier.

Recommandation:

- extraire une vraie famille de composants de formulaire réutilisables
- éviter de redévelopper localement des contrôles déjà présents

## Écarts spécifiques aux bonnes pratiques React

### 9. Trop de logique impérative dans les composants

Plusieurs composants s'appuient fortement sur:

- timers manuels
- accès DOM directs
- listeners globaux
- calculs dépendants du layout en runtime

Ce n'est pas interdit, mais ce type de logique devrait être isolé dans des hooks dédiés et bien encapsulés. Aujourd'hui, il est dispersé dans les composants, ce qui augmente fortement le coût de lecture et de maintenance.

### 10. `ParticipantGraph.tsx` contient un composant local créé pendant le render

Le tooltip est défini dans le corps du composant puis injecté comme élément JSX. Le lint a raison de le signaler.

Recommandation:

- extraire `CustomTooltip` en composant séparé ou fonction pure stable
- garder le composant principal focalisé sur l'assemblage du graphe

### 11. Les composants de formulaire sont trop orientés "state local de saisie" sans stratégie commune

Le pattern `display` + `commit()` est utilisé à plusieurs endroits. Il est utile pour améliorer la saisie, mais il devrait être standardisé.

Aujourd'hui:

- la logique est répétée
- le comportement exact varie selon les composants
- l'un des cas déclenche même une règle lint React

Recommandation:

- factoriser ce comportement dans un hook commun ou dans un composant d'input robuste

## Qualité technique manquante

### 12. Aucun test automatisé

Il n'y a actuellement:

- aucun test unitaire
- aucun test d'intégration
- aucun test end-to-end
- aucun script `test` dans `package.json`

Pour une application avec logique de calcul métier, c'est une faiblesse majeure.

Les premiers tests à écrire devraient cibler:

- `src/lib/formulas.ts`
- `src/lib/storage.ts`
- `src/store/useRallyStore.ts`

### 13. Validation et migration de données trop faibles

`src/lib/storage.ts` parse et hydrate les données locales avec des fallbacks, mais sans schéma de validation explicite ni versionnement clair du modèle.

Risques:

- profils partiellement corrompus acceptés silencieusement
- comportements imprévisibles après évolution du modèle
- import JSON trop permissif

Recommandation:

- introduire un schéma de validation au chargement et à l'import
- versionner le format du profil
- rendre les migrations explicites et testées

### 14. TypeScript est utile mais pas encore utilisé au niveau d'exigence attendu

La codebase utilise TypeScript, mais la configuration n'est pas au niveau le plus strict. Par exemple, `strict` n'est pas activé dans les tsconfig applicatifs.

Ce n'est pas bloquant à court terme, mais cela limite la capacité à sécuriser les futurs refactors.

Recommandation:

- monter progressivement le niveau d'exigence TypeScript
- corriger d'abord les points structurants avant d'activer toutes les options strictes d'un coup

### 15. Pas d'error boundary ni de stratégie de résilience UI

La base actuelle part du principe que tous les composants rendent correctement en permanence. Pour une SPA avec graphiques, parsing local et données dynamiques, c'est fragile.

Recommandation:

- ajouter au minimum un Error Boundary applicatif autour de l'arbre principal
- prévoir un fallback propre pour les écrans de calcul et les composants graphiques

## Fichiers à refactorer en priorité

### Priorité 1

1. `src/components/Profiles/HeroRoster.tsx`
   - Trop gros, trop couplé, plusieurs violations React, responsabilités mélangées.

2. `src/store/useRallyStore.ts`
   - Trop de responsabilités; doit être découpé avant que la dette n'augmente encore.

3. `src/components/Profiles/ProfileManager.tsx`
   - Flux d'import à corriger; contrat store à clarifier.

4. `src/lib/storage.ts`
   - Validation, migration et import/export à formaliser.

### Priorité 2

5. `src/components/UserData/UserDataPage.tsx`
   - Logique d'animation et navigation à extraire.

6. `src/components/Results/ParticipantGraph.tsx`
   - Nettoyage React simple mais nécessaire pour revenir à un lint propre.

7. `src/components/LeaderStats/StatsForm.tsx`
   - Composant encore lisible, mais déjà répétitif et orienté "formulaire écrit à la main".

8. `src/lib/heroes.ts`
   - À consolider avec les métadonnées UI dispersées.

### Priorité 3

9. `src/components/ui.tsx`
   - Faire évoluer ce fichier vers une vraie couche de primitives de formulaire et de layout.

10. `src/components/Profiles/GovDataEditor.tsx`
   - Petit nettoyage immédiat, puis repositionnement selon le vrai rôle du module `User Data`.

## Recommandations d'évolution d'architecture

### Court terme

- remettre `build` et `lint` au vert
- corriger le flux d'import de profil
- décider clairement du statut des données `User Data`: actives dans le calcul ou simples données préparatoires
- ajouter une base de tests unitaires sur les formules et le storage

### Moyen terme

- découper `HeroRoster.tsx`
- extraire les hooks de navigation/animation
- séparer le store en slices ou modules explicites
- centraliser le catalogue héros et ses métadonnées UI

### Long terme

- brancher réellement `User Data` à une chaîne de calcul enrichie si c'est l'objectif produit
- introduire une stratégie de validation versionnée pour les profils
- renforcer progressivement la strictness TypeScript

## Verdict

La codebase n'est pas mauvaise dans ses fondations, mais elle est déjà entrée dans une zone où l'ajout de features coûte trop cher par rapport à la structure actuelle.

Le point le plus important n'est pas un micro-refactor, c'est une clarification d'architecture:

- qu'est-ce qui fait réellement partie du domaine métier du calculateur
- qu'est-ce qui n'est aujourd'hui qu'une interface de saisie non branchée

Tant que cette frontière n'est pas clarifiée, la dette va continuer à croître, même avec des corrections locales.