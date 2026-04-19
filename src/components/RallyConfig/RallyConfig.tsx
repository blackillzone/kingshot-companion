import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard, Field, NumberInput, Select } from '../ui';
import { JOINER_HEROES, HERO_DB } from '../../lib/heroes';
import type { HeroName, SkillLevel } from '../../types';
import { Users, Target, UserPlus } from 'lucide-react';

const BEAR_LEVELS = [0, 1, 2, 3, 4, 5] as const;

const JOINER_OPTIONS = JOINER_HEROES.map(n => ({ value: n, label: n === 'None' ? '— None —' : n }));
const SKILL_LEVEL_OPTIONS = ([1, 2, 3, 4, 5] as SkillLevel[]).map(l => ({
  value: l,
  label: `Lv ${l}${l === 5 ? ' (max)' : ''}`,
}));

export function RallyConfig() {
  const config = useRallyStore(s => s.rallyConfig);
  const setRallyConfig = useRallyStore(s => s.setRallyConfig);
  const setJoiner = useRallyStore(s => s.setJoiner);

  return (
    <div className="space-y-4">
      <SectionCard title="Rally Configuration" icon={<Target size={15} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Rally Capacity"
            hint="Total number of troops the rally can hold (your march size / capacity)"
          >
            <NumberInput
              value={config.capacity}
              onChange={v => setRallyConfig({ capacity: Math.max(1000, Math.round(v)) })}
              min={10_000}
              max={50_000_000}
              step={100_000}
            />
          </Field>

          <Field
            label="Participants"
            hint="Number of players joining the rally (equal troop split)"
          >
            <div className="space-y-1">
              <input
                type="range"
                min={1}
                max={15}
                value={config.participants}
                onChange={e => setRallyConfig({ participants: parseInt(e.target.value, 10) })}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span className="text-orange-400 font-bold text-sm">{config.participants}</span>
                <span>15</span>
              </div>
            </div>
          </Field>

          <Field
            label="Bear Trap Level"
            hint="Level 5 is standard for well-developed alliances"
          >
            <Select<0 | 1 | 2 | 3 | 4 | 5>
              value={config.bearLevel}
              onChange={v => setRallyConfig({ bearLevel: v as 0 | 1 | 2 | 3 | 4 | 5 })}
              options={BEAR_LEVELS.map(l => ({
                value: l as 0 | 1 | 2 | 3 | 4 | 5,
                label: l === 5 ? `Level ${l} (recommended)` : `Level ${l}`,
              }))}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Joiner Heroes" icon={<UserPlus size={15} />}>
        <p className="text-xs text-gray-500 mb-3">
          Joiner heroes provide passive bonuses to <strong className="text-gray-400">all troops</strong>.
          Select each hero and their skill level. Recommended: Amane + Chenko + Yeonwoo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {([0, 1, 2, 3] as const).map(slot => {
            const joiner = config.joiners[slot];
            const heroData = HERO_DB[joiner.hero];
            const bonus = heroData.skill_bonuses[joiner.skillLevel - 1];
            const hasBonus = bonus > 0;
            const bonusLabel =
              heroData.bonus_type === 'atk_all' ? `+${bonus}% ATK (all)` :
              heroData.bonus_type === 'let_all' ? `+${bonus}% LET (all)` :
              'No modeled effect';
            return (
              <div key={slot} className="space-y-1.5">
                <Field label={`Joiner ${slot + 1}`}>
                  <Select<HeroName>
                    value={joiner.hero}
                    onChange={v => setJoiner(slot, { hero: v })}
                    options={JOINER_OPTIONS}
                  />
                </Field>
                {joiner.hero !== 'None' && (
                  <div className="space-y-1">
                    <Select<SkillLevel>
                      value={joiner.skillLevel}
                      onChange={v => setJoiner(slot, { skillLevel: v })}
                      options={SKILL_LEVEL_OPTIONS}
                    />
                    <p className={`text-xs px-1 ${hasBonus ? 'text-green-400' : 'text-gray-500'}`}>
                      {bonusLabel}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Users size={13} className="text-gray-500" />
          <span className="text-xs text-gray-500">
            Troops per participant:{' '}
            <strong className="text-gray-300">
              {Math.floor(config.capacity / config.participants).toLocaleString()}
            </strong>
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
