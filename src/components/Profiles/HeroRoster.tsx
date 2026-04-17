import { useState, useEffect, useRef } from 'react';
import { useRallyStore } from '../../store/useRallyStore';
import { HERO_DB } from '../../lib/heroes';
import type { HeroName, OwnedHeroData } from '../../types';
import { defaultOwnedHeroData } from '../../lib/storage';
import { X, Info } from 'lucide-react';
import clsx from 'clsx';

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
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLButtonElement>(`[data-id="${active}"]`);
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active]);

  const activeFilter = filters.find(f => f.id === active)!;

  return (
    <div ref={containerRef} className="relative flex gap-1">
      {/* Sliding background */}
      {indicator && (
        <span
          className={clsx('absolute top-0 h-full rounded pointer-events-none transition-all duration-200 ease-out', activeFilter.active)}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {filters.map(f => (
        <button
          key={f.id}
          data-id={f.id}
          onClick={() => onChange(f.id)}
          className={clsx(
            'relative z-10 shrink-0 px-3 py-1.5 rounded text-[12px] font-bold uppercase tracking-wide transition-colors duration-150',
            f.id === active ? 'text-white' : clsx('bg-transparent', f.idle),
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tooltip ───────────────────────────────────────────────────────────────────────────
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full right-0 mb-1.5 z-50 pointer-events-none">
          <span className="block whitespace-nowrap bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-lg">
            {text}
          </span>
          <span className="block w-2 h-2 bg-gray-800 border-r border-b border-gray-700 rotate-45 ml-auto mr-1 -mt-1" />
        </span>
      )}
    </span>
  );
}

// ─── Avatar URLs (images locales dans public/heroes/) ─────────────────────────
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const HERO_IMG: Partial<Record<HeroName, string>> = {
  Amadeus: `${BASE}/heroes/amadeus.webp`,
  Helga:   `${BASE}/heroes/helga.webp`,
  Zoe:     `${BASE}/heroes/zoe.webp`,
  Eric:    `${BASE}/heroes/eric.webp`,
  Alcar:   `${BASE}/heroes/alcar.webp`,
  Howard:  `${BASE}/heroes/howard.webp`,
  Seth:    `${BASE}/heroes/seth.webp`,
  Forrest: `${BASE}/heroes/forrest.webp`,
  Longfei: `${BASE}/heroes/longfei.webp`,
  Jabel:   `${BASE}/heroes/jabel.webp`,
  Hilde:   `${BASE}/heroes/hilde.webp`,
  Petra:   `${BASE}/heroes/petra.webp`,
  Margot:  `${BASE}/heroes/margot.webp`,
  Gordon:  `${BASE}/heroes/gordon.webp`,
  Chenko:  `${BASE}/heroes/chenko.webp`,
  Fahd:    `${BASE}/heroes/fahd.webp`,
  Edwin:   `${BASE}/heroes/edwin.webp`,
  Thrud:   `${BASE}/heroes/thrud.webp`,
  Saul:    `${BASE}/heroes/saul.webp`,
  Marlin:  `${BASE}/heroes/marlin.webp`,
  Jaeger:  `${BASE}/heroes/jaeger.webp`,
  Rosa:    `${BASE}/heroes/rosa.webp`,
  Vivian:  `${BASE}/heroes/vivian.webp`,
  Quinn:   `${BASE}/heroes/quinn.webp`,
  Amane:   `${BASE}/heroes/amane.webp`,
  Yeonwoo: `${BASE}/heroes/yeonwoo.webp`,
  Diana:   `${BASE}/heroes/diana.webp`,
  Olive:   `${BASE}/heroes/olive.webp`,
};

// ─── Widget (Exclusive Gear) icons ────────────────────────────────────────────
const GX_HEROES: HeroName[] = [
  'Amadeus', 'Helga', 'Jabel', 'Saul',
  'Hilde', 'Zoe', 'Marlin',
  'Eric', 'Petra', 'Jaeger',
  'Alcar', 'Margot', 'Rosa',
  'Thrud', 'Longfei', 'Vivian',
];
const WIDGET_IMG: Partial<Record<HeroName, string>> = Object.fromEntries(
  GX_HEROES.map(h => [h, `${BASE}/widgets/${h.toLowerCase()}.webp`])
);
const WIDGET_NAME: Partial<Record<HeroName, string>> = {
  Amadeus: 'Aegis of Fate',
  Helga:   'Bands of Tyre',
  Jabel:   'Greaves of Faith',
  Saul:    'Rabbitgear Cannon',
  Hilde:   'Revelation',
  Zoe:     'The Unrighteous',
  Marlin:  'Mistweaver',
  Eric:    'Anvil of Truth',
  Petra:   "Fate's Writ",
  Jaeger:  'Wanderwail',
  Alcar:   'Praetorian Guard',
  Margot:  'Revel Fang',
};

// ─── Hero groups ──────────────────────────────────────────────────────────────
const HERO_GROUPS: { label: string; accent: string; heroes: HeroName[] }[] = [
  {
    label: 'Infantry',
    accent: 'text-red-400',
    heroes: ['Amadeus', 'Helga', 'Zoe', 'Eric', 'Alcar', 'Longfei', 'Howard', 'Seth', 'Forrest'],
  },
  {
    label: 'Cavalry',
    accent: 'text-yellow-400',
    heroes: ['Jabel', 'Hilde', 'Petra', 'Margot', 'Thrud', 'Gordon', 'Chenko', 'Fahd', 'Edwin'],
  },
  {
    label: 'Archers',
    accent: 'text-blue-400',
    heroes: ['Saul', 'Marlin', 'Jaeger', 'Rosa', 'Vivian', 'Quinn', 'Amane', 'Yeonwoo', 'Diana', 'Olive'],
  },
];

// ─── Season sort helpers ─────────────────────────────────────────────────────
function heroGenOrder(gen: string | number | null): number {
  if (gen === 'rare') return 0;
  if (gen === 'epic') return 1;
  if (gen === null) return 99;
  const n = Number(gen);
  return isNaN(n) ? 99 : n + 1; // S1→2, S2→3, …, S5→6
}

// All heroes sorted: Rare → Epic → S1 → S2 → S3 → S4 → S5, then alpha
const ALL_HEROES_SORTED: HeroName[] = (Object.keys(HERO_DB) as HeroName[])
  .filter(n => n !== 'None' && n !== 'Other')
  .sort((a, b) => {
  const ga = heroGenOrder(HERO_DB[a].generation);
  const gb = heroGenOrder(HERO_DB[b].generation);
  if (ga !== gb) return ga - gb;
  return a.localeCompare(b);
});

const GEN_BADGE: Record<string, { label: string; bg: string }> = {
  '1': { label: 'S1', bg: 'bg-orange-500' },
  '2': { label: 'S2', bg: 'bg-orange-500' },
  '3': { label: 'S3', bg: 'bg-orange-500' },
  '4': { label: 'S4', bg: 'bg-orange-500' },
  '5': { label: 'S5', bg: 'bg-orange-500' },
  '6': { label: 'S6', bg: 'bg-orange-500' },
  epic: { label: 'Epic', bg: 'bg-purple-600' },
  rare: { label: 'Rare', bg: 'bg-sky-700' },
};

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
  onClick: () => void;
  onToggleOwned: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hero = HERO_DB[name];
  const imgSrc = HERO_IMG[name];
  const genKey = hero.generation !== null ? String(hero.generation) : null;
  const badge = genKey ? GEN_BADGE[genKey] : null;

  return (
    <button
      onClick={onClick}
      title={name}
      className={clsx(
        'flex flex-col w-full rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer bg-gray-900',
        isSelected
          ? 'border-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)] scale-105 z-10'
          : isOwned
          ? 'border-orange-500/50 hover:border-orange-400 hover:scale-[1.04]'
          : 'border-gray-700/60 hover:border-gray-500 hover:scale-[1.02]',
      )}
    >
      {/* ── Badge strip ── */}
      <div className="flex items-center justify-between px-1 py-[3px] bg-gray-950 shrink-0">
        {badge ? (
          <span className={clsx('text-[11px] font-bold px-1 py-[2px] rounded-sm text-white leading-none', badge.bg)}>
            {badge.label}
          </span>
        ) : <span />}
        {/* Point owned — toujours visible, clic indépendant */}
        <span
          role="checkbox"
          aria-checked={isOwned}
          aria-label={isOwned ? 'Retirer' : 'Posséder'}
          onClick={e => { e.stopPropagation(); onToggleOwned(); }}
          className={clsx(
            'w-3 h-3 rounded-full transition-all cursor-pointer',
            isOwned
              ? 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.9)] hover:bg-orange-300'
              : 'bg-gray-700 hover:bg-gray-500 border border-gray-600',
          )}
        />
      </div>

      {/* ── Image (ratio carré, recadrage par le haut) ── */}
      <div className="aspect-square w-full overflow-hidden shrink-0">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={name}
            className={clsx(
              'w-full h-full object-cover object-top',
              !isOwned && 'grayscale opacity-35',
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={clsx('w-full h-full flex items-center justify-center bg-gray-800', !isOwned && 'opacity-35')}>
            <span className="text-xl font-bold text-gray-500">{name[0]}</span>
          </div>
        )}
      </div>

      {/* ── Name strip ── */}
      <div className="bg-gray-950 px-1 py-1 shrink-0">
        <p className="text-xs font-semibold text-white text-center truncate leading-tight">
          {name}
        </p>
      </div>
    </button>
  );
}

// ─── StarIcon — cristal 6 branches cliquables individuellement ────────────────────
function StarIcon({
  index,
  filledCount,
  previewCount,
  onBranchClick,
  onBranchHover,
}: {
  index: number;
  filledCount: number;   // 0–6 branches remplies
  previewCount: number;  // 0–6 branches en preview hover
  onBranchClick: (branch: number) => void;
  onBranchHover: (branch: number | null) => void;
}) {
  const size = 44;
  const c = size / 2;
  const R = size * 0.46;
  const r = size * 0.20;
  const gradId = `cg-${index}`;
  const previewGradId = `cpg-${index}`;

  function branchPath(i: number): string {
    const outerA = (i * 60 - 90) * (Math.PI / 180);
    const leftA  = (i * 60 - 120) * (Math.PI / 180);
    const rightA = (i * 60 - 60) * (Math.PI / 180);
    const ox = c + R * Math.cos(outerA), oy = c + R * Math.sin(outerA);
    const lx = c + r * Math.cos(leftA),  ly = c + r * Math.sin(leftA);
    const rx = c + r * Math.cos(rightA), ry = c + r * Math.sin(rightA);
    return `M ${c},${c} L ${lx},${ly} L ${ox},${oy} L ${rx},${ry} Z`;
  }

  const hasAny = filledCount > 0 || previewCount > 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={previewGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fed7aa" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.75} />
        </linearGradient>
      </defs>
      {Array.from({ length: 6 }, (_, i) => {
        // Anti-clockwise fill order: top(0) → upper-left(5) → lower-left(4) → bottom(3) → lower-right(2) → upper-right(1)
        const rank = (6 - i) % 6; // 0 = first filled, 5 = last
        const isFilled  = rank < filledCount;
        const isPreview = !isFilled && rank < previewCount;
        return (
          <path
            key={i}
            d={branchPath(i)}
            fill={isFilled ? `url(#${gradId})` : isPreview ? `url(#${previewGradId})` : '#1f2937'}
            stroke={isFilled ? '#ea580c' : isPreview ? '#fb923c66' : '#374151'}
            strokeWidth={0.8}
            style={{ cursor: 'pointer', transition: 'fill 80ms' }}
            onClick={() => onBranchClick(rank + 1)}
            onMouseEnter={() => onBranchHover(rank + 1)}
            onMouseLeave={() => onBranchHover(null)}
          />
        );
      })}
      {/* Cercle central */}
      <circle cx={c} cy={c} r={size * 0.08} fill={hasAny ? '#fef3c7' : '#4b5563'} style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

// ─── MiniInput ────────────────────────────────────────────────────────────────
function MiniInput({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const [display, setDisplay] = useState(String(value));
  useEffect(() => setDisplay(String(value)), [value]);
  function commit(raw: string) {
    const v = parseInt(raw, 10);
    if (!isNaN(v)) {
      const clamped = Math.max(0, Math.min(max, v));
      onChange(clamped);
      setDisplay(String(clamped));
    } else {
      setDisplay(String(value));
    }
  }
  return (
    <input
      type="number"
      value={display}
      min={0} max={max} step={1}
      onChange={e => setDisplay(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value); }}
      className="w-full bg-gray-900 border border-gray-700 rounded px-1 py-[3px] text-xs text-white text-center outline-none focus:border-orange-500 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

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
          <span className="text-[11px] text-gray-600 shrink-0 w-5 text-right">Lv</span>
          <MiniInput value={level} onChange={onChangeLevel} max={200} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-600 shrink-0 w-5 text-right">M</span>
          <MiniInput value={mastery} onChange={onChangeMastery} max={20} />
        </div>
      </div>
    </div>
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
  const [hoveredPos, setHoveredPos] = useState<{ star: number; branch: number } | null>(null);

  const total = data.stars * 6 + Math.max(0, data.starSubLevel - 1);

  function handleBranchClick(star: number, branch: number) {
    const clicked = star * 6 + branch;
    const finalTotal = clicked === total ? clicked - 1 : clicked;
    const clamped = Math.max(0, Math.min(30, finalTotal));
    const newStars = Math.floor(clamped / 6);
    const rem = clamped % 6;
    onUpdate({ stars: newStars, starSubLevel: rem === 0 ? 1 : rem + 1 });
  }

  function updateGear(slot: keyof typeof data.gear, field: 'level' | 'masteryLevel', val: number) {
    const g = data.gear[slot];
    onUpdate({ gear: { ...data.gear, [slot]: { ...g, [field]: val } } });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-3 py-2 border-b border-gray-800">
        <div className="min-w-0 pr-2">
          <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
          <p className="text-sm text-gray-500 leading-snug mt-0.5 line-clamp-2">{hero.description}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors mt-0.5"
        >
          <X size={13} />
        </button>
      </div>

      {/* Hero zone : gear gauche | avatar | gear droite */}
      <div className="bg-gray-950 p-2">
        <div className="grid gap-2" style={{ gridTemplateColumns: '100px 1fr 100px' }}>
          {/* Colonne gauche : Helm + Shroud */}
          <div className="flex flex-col justify-around gap-2">
            <GearSlotCard
              label="Helm"
              level={data.gear.helm.level}
              mastery={data.gear.helm.masteryLevel}
              onChangeLevel={v => updateGear('helm', 'level', v)}
              onChangeMastery={v => updateGear('helm', 'masteryLevel', v)}
            />
            <GearSlotCard
              label="Shroud"
              level={data.gear.shroud.level}
              mastery={data.gear.shroud.masteryLevel}
              onChangeLevel={v => updateGear('shroud', 'level', v)}
              onChangeMastery={v => updateGear('shroud', 'masteryLevel', v)}
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
                  <span className="text-3xl font-bold text-gray-600">{name[0]}</span>
                </div>
              )}
            </div>
            {/* Widget centré sous l'avatar */}
            {GX_HEROES.includes(name) && (
              <div className="w-full bg-gray-800 border border-gray-700/60 rounded-lg p-1.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {WIDGET_IMG[name] && (
                    <img
                      src={WIDGET_IMG[name]}
                      alt={`${name} widget`}
                      className="w-7 h-7 rounded object-cover shrink-0"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <p className="text-xs font-bold text-gray-400 uppercase leading-none tracking-wide">
                    {WIDGET_NAME[name] ?? 'Widget'}
                  </p>
                </div>
                <MiniInput
                  value={data.widgetLevel}
                  onChange={v => onUpdate({ widgetLevel: v })}
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
              onChangeLevel={v => updateGear('gloves', 'level', v)}
              onChangeMastery={v => updateGear('gloves', 'masteryLevel', v)}
            />
            <GearSlotCard
              label="Greaves"
              level={data.gear.greaves.level}
              mastery={data.gear.greaves.masteryLevel}
              onChangeLevel={v => updateGear('greaves', 'level', v)}
              onChangeMastery={v => updateGear('greaves', 'masteryLevel', v)}
            />
          </div>
        </div>
      </div>

      {/* Bas : étoiles + niveau */}
      <div className="px-3 py-2.5 space-y-2.5 border-t border-gray-800">
        {/* Étoiles interactives */}
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }, (_, s) => {
            const filledCount  = Math.max(0, Math.min(6, total - s * 6));
            const previewCount = hoveredPos === null ? 0
              : hoveredPos.star > s  ? 6
              : hoveredPos.star === s ? hoveredPos.branch
              : 0;
            return (
              <StarIcon
                key={s}
                index={s}
                filledCount={filledCount}
                previewCount={previewCount}
                onBranchClick={b => handleBranchClick(s, b)}
                onBranchHover={b => setHoveredPos(b !== null ? { star: s, branch: b } : null)}
              />
            );
          })}
        </div>

        {/* Niveau — barre XP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Level</span>
            <span className={clsx(
              'text-sm font-bold tabular-nums px-2 py-0.5 rounded-md',
              data.level === 80
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-orange-400',
            )}>
              {data.level === 80 ? 'MAX' : data.level}
            </span>
          </div>
          {/* Track */}
          <div className="relative h-3 flex items-center">
            {/* Fond */}
            <div className="absolute inset-0 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-150"
                style={{ width: `${((data.level - 1) / 79) * 100}%` }}
              />
            </div>
            {/* Crans aux paliers 20/40/60/80 */}
            {[20, 40, 60].map(tick => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px bg-gray-950/60 pointer-events-none"
                style={{ left: `${((tick - 1) / 79) * 100}%` }}
              />
            ))}
            {/* Slider natif invisible par-dessus */}
            <input
              type="range"
              min={1} max={80} step={1}
              value={data.level}
              onChange={e => onUpdate({ level: parseInt(e.target.value, 10) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              aria-label="Hero level"
            />
          </div>
          {/* Légende */}
          <div className="flex justify-between text-[10px] text-gray-700 select-none px-0.5">
            <span>1</span><span>20</span><span>40</span><span>60</span><span>80</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterClass = 'all' | 'inf' | 'cav' | 'arc';
type FilterGen   = 'all' | '1' | '2' | '3' | '4' | '5' | 'epic' | 'rare';

const CLASS_GROUP_LABEL: Record<Exclude<FilterClass, 'all'>, string> = {
  inf: 'Infantry', cav: 'Cavalry', arc: 'Archers',
};

const CLASS_FILTERS: { id: FilterClass; label: string; idle: string; active: string }[] = [
  { id: 'all', label: 'All',      idle: 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/60', active: 'bg-gray-600 text-white' },
  { id: 'inf', label: 'Infantry', idle: 'text-red-400/70   hover:text-red-300   hover:bg-red-950/60',    active: 'bg-red-700    text-white' },
  { id: 'cav', label: 'Cavalry',  idle: 'text-yellow-400/70 hover:text-yellow-300 hover:bg-yellow-950/60', active: 'bg-yellow-600 text-gray-950' },
  { id: 'arc', label: 'Archers',  idle: 'text-blue-400/70  hover:text-blue-300   hover:bg-blue-950/60',   active: 'bg-blue-600   text-white' },
];

const GEN_FILTERS: { id: FilterGen; label: string; idle: string; active: string }[] = [
  { id: 'all',  label: 'All',  idle: 'text-gray-400     hover:text-gray-200   hover:bg-gray-700/60',    active: 'bg-gray-600   text-white' },
  { id: '1',    label: 'S1',   idle: 'text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60', active: 'bg-orange-500 text-white' },
  { id: '2',    label: 'S2',   idle: 'text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60', active: 'bg-orange-500 text-white' },
  { id: '3',    label: 'S3',   idle: 'text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60', active: 'bg-orange-500 text-white' },
  { id: '4',    label: 'S4',   idle: 'text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60', active: 'bg-orange-500 text-white' },
  { id: '5',    label: 'S5',   idle: 'text-orange-400/80 hover:text-orange-300 hover:bg-orange-950/60', active: 'bg-orange-500 text-white' },
  { id: 'epic', label: 'Epic', idle: 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-950/60', active: 'bg-purple-600 text-white' },
  { id: 'rare', label: 'Rare', idle: 'text-sky-400/80    hover:text-sky-300    hover:bg-sky-950/60',    active: 'bg-sky-600    text-white' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export function HeroRoster({
  selectedHero,
  setSelectedHero,
}: {
  selectedHero: HeroName | null;
  setSelectedHero: (hero: HeroName | null) => void;
}) {
  const activeProfile = useRallyStore(s => s.activeProfile);
  const updateProfile  = useRallyStore(s => s.updateProfile);
  const [filterClass, setFilterClass] = useState<FilterClass>('all');
  const [filterGen,   setFilterGen]   = useState<FilterGen>('all');
  const [gridKey,     setGridKey]     = useState(0);
  const [exiting,     setExiting]     = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function applyFilter(fn: () => void) {
    setExiting(true);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      fn();
      setGridKey(k => k + 1);
      setExiting(false);
    }, 140);
  }

  if (!activeProfile) return null;

  const ownedHeroes = activeProfile.ownedHeroes ?? {};

  function getHeroData(name: HeroName): OwnedHeroData {
    return ownedHeroes[name] ?? defaultOwnedHeroData();
  }

  function toggleOwned(name: HeroName) {
    const data = getHeroData(name);
    updateProfile({ ownedHeroes: { ...ownedHeroes, [name]: { ...data, owned: !data.owned } } });
  }

  function handleCardClick(name: HeroName) {
    const data = getHeroData(name);
    if (!data.owned) {
      updateProfile({ ownedHeroes: { ...ownedHeroes, [name]: { ...data, owned: true, stars: 0, starSubLevel: 2 } } });
    }
    setSelectedHero(selectedHero === name ? null : name);
  }

  const filterByGen = (name: HeroName) => {
    if (filterGen === 'all') return true;
    const gen = HERO_DB[name].generation;
    if (filterGen === 'epic') return gen === 'epic';
    if (filterGen === 'rare') return gen === 'rare';
    return String(gen) === filterGen;
  };

  const filteredGroups = filterClass === 'all'
    ? (() => {
        const heroes = ALL_HEROES_SORTED.filter(filterByGen);
        return heroes.length > 0 ? [{ label: '', accent: '', heroes }] : [];
      })()
    : HERO_GROUPS
        .filter(g => g.label === CLASS_GROUP_LABEL[filterClass])
        .map(g => ({
          ...g,
          heroes: g.heroes
            .filter(filterByGen)
            .sort((a, b) => {
              const ga = heroGenOrder(HERO_DB[a].generation);
              const gb = heroGenOrder(HERO_DB[b].generation);
              if (ga !== gb) return ga - gb;
              return a.localeCompare(b);
            }),
        }))
        .filter(g => g.heroes.length > 0);

  const filteredHeroes = filteredGroups.flatMap(g => g.heroes);
  const allOwned = filteredHeroes.length > 0 && filteredHeroes.every(n => getHeroData(n).owned);

  function toggleAllOwned() {
    const patch: typeof ownedHeroes = { ...ownedHeroes };
    for (const name of filteredHeroes) {
      patch[name] = { ...(patch[name] ?? defaultOwnedHeroData()), owned: !allOwned };
    }
    updateProfile({ ownedHeroes: patch });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Filter bar ── outside the scroll container so no stacking conflict */}
      <div className="relative z-20 bg-gray-900 rounded-lg border border-gray-800 p-2 space-y-2 shrink-0">
        {/* Tooltip — far right of the whole filter block */}
        <div className="absolute top-3 right-2 z-30">
          <Tooltip text="Click a hero to select it and configure its details.">
            <span
              className="text-gray-600 hover:text-gray-400 cursor-default transition-colors"
              aria-label="Click a hero to select it and configure its details."
            >
              <Info size={12} />
            </span>
          </Tooltip>
        </div>
        {/* Class row */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest w-16 shrink-0">Class</span>
          <SlideFilterBar
            filters={CLASS_FILTERS}
            active={filterClass}
            onChange={id => applyFilter(() => setFilterClass(id))}
          />
        </div>
        {/* Divider */}
        <div className="border-t border-gray-800" />
        {/* Gen row */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest w-16 shrink-0">Season</span>
          <SlideFilterBar
            filters={GEN_FILTERS}
            active={filterGen}
            onChange={id => applyFilter(() => setFilterGen(id))}
          />
        </div>
      </div>

      {/* ── Hero grid (scrollable) ── */}
      <div className="relative h-[480px]">
        {/* Floating select all button — absolute over the grid */}
        {filteredHeroes.length > 0 && (
          <button
            onClick={toggleAllOwned}
            className={clsx(
              'absolute bottom-3 right-5 z-10 px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm',
              allOwned
                ? 'bg-orange-950/90 border border-orange-500/70 text-orange-300 hover:bg-orange-900/90'
                : 'bg-gray-950/95 border border-orange-500/50 text-orange-400 hover:bg-orange-950/80 hover:border-orange-400/70',
            )}
          >
            {allOwned ? 'Deselect all' : 'Select all'}
          </button>
        )}
      <div className="overflow-y-auto h-full px-1.5 -mx-1.5 pt-1.5 space-y-3">
        <div
          key={gridKey}
          className={exiting ? 'hero-grid-exit' : 'hero-grid-enter'}
        >
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div key={group.label || '__all__'} className="mb-3">
              {group.label && (
                <p className={clsx('text-[13px] font-bold uppercase tracking-widest mb-2', group.accent)}>
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {group.heroes.map((name, i) => (
                  <div
                    key={name}
                    className="hero-grid-enter"
                    style={{ animationDelay: exiting ? '0ms' : `${i * 22}ms` }}
                  >
                    <HeroCard
                      name={name}
                      isOwned={getHeroData(name).owned}
                      isSelected={selectedHero === name}
                      onClick={() => handleCardClick(name)}
                      onToggleOwned={() => toggleOwned(name)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 text-center py-6">No heroes match this filter</p>
        )}

        </div>
      </div>
      </div>
    </div>
  );
}
