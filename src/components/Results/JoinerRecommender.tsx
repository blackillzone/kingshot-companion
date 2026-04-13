import { useMemo } from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { useRallyStore, selectStats, selectWidgets, selectTier, selectTG } from '../../store/useRallyStore';
import { SectionCard } from '../ui';
import { computeDamageScore, computeOptimalRatio } from '../../lib/formulas';
import { HERO_DB } from '../../lib/heroes';
import type { HeroName, JoinerSlot } from '../../types';

// ─── Candidate pool ────────────────────────────────────────────────────────────
const CANDIDATES: HeroName[] = ['Amane', 'Chenko', 'Yeonwoo', 'Amadeus'];

const TOP_N = 3;

// ─── Generate combinations with repetition ────────────────────────────────────
function combinationsWithRepetition<T>(pool: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (pool.length === 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < pool.length; i++) {
    const sub = combinationsWithRepetition(pool.slice(i), k - 1);
    for (const s of sub) result.push([pool[i], ...s]);
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function JoinerRecommender() {
  const stats = useRallyStore(selectStats);
  const widgets = useRallyStore(selectWidgets);
  const tier = useRallyStore(selectTier);
  const tg = useRallyStore(selectTG);
  const config = useRallyStore(s => s.rallyConfig);
  const setJoiner = useRallyStore(s => s.setJoiner);

  const recommendations = useMemo(() => {
    const combos = combinationsWithRepetition(CANDIDATES, 4);
    const scored = combos.map(combo => {
      const joiners: JoinerSlot[] = combo.map(hero => ({ hero, skillLevel: 5 }));
      const ratio = computeOptimalRatio(stats, widgets, tier, tg, joiners);
      const score = computeDamageScore(stats, widgets, ratio, tier, tg, joiners);

      // Compute bonus profile for deduplication
      let totalAtk = 0, totalLet = 0;
      for (const j of joiners) {
        const h = HERO_DB[j.hero];
        const b = h.skill_bonuses[j.skillLevel - 1];
        if (h.bonus_type === 'atk_all') totalAtk += b;
        if (h.bonus_type === 'let_all') totalLet += b;
      }
      return { combo, joiners, score, totalAtk, totalLet };
    });

    scored.sort((a, b) => b.score - a.score);

    // Keep only one representative per unique (ATK, LET) bonus profile
    const seen = new Set<string>();
    const unique = scored.filter(r => {
      const key = `${r.totalAtk}-${r.totalLet}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const best = unique[0]?.score ?? 1;
    return unique.slice(0, TOP_N).map(r => ({
      ...r,
      pct: best > 0 ? (r.score / best) * 100 : 100,
    }));
  }, [stats, widgets, tier, tg]);

  // Score of the current joiner selection
  const currentScore = useMemo(() => {
    const ratio = computeOptimalRatio(stats, widgets, tier, tg, config.joiners);
    return computeDamageScore(stats, widgets, ratio, tier, tg, config.joiners);
  }, [stats, widgets, tier, tg, config.joiners]);

  const bestScore = recommendations[0]?.score ?? 1;
  const currentPct = bestScore > 0 ? (currentScore / bestScore) * 100 : 100;

  // Sorted hero list of the current selection for comparison
  const currentHeroesSorted = [...config.joiners.map(j => j.hero)].sort();

  function isSelectedCombo(combo: HeroName[]) {
    const sorted = [...combo].sort();
    return sorted.every((h, i) => h === currentHeroesSorted[i]);
  }

  function applyCombo(joiners: JoinerSlot[]) {
    ([0, 1, 2, 3] as const).forEach(i => setJoiner(i, joiners[i]));
  }

  return (
    <SectionCard title="Joiner Recommendations" icon={<Lightbulb size={15} />}>
      <p className="text-xs text-gray-500 mb-3">
        Best combinations from {CANDIDATES.join(', ')}, ranked by predicted damage.
        Click a row to apply it.
      </p>

      {/* Current selection indicator */}
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
        <TrendingUp size={13} className="text-orange-400 shrink-0" />
        <span>
          Your current selection:{' '}
          <strong className={currentPct >= 99 ? 'text-green-400' : currentPct >= 95 ? 'text-yellow-400' : 'text-red-400'}>
            {currentPct.toFixed(1)}%
          </strong>{' '}
          of optimal
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, idx) => {
          const label = rec.combo
            .reduce<Record<string, number>>((acc, h) => ({ ...acc, [h]: (acc[h] ?? 0) + 1 }), {});
          const labelStr = Object.entries(label)
            .map(([h, n]) => (n > 1 ? `${n}× ${h}` : h))
            .join(' + ');

          const bonusParts: string[] = [];
          if (rec.totalAtk > 0) bonusParts.push(`+${rec.totalAtk}% ATK`);
          if (rec.totalLet > 0) bonusParts.push(`+${rec.totalLet}% LET`);

          const isSelected = isSelectedCombo(rec.combo);
          const isTop = idx === 0 && !isSelected;

          return (
            <div
              key={idx}
              onClick={() => applyCombo(rec.joiners)}
              className={`cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 border text-xs transition-colors ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/15 ring-1 ring-orange-500/30'
                  : isTop
                  ? 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <span className={`font-bold w-5 text-center shrink-0 ${isSelected || idx === 0 ? 'text-orange-400' : 'text-gray-500'}`}>
                #{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isSelected || idx === 0 ? 'text-white' : 'text-gray-300'}`}>{labelStr}</p>
                {bonusParts.length > 0 && (
                  <p className="text-gray-500">{bonusParts.join(' · ')}</p>
                )}
              </div>
              <span className={`shrink-0 font-semibold ${isSelected ? 'text-orange-400' : idx === 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                {rec.pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-600">
        * Rankings use max skill level (5). Adjust levels in the Joiner Heroes section for exact scores.
      </p>
    </SectionCard>
  );
}
