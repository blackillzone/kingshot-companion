import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard, Field, NumberInput, Select } from '../ui';
import { LEAD_INF_HEROES, LEAD_CAV_HEROES, LEAD_ARC_HEROES, HERO_DB } from '../../lib/heroes';
import type { HeroName, TroopTier, TGLevel, TroopStats, WidgetStats, WidgetLevels } from '../../types';
import { HeroSelect } from './HeroSelect';
import { Sword, Shield, Crosshair, Zap } from 'lucide-react';

const TIER_OPTIONS: { value: TroopTier; label: string }[] = [
  { value: 'T1-T6', label: 'T1 – T6' },
  { value: 'T7-T9', label: 'T7 – T9' },
  { value: 'T10', label: 'T10' },
  { value: 'T11', label: 'T11' },
];

const TG_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: i as TGLevel,
  label: i === 0 ? 'No TG' : `TG ${i}`,
})) as { value: TGLevel; label: string }[];

// Expedition skill bonus % indexed by widget level (0 = not owned)
// Even levels unlock new steps: lv2→5%, lv4→7.5%, lv6→10%, lv8→12.5%, lv10→15%
const WIDGET_BONUS_BY_LEVEL = [0, 0, 5, 5, 7.5, 7.5, 10, 10, 12.5, 12.5, 15];

const WIDGET_LEVEL_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Not owned' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `Level ${i + 1} — ${WIDGET_BONUS_BY_LEVEL[i + 1]}%`,
  })),
];

// ─── Widget cell (select or disabled placeholder) ─────────────────────────────

function WidgetCell({
  widgetEffect, widgetLevel, onWidgetLevelChange,
}: {
  widgetEffect: 'rally_atk' | 'rally_let' | 'none';
  widgetLevel: number;
  onWidgetLevelChange: (l: number) => void;
}) {
  if (widgetEffect !== 'none') {
    const label = widgetEffect === 'rally_atk' ? 'Widget ATK' : 'Widget LET';
    const hint  = widgetEffect === 'rally_atk'
      ? 'Exclusive gear expedition bonus (Rally Attack)'
      : 'Exclusive gear expedition bonus (Rally Lethality)';
    return (
      <Field label={label} hint={hint}>
        <Select<number>
          value={widgetLevel}
          onChange={onWidgetLevelChange}
          options={WIDGET_LEVEL_OPTIONS}
        />
      </Field>
    );
  }
  return (
    <Field label="Widget" hint="No exclusive gear expedition skill for rally on this hero">
      <Select<string>
        value="none"
        onChange={() => {}}
        options={[{ value: 'none', label: '— No rally widget —' }]}
        className="opacity-40 cursor-not-allowed pointer-events-none"
      />
    </Field>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StatsForm() {
  const activeProfile = useRallyStore(s => s.activeProfile);
  const updateProfile = useRallyStore(s => s.updateProfile);

  if (!activeProfile) return null;

  const { stats, widgets, widget_levels, heroes, troop_tier, tg_level: tgLevel } = activeProfile;
  const wl: WidgetLevels = widget_levels ?? { inf: 0, cav: 0, arc: 0 };

  const handleStatChange = (key: keyof TroopStats, v: number) => {
    updateProfile({ stats: { ...stats, [key]: v } });
  };

  const handleWidgetLevelChange = (type: 'inf' | 'cav' | 'arc', level: number) => {
    const effect = HERO_DB[heroes[type]]?.widget_effect ?? 'none';
    const bonus = WIDGET_BONUS_BY_LEVEL[level] ?? 0;
    const widgetUpdate: Partial<WidgetStats> = {};
    if (effect === 'rally_atk') widgetUpdate[`${type}_atk` as keyof WidgetStats] = bonus;
    if (effect === 'rally_let') widgetUpdate[`${type}_let` as keyof WidgetStats] = bonus;
    updateProfile({
      widget_levels: { ...wl, [type]: level },
      widgets: { ...widgets, ...widgetUpdate },
    });
  };

  const handleHeroChange = (type: 'inf' | 'cav' | 'arc', v: HeroName) => {
    const effect = HERO_DB[v]?.widget_effect ?? 'none';
    const atkKey = `${type}_atk` as keyof WidgetStats;
    const letKey = `${type}_let` as keyof WidgetStats;
    const widgetUpdate: Partial<WidgetStats> = {};
    if (effect !== 'rally_atk') widgetUpdate[atkKey] = 0;
    if (effect !== 'rally_let') widgetUpdate[letKey] = 0;
    updateProfile({
      heroes: { ...heroes, [type]: v },
      widgets: { ...widgets, ...widgetUpdate },
      widget_levels: { ...wl, [type]: 0 },
    });
  };

  const infEffect = HERO_DB[heroes.inf]?.widget_effect ?? 'none';
  const cavEffect = HERO_DB[heroes.cav]?.widget_effect ?? 'none';
  const arcEffect = HERO_DB[heroes.arc]?.widget_effect ?? 'none';

  return (
    <div className="space-y-4">
      {/* Player name */}
      <SectionCard title="Rally Leader Stats" icon={<Zap size={15} />}>
        <div className="space-y-2 mb-4">
          <Field label="Player name">
            <input
              type="text"
              value={activeProfile.name}
              onChange={e => updateProfile({ name: e.target.value })}
              placeholder="Your in-game name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors"
            />
          </Field>
          <p className="text-xs text-gray-500 italic">
            Tip: Run a <strong className="text-gray-400">Terror rally</strong> with your bear setup and read ATK/LET stats from the battle report.
          </p>
        </div>

        {/* 5-row × 3-col grid — each row aligns across all troop types */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-2">

          {/* Row 1 — Section headers */}
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 pb-1">
            <Sword size={14} />Infantry
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 pb-1">
            <Shield size={14} />Cavalry
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-400 pb-1">
            <Crosshair size={14} />Archery
          </div>

          {/* Row 2 — Attack % */}
          <Field label="Attack %" hint="ATK% bonus from your stats">
            <NumberInput value={stats.inf_atk} onChange={v => handleStatChange('inf_atk', v)} suffix="%" min={0} max={5000} />
          </Field>
          <Field label="Attack %" hint="ATK% bonus from your stats">
            <NumberInput value={stats.cav_atk} onChange={v => handleStatChange('cav_atk', v)} suffix="%" min={0} max={5000} />
          </Field>
          <Field label="Attack %" hint="ATK% bonus from your stats">
            <NumberInput value={stats.arc_atk} onChange={v => handleStatChange('arc_atk', v)} suffix="%" min={0} max={5000} />
          </Field>

          {/* Row 3 — Lethality % */}
          <Field label="Lethality %" hint="LET% bonus from your stats">
            <NumberInput value={stats.inf_let} onChange={v => handleStatChange('inf_let', v)} suffix="%" min={0} max={5000} />
          </Field>
          <Field label="Lethality %" hint="LET% bonus from your stats">
            <NumberInput value={stats.cav_let} onChange={v => handleStatChange('cav_let', v)} suffix="%" min={0} max={5000} />
          </Field>
          <Field label="Lethality %" hint="LET% bonus from your stats">
            <NumberInput value={stats.arc_let} onChange={v => handleStatChange('arc_let', v)} suffix="%" min={0} max={5000} />
          </Field>

          {/* Row 4 — Widget */}
          <WidgetCell widgetEffect={infEffect} widgetLevel={wl.inf} onWidgetLevelChange={l => handleWidgetLevelChange('inf', l)} />
          <WidgetCell widgetEffect={cavEffect} widgetLevel={wl.cav} onWidgetLevelChange={l => handleWidgetLevelChange('cav', l)} />
          <WidgetCell widgetEffect={arcEffect} widgetLevel={wl.arc} onWidgetLevelChange={l => handleWidgetLevelChange('arc', l)} />

          {/* Row 5 — Lead Hero */}
          <Field label="Lead Hero">
            <HeroSelect value={heroes.inf} onChange={v => handleHeroChange('inf', v)} options={LEAD_INF_HEROES} />
          </Field>
          <Field label="Lead Hero">
            <HeroSelect value={heroes.cav} onChange={v => handleHeroChange('cav', v)} options={LEAD_CAV_HEROES} />
          </Field>
          <Field label="Lead Hero">
            <HeroSelect value={heroes.arc} onChange={v => handleHeroChange('arc', v)} options={LEAD_ARC_HEROES} />
          </Field>

        </div>

        {/* Troop tier */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-800">
          <Field label="Troop Tier" hint="Impacts the archer damage multiplier for T7+ with TG3+">
            <Select<TroopTier>
              value={troop_tier}
              onChange={v => updateProfile({ troop_tier: v })}
              options={TIER_OPTIONS}
            />
          </Field>
          <Field label="TG Level" hint="Gilded level (TG3+ with T7+ gives extra archer bonus)">
            <Select<TGLevel>
              value={tgLevel}
              onChange={v => updateProfile({ tg_level: v as TGLevel })}
              options={TG_OPTIONS}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
