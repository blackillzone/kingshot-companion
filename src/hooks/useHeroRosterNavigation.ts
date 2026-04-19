import { useEffect, useRef } from "react";
import type { HeroName } from "../types";

/**
 * useHeroRosterNavigation — Gestion de la navigation clavier dans la grille héros.
 *
 * - Flèches gauche/droite : navigation héros précédent/suivant dans la liste filtrée
 * - Flèches haut/bas : navigation par ligne (détecte le nb de colonnes via CSS)
 * - Scroll automatique vers la carte sélectionnée
 *
 * @param selectedHero  Le héros actuellement sélectionné
 * @param setSelectedHero  Callback pour changer le héros sélectionné
 * @returns filteredHeroesRef  Ref à synchroniser avec la liste filtrée courante
 */
export function useHeroRosterNavigation(
  selectedHero: HeroName | null,
  setSelectedHero: (hero: HeroName | null, dir?: "left" | "right") => void,
): React.MutableRefObject<HeroName[]> {
  const filteredHeroesRef = useRef<HeroName[]>([]);

  // Navigation clavier entre héros
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (!selectedHero || !arrows.includes(e.key)) return;
      // Ne pas intercepter les inputs/sliders dans le panneau de détail
      if ((e.target as HTMLElement).closest('input, [role="slider"]')) return;
      const heroes = filteredHeroesRef.current;
      const idx = heroes.indexOf(selectedHero);
      if (idx === -1) return;
      e.preventDefault();

      if (e.key === "ArrowLeft" && idx > 0) {
        const prev = heroes.at(idx - 1);
        if (prev) return setSelectedHero(prev, "left");
      }
      if (e.key === "ArrowRight" && idx < heroes.length - 1) {
        const next = heroes.at(idx + 1);
        if (next) return setSelectedHero(next, "right");
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const card = document.querySelector(`[data-hero="${selectedHero}"]`);
        const grid = card?.closest(".hero-cols-grid") as HTMLElement | null;
        const cols = grid
          ? getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/)
              .length
          : 4;
        if (e.key === "ArrowUp" && idx - cols >= 0) {
          const up = heroes.at(idx - cols);
          if (up) setSelectedHero(up, "left");
        } else if (e.key === "ArrowDown" && idx + cols < heroes.length) {
          const down = heroes.at(idx + cols);
          if (down) setSelectedHero(down, "right");
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedHero, setSelectedHero]);

  // Scroll automatique vers la carte sélectionnée lors de la navigation clavier
  useEffect(() => {
    if (!selectedHero) return;
    const raf = requestAnimationFrame(() => {
      document
        .querySelector(`[data-hero="${selectedHero}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedHero]);

  return filteredHeroesRef;
}
