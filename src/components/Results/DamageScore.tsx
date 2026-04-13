import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard } from '../ui';
import { Zap } from 'lucide-react';
import clsx from 'clsx';

export function DamageScore() {
  const result = useRallyStore(s => s.result);
  const config = useRallyStore(s => s.rallyConfig);

  if (!result) return null;

  const { damageScore, naiveScore, maxScore } = result;

  // Normalize scores relative to max for display bars
  const norm = (v: number) => Math.min(100, (v / maxScore) * 100);

  const improvement = ((damageScore - naiveScore) / naiveScore) * 100;

  const bars = [
    {
      label: 'Optimal (your ratio)',
      value: damageScore,
      pct: norm(damageScore),
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
    },
    {
      label: 'Equal split (33/33/33)',
      value: naiveScore,
      pct: norm(naiveScore),
      color: 'bg-gray-500',
      textColor: 'text-gray-400',
    },
  ];

  return (
    <SectionCard title="Estimated Damage Score" icon={<Zap size={15} />}>
      <div className="space-y-4">
        {/* Improvement callout */}
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3">
          <Zap size={16} className="text-orange-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-400">
              +{improvement.toFixed(1)}% damage vs equal split
            </p>
            <p className="text-xs text-gray-400">
              Optimal ratio is {improvement > 0 ? 'better' : 'equal to'} a naive 33/33/33 split for your stats.
            </p>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          {bars.map(bar => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{bar.label}</span>
                <span className={clsx('text-xs font-mono font-semibold', bar.textColor)}>
                  {bar.value.toFixed(3)}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={clsx('h-2 rounded-full transition-all duration-700', bar.color)}
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rally fill info */}
        <div className="text-xs text-gray-500 border-t border-gray-800 pt-3 flex items-center justify-between">
          <span>
            Rally capacity: <strong className="text-gray-300">{config.capacity.toLocaleString()}</strong>
          </span>
          <span>
            Participants: <strong className="text-gray-300">{config.participants}</strong>
          </span>
          <span>
            Fill: <strong className="text-gray-300">
              {((Math.floor(config.capacity / config.participants) * config.participants / config.capacity) * 100).toFixed(1)}%
            </strong>
          </span>
        </div>

        <p className="text-xs text-gray-600 italic">
          Score is relative and proportional to the damage formula. Absolute damage depends on rally size and base attack stats.
        </p>
      </div>
    </SectionCard>
  );
}
