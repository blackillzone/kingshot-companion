import { useState, useEffect, useRef, useMemo } from "react";
import { useRallyStore } from "../../store/useRallyStore";
import { HERO_DB } from "../../lib/heroes";
import {
  HERO_IMG,
  HERO_GROUPS,
  ALL_HEROES_SORTED,
  GEN_BADGE,
  heroGenOrder,
} from "../../lib/heroCatalog";
import type { HeroName, OwnedHeroData } from "../../types";
import { defaultOwnedHeroData } from "../../lib/storage";
import { useHeroRosterNavigation } from "../../hooks/useHeroRosterNavigation";
import { Info } from "lucide-react";
import clsx from "clsx";

// Re-export HeroDetailPanel for backward compatibility
export { HeroDetailPanel } from "./HeroDetailPanel";

// ─── SlideFilterBar ───────────────────────────────────────────────────────────

function SlideFilterBar<T extends string>({
  filters,
  active,
  onChange,
}: {
  filters: { id: T; label: string; idle: string; active: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLButtonElement>(
      `[data-id="${active}"]`,
    );
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active]);

  const activeFilter = filters.find((f) => f.id === active);
  if (!activeFilter) return null;

  return (
    <div ref={containerRef} className="relative flex gap-1">
      {indicator && (
        <span
          className={clsx(
            "absolute top-0 h-full rounded pointer-events-none transition-all duration-200 ease-out",
            activeFilter.active,
          )}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {filters.map((f) => (
        <button
          type="button"
          key={f.id}
          data-id={f.id}
          onClick={() => onChange(f.id)}
          className={clsx(
            "relative z-10 shrink-0 px-3 py-1.5 rounded text-[12px] font-bold uppercase tracking-wide transition-colors duration-150",
            f.id === active ? "text-white" : clsx("bg-transparent", f.idle),
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      role="tooltip"
      aria-live="polite"
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full right-0 mb-1.5 z-50 pointer-events-none">
          <div className="block whitespace-nowrap bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-lg">
            {text}
          </div>
          <span className="block w-2 h-2 bg-gray-800 border-r border-b border-gray-700 rotate-45 ml-auto mr-1 -mt-1" />
        </span>
      )}
    </div>
  );
}

// ─── HeroCard ─────────────────────────────────────────────────────────────────

function HeroCard({
  name,
  isOwned,
  isSelected,
  onClick,
  onToggleOwned,
}: {
  name: HeroName;
  isOwned: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onToggleOwned: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hero = HERO_DB[name];
  const imgSrc = HERO_IMG[name];
  const genKey = hero.generation !== null ? String(hero.generation) : null;
  const badge = genKey ? GEN_BADGE[genKey] : null;

  return (
    <button
      type="button"
      onClick={(e) => onClick(e)}
      title={name}
      className={clsx(
        "flex flex-col w-full rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer bg-gray-900",
        isSelected
          ? "border-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)] scale-105 z-10"
          : isOwned
            ? "border-orange-500/50 hover:border-orange-400 hover:scale-[1.04]"
            : "border-gray-700/60 hover:border-gray-500 hover:scale-[1.02]",
      )}
    >
      <div className="flex items-center justify-between px-1 py-[3px] bg-gray-950 shrink-0">
        {badge ? (
          <span
            className={clsx(
              "text-[11px] font-bold px-1 py-[2px] rounded-sm text-white leading-none",
              badge.bg,
            )}
          >
            {badge.label}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label={isOwned ? "Retirer" : "Posséder"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleOwned();
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onToggleOwned();
            }
          }}
          className={clsx(
            "w-3 h-3 rounded-full transition-all cursor-pointer",
            isOwned
              ? "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.9)] hover:bg-orange-300"
              : "bg-gray-700 hover:bg-gray-500 border border-gray-600",
          )}
        />
      </div>

      <div className="aspect-square w-full overflow-hidden shrink-0">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={name}
            className={clsx(
              "w-full h-full object-cover object-top",
              !isOwned && "grayscale opacity-35",
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full flex items-center justify-center bg-gray-800",
              !isOwned && "opacity-35",
            )}
          >
            <span className="text-xl font-bold text-gray-500">{name[0]}</span>
          </div>
        )}
      </div>

      <div className="bg-gray-950 px-1 py-1 shrink-0">
        <p className="text-xs font-semibold text-white text-center truncate leading-tight">
          {name}
        </p>
      </div>
    </button>
  );
}

// ─── Filter types & constants ─────────────────────────────────────────────────

type FilterClass = "all" | "inf" | "cav" | "arc";
type FilterGen = "all" | "1" | "2" | "3" | "4" | "5" | "epic" | "rare";

const CLASS_GROUP_LABEL: Record<Exclude<FilterClass, "all">, string> = {
  inf: "Infantry",
  cav: "Cavalry",
  arc: "Archers",
};

const CLASS_FILTERS: {
  id: FilterClass;
  label: string;
  idle: string;
  active: string;
}[] = [
  {
    id: "all",
    label: "All",
    idle: "text-gray-400 hover:text-gray-200 hover:bg-gray-700/60",
    active: "bg-gray-600 text-white",
  },
  {
    id: "inf",
    label: "Infantry",
    idle: "text-red-400/70   hover:text-red-300   hover:bg-red-950/60",
    active: "bg-red-700    text-white",
  },
  {
    id: "cav",
    label: "Cavalry",
    idle: "text-yellow-400/70 hover:text-yellow-300 hover:bg-yellow-950/60",
    active: "bg-yellow-600 text-gray-950",
  },
  {
    id: "arc",
    label: "Archers",
    idle: "text-blue-400/70  hover:text-blue-300   hover:bg-blue-950/60",
    active: "bg-blue-600   text-white",
  },
];

const GEN_FILTERS: {
  id: FilterGen;
  label: string;
  idle: string;
  active: string;
}[] = [
  {
    id: "all",
    label: "All",
    idle: "text-gray-400     hover:text-gray-200   hover:bg-gray-700/60",
    active: "bg-gray-600   text-white",
  },
  {
    id: "1",
    label: "S1",
    idle: "text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60",
    active: "bg-orange-500 text-white",
  },
  {
    id: "2",
    label: "S2",
    idle: "text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60",
    active: "bg-orange-500 text-white",
  },
  {
    id: "3",
    label: "S3",
    idle: "text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60",
    active: "bg-orange-500 text-white",
  },
  {
    id: "4",
    label: "S4",
    idle: "text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60",
    active: "bg-orange-500 text-white",
  },
  {
    id: "5",
    label: "S5",
    idle: "text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60",
    active: "bg-orange-500 text-white",
  },
  {
    id: "epic",
    label: "Epic",
    idle: "text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/60",
    active: "bg-purple-600 text-white",
  },
  {
    id: "rare",
    label: "Rare",
    idle: "text-sky-400/80    hover:text-sky-300    hover:bg-sky-950/60",
    active: "bg-sky-600    text-white",
  },
];

// ─── computeFilteredHeroes ────────────────────────────────────────────────────

function buildFilterByGen(filterGen: FilterGen) {
  return (name: HeroName) => {
    if (filterGen === "all") return true;
    const gen = HERO_DB[name].generation;
    if (filterGen === "epic") return gen === "epic";
    if (filterGen === "rare") return gen === "rare";
    return String(gen) === filterGen;
  };
}

function computeFilteredHeroes(
  filterClass: FilterClass,
  filterGen: FilterGen,
): HeroName[] {
  const filterByGen = buildFilterByGen(filterGen);
  const groups =
    filterClass === "all"
      ? (() => {
          const heroes = ALL_HEROES_SORTED.filter(filterByGen);
          return heroes.length > 0 ? [{ heroes }] : [];
        })()
      : HERO_GROUPS.filter((g) => g.label === CLASS_GROUP_LABEL[filterClass])
          .map((g) => ({
            heroes: g.heroes.filter(filterByGen).sort((a, b) => {
              const ga = heroGenOrder(HERO_DB[a].generation);
              const gb = heroGenOrder(HERO_DB[b].generation);
              if (ga !== gb) return ga - gb;
              return a.localeCompare(b);
            }),
          }))
          .filter((g) => g.heroes.length > 0);
  return groups.flatMap((g) => g.heroes);
}

// ─── HeroRoster ───────────────────────────────────────────────────────────────

export function HeroRoster({
  selectedHero,
  setSelectedHero,
  onFilteredHeroesChange,
}: {
  selectedHero: HeroName | null;
  setSelectedHero: (hero: HeroName | null, dir?: "left" | "right") => void;
  onFilteredHeroesChange?: (heroes: HeroName[]) => void;
}) {
  const activeProfile = useRallyStore((s) => s.activeProfile);
  const updateProfile = useRallyStore((s) => s.updateProfile);
  const [filterClass, setFilterClass] = useState<FilterClass>("all");
  const [filterGen, setFilterGen] = useState<FilterGen>("all");
  const [gridKey, setGridKey] = useState(0);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredHeroesRef = useHeroRosterNavigation(
    selectedHero,
    setSelectedHero,
  );

  useEffect(() => {
    onFilteredHeroesChange?.(computeFilteredHeroes(filterClass, filterGen));
  }, [filterClass, filterGen, onFilteredHeroesChange]);

  function applyFilter(fn: () => void) {
    setExiting(true);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      fn();
      setGridKey((k) => k + 1);
      setExiting(false);
    }, 140);
  }

  const filteredHeroes = useMemo(() => {
    if (!activeProfile) return [];
    const filterByGen = buildFilterByGen(filterGen);
    const filteredGroups =
      filterClass === "all"
        ? (() => {
            const heroes = ALL_HEROES_SORTED.filter(filterByGen);
            return heroes.length > 0 ? [{ label: "", accent: "", heroes }] : [];
          })()
        : HERO_GROUPS.filter((g) => g.label === CLASS_GROUP_LABEL[filterClass])
            .map((g) => ({
              ...g,
              heroes: g.heroes.filter(filterByGen).sort((a, b) => {
                const ga = heroGenOrder(HERO_DB[a].generation);
                const gb = heroGenOrder(HERO_DB[b].generation);
                if (ga !== gb) return ga - gb;
                return a.localeCompare(b);
              }),
            }))
            .filter((g) => g.heroes.length > 0);
    return filteredGroups.flatMap((g) => g.heroes);
  }, [activeProfile, filterClass, filterGen]);

  useEffect(() => {
    filteredHeroesRef.current = filteredHeroes;
  }, [filteredHeroes, filteredHeroesRef]);

  if (!activeProfile) return null;

  const ownedHeroes = activeProfile.ownedHeroes ?? {};

  function getHeroData(name: HeroName): OwnedHeroData {
    return ownedHeroes[name] ?? defaultOwnedHeroData();
  }

  function toggleOwned(name: HeroName) {
    const data = getHeroData(name);
    updateProfile({
      ownedHeroes: { ...ownedHeroes, [name]: { ...data, owned: !data.owned } },
    });
  }

  function handleCardClick(name: HeroName, e: React.MouseEvent) {
    const data = getHeroData(name);
    if (!data.owned) {
      updateProfile({
        ownedHeroes: {
          ...ownedHeroes,
          [name]: { ...data, owned: true, stars: 0, starSubLevel: 2 },
        },
      });
    }
    const dir: "left" | "right" =
      e.clientX < window.innerWidth / 2 ? "left" : "right";
    setSelectedHero(selectedHero === name ? null : name, dir);
  }

  const allOwned =
    filteredHeroes.length > 0 &&
    filteredHeroes.every((n) => getHeroData(n).owned);

  function toggleAllOwned() {
    const patch: typeof ownedHeroes = { ...ownedHeroes };
    for (const name of filteredHeroes) {
      patch[name] = {
        ...(patch[name] ?? defaultOwnedHeroData()),
        owned: !allOwned,
      };
    }
    updateProfile({ ownedHeroes: patch });
  }

  const filterByGen = buildFilterByGen(filterGen);
  const filteredGroups =
    filterClass === "all"
      ? (() => {
          const heroes = ALL_HEROES_SORTED.filter(filterByGen);
          return heroes.length > 0 ? [{ label: "", accent: "", heroes }] : [];
        })()
      : HERO_GROUPS.filter((g) => g.label === CLASS_GROUP_LABEL[filterClass])
          .map((g) => ({
            ...g,
            heroes: g.heroes.filter(filterByGen).sort((a, b) => {
              const ga = heroGenOrder(HERO_DB[a].generation);
              const gb = heroGenOrder(HERO_DB[b].generation);
              if (ga !== gb) return ga - gb;
              return a.localeCompare(b);
            }),
          }))
          .filter((g) => g.heroes.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Filter bar ── */}
      <div className="relative z-20 bg-gray-900 rounded-lg border border-gray-800 p-2 space-y-2 shrink-0">
        <div className="absolute top-3 right-2 z-30">
          <Tooltip text="Click a hero to select it and configure its details.">
            <span
              role="img"
              aria-label="Info about hero selection"
              className="text-gray-600 hover:text-gray-400 cursor-default transition-colors"
            >
              <Info size={12} />
            </span>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest w-16 shrink-0">
            Class
          </span>
          <SlideFilterBar
            filters={CLASS_FILTERS}
            active={filterClass}
            onChange={(id) => applyFilter(() => setFilterClass(id))}
          />
        </div>
        <div className="border-t border-gray-800" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest w-16 shrink-0">
            Season
          </span>
          <SlideFilterBar
            filters={GEN_FILTERS}
            active={filterGen}
            onChange={(id) => applyFilter(() => setFilterGen(id))}
          />
        </div>
      </div>

      {/* ── Hero grid ── */}
      <div className="relative h-[480px]">
        {filteredHeroes.length > 0 && (
          <button
            type="button"
            onClick={toggleAllOwned}
            className={clsx(
              "absolute bottom-3 right-5 z-10 px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm",
              allOwned
                ? "bg-orange-950/90 border border-orange-500/70 text-orange-300 hover:bg-orange-900/90"
                : "bg-gray-950/95 border border-orange-500/50 text-orange-400 hover:bg-orange-950/80 hover:border-orange-400/70",
            )}
          >
            {allOwned ? "Deselect all" : "Select all"}
          </button>
        )}
        <div className="overflow-y-auto h-full px-1.5 -mx-1.5 pt-1.5 space-y-3">
          <div
            key={gridKey}
            className={exiting ? "hero-grid-exit" : "hero-grid-enter"}
          >
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.label || "__all__"} className="mb-3">
                  {group.label && (
                    <p
                      className={clsx(
                        "text-[13px] font-bold uppercase tracking-widest mb-2",
                        group.accent,
                      )}
                    >
                      {group.label}
                    </p>
                  )}
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 hero-cols-grid">
                    {group.heroes.map((name, i) => (
                      <div
                        key={name}
                        data-hero={name}
                        className="hero-grid-enter"
                        style={{
                          animationDelay: exiting ? "0ms" : `${i * 22}ms`,
                        }}
                      >
                        <HeroCard
                          name={name}
                          isOwned={getHeroData(name).owned}
                          isSelected={selectedHero === name}
                          onClick={(e) => handleCardClick(name, e)}
                          onToggleOwned={() => toggleOwned(name)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">
                No heroes match this filter
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
