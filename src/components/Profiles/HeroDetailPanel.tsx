import { useState } from "react";
import { HERO_DB } from "../../lib/heroes";
import { HERO_IMG, GX_HEROES, WIDGET_IMG, WIDGET_NAME } from "../../lib/heroCatalog";
import type { HeroName, OwnedHeroData, HeroGearSlot } from "../../types";
import { X } from "lucide-react";
import clsx from "clsx";
import { MiniInput } from "../ui";

// ─── GearSlotCard ─────────────────────────────────────────────────────────────

function GearSlotCard({
  label,
  level,
  mastery,
  onChangeLevel,
  onChangeMastery,
}: {
  label: string;
  level: number;
  mastery: number;
  onChangeLevel: (v: number) => void;
  onChangeMastery: (v: number) => void;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-lg p-1.5">
      <p className="text-xs font-bold text-gray-400 uppercase text-center leading-none mb-1.5 tracking-wide">
        {label}
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-600 shrink-0 w-5 text-right">
            Lv
          </span>
          <MiniInput value={level} onChange={onChangeLevel} max={200} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-600 shrink-0 w-5 text-right">
            M
          </span>
          <MiniInput value={mastery} onChange={onChangeMastery} max={20} />
        </div>
      </div>
    </div>
  );
}

// ─── StarIcon ─────────────────────────────────────────────────────────────────

function StarIcon({
  index,
  filledCount,
  previewCount,
  onBranchClick,
  onBranchHover,
}: {
  index: number;
  filledCount: number;
  previewCount: number;
  onBranchClick: (branch: number) => void;
  onBranchHover: (branch: number | null) => void;
}) {
  const size = 44;
  const c = size / 2;
  const R = size * 0.46;
  const r = size * 0.2;
  const gradId = `cg-${index}`;
  const previewGradId = `cpg-${index}`;

  function branchPath(i: number): string {
    const outerA = (i * 60 - 90) * (Math.PI / 180);
    const leftA = (i * 60 - 120) * (Math.PI / 180);
    const rightA = (i * 60 - 60) * (Math.PI / 180);
    const ox = c + R * Math.cos(outerA),
      oy = c + R * Math.sin(outerA);
    const lx = c + r * Math.cos(leftA),
      ly = c + r * Math.sin(leftA);
    const rx = c + r * Math.cos(rightA),
      ry = c + r * Math.sin(rightA);
    return `M ${c},${c} L ${lx},${ly} L ${ox},${oy} L ${rx},${ry} Z`;
  }

  const hasAny = filledCount > 0 || previewCount > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
      role="img"
      aria-label={`Tier rank ${filledCount} of 6`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={previewGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.75} />
        </linearGradient>
      </defs>
      {Array.from({ length: 6 }, (_, i) => {
        const rank = (6 - i) % 6;
        const isFilled = rank < filledCount;
        const isPreview = !isFilled && rank < previewCount;
        return (
          <>
            {/* biome-ignore lint/a11y/useSemanticElements: SVG group cannot use button element */}
            <g
              key={rank}
              role="button"
              tabIndex={0}
              onClick={() => onBranchClick(rank + 1)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onBranchClick(rank + 1);
                }
              }}
              onMouseEnter={() => onBranchHover(rank + 1)}
              onMouseLeave={() => onBranchHover(null)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={branchPath(i)}
                fill={
                  isFilled
                    ? `url(#${gradId})`
                    : isPreview
                      ? `url(#${previewGradId})`
                      : "#1f2937"
                }
                stroke={isFilled ? "#ea580c" : isPreview ? "#fb923c66" : "#374151"}
                strokeWidth={0.8}
                style={{ transition: "fill 80ms" }}
              />
            </g>
          </>
        );
      })}
      <circle
        cx={c}
        cy={c}
        r={size * 0.08}
        fill={hasAny ? "#fef3c7" : "#4b5563"}
        style={{ pointerEvents: "none" }}
      />
    </svg>
  );
}

// ─── HeroDetailPanel ──────────────────────────────────────────────────────────

export function HeroDetailPanel({
  name,
  data,
  onUpdate,
  onClose,
}: {
  name: HeroName;
  data: OwnedHeroData;
  onUpdate: (patch: Partial<OwnedHeroData>) => void;
  onClose: () => void;
}) {
  const hero = HERO_DB[name];
  const imgSrc = HERO_IMG[name];
  const [imgError, setImgError] = useState(false);
  const [hoveredPos, setHoveredPos] = useState<{
    star: number;
    branch: number;
  } | null>(null);

  const total = data.stars * 6 + Math.max(0, data.starSubLevel - 1);

  function handleBranchClick(star: number, branch: number) {
    const clicked = star * 6 + branch;
    const finalTotal = clicked === total ? clicked - 1 : clicked;
    const clamped = Math.max(0, Math.min(30, finalTotal));
    const newStars = Math.floor(clamped / 6);
    const rem = clamped % 6;
    onUpdate({ stars: newStars, starSubLevel: rem === 0 ? 1 : rem + 1 });
  }

  function updateGear(
    slot: HeroGearSlot,
    field: "level" | "masteryLevel",
    val: number,
  ) {
    const g = data.gear[slot];
    onUpdate({ gear: { ...data.gear, [slot]: { ...g, [field]: val } } });
  }

  return (
    <div className="bg-gray-900 border border-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between px-3 py-2 border-b border-gray-800">
        <div className="min-w-0 pr-2">
          <h3 className="text-base font-bold text-white leading-tight">
            {name}
          </h3>
          <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-1">
            {hero.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors mt-0.5"
        >
          <X size={13} />
        </button>
      </div>

      {/* Hero zone : gear gauche | avatar | gear droite */}
      <div className="bg-gray-950 p-2">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "100px 1fr 100px" }}
        >
          {/* Colonne gauche : Helm + Shroud */}
          <div className="flex flex-col justify-around gap-2">
            <GearSlotCard
              label="Helm"
              level={data.gear.helm.level}
              mastery={data.gear.helm.masteryLevel}
              onChangeLevel={(v) => updateGear("helm", "level", v)}
              onChangeMastery={(v) => updateGear("helm", "masteryLevel", v)}
            />
            <GearSlotCard
              label="Shroud"
              level={data.gear.shroud.level}
              mastery={data.gear.shroud.masteryLevel}
              onChangeLevel={(v) => updateGear("shroud", "level", v)}
              onChangeMastery={(v) => updateGear("shroud", "masteryLevel", v)}
            />
          </div>

          {/* Centre : avatar + widget */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full rounded-lg overflow-hidden">
              {imgSrc && !imgError ? (
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-full h-auto block"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-800">
                  <span className="text-3xl font-bold text-gray-600">
                    {name[0]}
                  </span>
                </div>
              )}
            </div>
            {GX_HEROES.includes(name) && (
              <div className="w-full bg-gray-800 border border-gray-700/60 rounded-lg p-1.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {WIDGET_IMG[name] && (
                    <img
                      src={WIDGET_IMG[name]}
                      alt={`${name} widget`}
                      className="w-7 h-7 rounded object-cover shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  )}
                  <p className="text-xs font-bold text-gray-400 uppercase leading-none tracking-wide">
                    {WIDGET_NAME[name] ?? "Widget"}
                  </p>
                </div>
                <MiniInput
                  value={data.widgetLevel}
                  onChange={(v) => onUpdate({ widgetLevel: v })}
                  max={10}
                />
              </div>
            )}
          </div>

          {/* Colonne droite : Gloves + Greaves */}
          <div className="flex flex-col justify-around gap-2">
            <GearSlotCard
              label="Gloves"
              level={data.gear.gloves.level}
              mastery={data.gear.gloves.masteryLevel}
              onChangeLevel={(v) => updateGear("gloves", "level", v)}
              onChangeMastery={(v) => updateGear("gloves", "masteryLevel", v)}
            />
            <GearSlotCard
              label="Greaves"
              level={data.gear.greaves.level}
              mastery={data.gear.greaves.masteryLevel}
              onChangeLevel={(v) => updateGear("greaves", "level", v)}
              onChangeMastery={(v) => updateGear("greaves", "masteryLevel", v)}
            />
          </div>
        </div>
      </div>

      {/* Bas : étoiles + niveau */}
      <div className="px-3 py-2.5 space-y-2.5 border-t border-gray-800">
        {/* Étoiles interactives */}
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4].map((s) => {
            const filledCount = Math.max(0, Math.min(6, total - s * 6));
            const previewCount =
              hoveredPos === null
                ? 0
                : hoveredPos.star > s
                  ? 6
                  : hoveredPos.star === s
                    ? hoveredPos.branch
                    : 0;
            return (
              <StarIcon
                key={`${hero.name}-star-${s}`}
                index={s}
                filledCount={filledCount}
                previewCount={previewCount}
                onBranchClick={(b) => handleBranchClick(s, b)}
                onBranchHover={(b) =>
                  setHoveredPos(b !== null ? { star: s, branch: b } : null)
                }
              />
            );
          })}
        </div>

        {/* Niveau — barre XP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Level
            </span>
            <span
              className={clsx(
                "text-sm font-bold tabular-nums px-2 py-0.5 rounded-md",
                data.level === 80
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-orange-400",
              )}
            >
              {data.level === 80 ? "MAX" : data.level}
            </span>
          </div>
          {/* Track */}
          <div className="relative h-3 flex items-center">
            <div className="absolute inset-0 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-150"
                style={{ width: `${((data.level - 1) / 79) * 100}%` }}
              />
            </div>
            {[20, 40, 60].map((tick) => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px bg-gray-950/60 pointer-events-none"
                style={{ left: `${((tick - 1) / 79) * 100}%` }}
              />
            ))}
            <input
              type="range"
              min={1}
              max={80}
              step={1}
              value={data.level}
              onChange={(e) =>
                onUpdate({ level: parseInt(e.target.value, 10) })
              }
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              aria-label="Hero level"
            />
          </div>
          {/* Légende */}
          <div className="flex justify-between text-[10px] text-gray-700 select-none px-0.5">
            <span>1</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
          </div>
        </div>
      </div>
    </div>
  );
}
