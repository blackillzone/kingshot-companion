import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { HERO_DB } from '../../lib/heroes';
import type { HeroName } from '../../types';

// ─── Generation badge config ──────────────────────────────────────────────────

type HeroGen = number | 'epic' | 'rare' | null;

// All G-badges → orange / Epic → violet / Rare → blue
const GEN_CONFIG: Record<string, { label: string; cls: string }> = {
  '1': { label: 'G1', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  '2': { label: 'G2', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  '3': { label: 'G3', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  '4': { label: 'G4', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  '5': { label: 'G5', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  '6': { label: 'G6', cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40' },
  epic: { label: 'Epic', cls: 'bg-violet-500/20 text-violet-300 border border-violet-500/40' },
  rare: { label: 'Rare', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
};

function GenBadge({ gen }: { gen: HeroGen }) {
  if (gen === null) return <span className="w-9 shrink-0" />;
  const key = typeof gen === 'number' ? String(gen) : gen;
  const cfg = GEN_CONFIG[key];
  if (!cfg) return <span className="w-9 shrink-0" />;
  return (
    <span
      className={`inline-flex w-9 shrink-0 items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold leading-none ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface HeroSelectProps {
  value: HeroName;
  onChange: (v: HeroName) => void;
  options: HeroName[];
}

export function HeroSelect({ value, onChange, options }: HeroSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    // Use click (not mousedown) so the underlying button's click fires first
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selectedGen: HeroGen = HERO_DB[value]?.generation ?? null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors cursor-pointer hover:border-gray-600"
      >
        <span className="flex items-center gap-2 min-w-0">
          <GenBadge gen={selectedGen} />
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel — absolutely positioned, no portal needed */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-[9999]"
          style={{ backgroundColor: '#1e2330' }}
        >
          <div className="max-h-56 overflow-y-auto">
            {options.map(name => {
              const gen: HeroGen = HERO_DB[name]?.generation ?? null;
              const isSelected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                    isSelected
                      ? 'bg-orange-500/15 text-orange-400'
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <GenBadge gen={gen} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

