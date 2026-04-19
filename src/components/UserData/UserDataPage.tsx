import { useState } from "react";
import { useRallyStore } from "../../store/useRallyStore";
import { GovDataEditor } from "../Profiles/GovDataEditor";
import { HeroDetailPanel } from "../Profiles/HeroDetailPanel";
import { useAnimatedHeroPanel } from "../../hooks/useAnimatedHeroPanel";
import type { HeroName, OwnedHeroData } from "../../types";
import { defaultOwnedHeroData } from "../../lib/storage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export function UserDataPage() {
  const activeProfile = useRallyStore((s) => s.activeProfile);
  const updateProfile = useRallyStore((s) => s.updateProfile);
  const userDataTab = useRallyStore((s) => s.userDataTab);

  const [navHeroes, setNavHeroes] = useState<HeroName[]>([]);
  const { selectedHero, renderedHero, panelState, panelDx, handleSelectHero } =
    useAnimatedHeroPanel();

  if (!activeProfile) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        Sélectionnez un profil dans la page{" "}
        <span className="text-orange-400">Profiles</span> pour éditer les
        données.
      </p>
    );
  }

  const ownedHeroes = activeProfile.ownedHeroes ?? {};
  const renderedData: OwnedHeroData | null = renderedHero
    ? (ownedHeroes[renderedHero] ?? defaultOwnedHeroData())
    : null;

  function updateHero(name: HeroName, patch: Partial<OwnedHeroData>) {
    const current = ownedHeroes[name] ?? defaultOwnedHeroData();
    // Auto-own when the user edits any field
    const owned = current.owned ? {} : { owned: true };
    updateProfile({
      ownedHeroes: {
        ...ownedHeroes,
        [name]: { ...current, ...owned, ...patch },
      },
    });
  }

  return (
    <div
      className="max-w-7xl mx-auto grid gap-4"
      style={{ gridTemplateColumns: "1fr 420px" }}
    >
      {/* Colonne gauche : onglets */}
      <div className="col-start-1 row-start-1 relative z-20">
        <GovDataEditor
          selectedHero={selectedHero}
          setSelectedHero={handleSelectHero}
          onFilteredHeroesChange={setNavHeroes}
          activeTab={userDataTab}
        />
      </div>

      {/* Colonne droite : panel héros + flèches latérales */}
      {/* Colonne droite : panel héros + flèches latérales */}
      <div className="col-start-2 row-start-1 sticky top-4 self-start relative z-10">
        {renderedHero && renderedData && (
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-gray-800">
            {/* Flèche gauche */}
            <button
              type="button"
              onClick={() => {
                const i = navHeroes.indexOf(renderedHero);
                if (i > 0) {
                  const prev = navHeroes.at(i - 1);
                  if (prev) handleSelectHero(prev, "left");
                }
              }}
              disabled={
                panelState === "exit" || navHeroes.indexOf(renderedHero) <= 0
              }
              className={clsx(
                "flex items-center justify-center w-7 shrink-0 transition-all duration-150",
                panelState !== "exit" && navHeroes.indexOf(renderedHero) > 0
                  ? "text-orange-400 hover:text-orange-300 hover:bg-gray-800 cursor-pointer"
                  : "text-gray-700 cursor-default",
              )}
              aria-label="Previous hero"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            {/* Panel animé */}
            <div
              key={renderedHero}
              className={clsx(
                "flex-1 min-w-0",
                panelState === "exit" ? "hero-panel-exit" : "hero-panel-enter",
              )}
              style={{ "--panel-dx": panelDx } as React.CSSProperties}
            >
              <HeroDetailPanel
                name={renderedHero}
                data={renderedData}
                onUpdate={(patch) => updateHero(renderedHero, patch)}
                onClose={() => handleSelectHero(null)}
              />
            </div>

            {/* Flèche droite */}
            <button
              type="button"
              onClick={() => {
                const i = navHeroes.indexOf(renderedHero);
                if (i >= 0 && i < navHeroes.length - 1) {
                  const next = navHeroes.at(i + 1);
                  if (next) handleSelectHero(next, "right");
                }
              }}
              disabled={
                panelState === "exit" ||
                navHeroes.indexOf(renderedHero) >= navHeroes.length - 1
              }
              className={clsx(
                "flex items-center justify-center w-7 shrink-0 transition-all duration-150",
                panelState !== "exit" &&
                  navHeroes.indexOf(renderedHero) < navHeroes.length - 1
                  ? "text-orange-400 hover:text-orange-300 hover:bg-gray-800 cursor-pointer"
                  : "text-gray-700 cursor-default",
              )}
              aria-label="Next hero"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
