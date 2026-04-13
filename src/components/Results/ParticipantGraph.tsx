import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard, Field } from '../ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { computeParticipantCurve, formatTroops } from '../../lib/formulas';
import { TrendingUp } from 'lucide-react';

export function ParticipantGraph() {
  const activeProfile = useRallyStore(s => s.activeProfile);
  const config = useRallyStore(s => s.rallyConfig);
  const setRallyConfig = useRallyStore(s => s.setRallyConfig);

  if (!activeProfile) return null;

  const data = computeParticipantCurve(
    activeProfile.stats,
    activeProfile.widgets,
    activeProfile.troop_tier,
    activeProfile.tg_level,
    config.capacity,
    config.joiners
  );

  // Normalize for display
  const maxScore = Math.max(...data.map(d => d.damageScore));
  const normalized = data.map(d => ({
    ...d,
    normalizedScore: (d.damageScore / maxScore) * 100,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof normalized[0] }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-xs shadow-xl">
        <p className="text-gray-300 font-semibold mb-1">{d.participants} participant{d.participants > 1 ? 's' : ''}</p>
        <p className="text-orange-400">Score: {d.normalizedScore.toFixed(1)}%</p>
        <p className="text-gray-400">Troops/player: {formatTroops(d.troopsPerParticipant)}</p>
        <p className="text-gray-400">Rally fill: {(d.fillRate * 100).toFixed(1)}%</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SectionCard title="Damage vs Participant Count" icon={<TrendingUp size={15} />}>
        <p className="text-xs text-gray-500 mb-4">
          More participants = more total troops = higher damage. But fewer participants = more troops per player.
          This graph shows the <strong className="text-gray-400">total estimated damage</strong> for each participant count,
          assuming the rally is filled with the optimal ratio.
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalized} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="participants"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                label={{ value: 'Participants', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={v => `${v.toFixed(0)}%`}
                domain={[0, 105]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={config.participants}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{ value: 'current', fill: '#f97316', fontSize: 10, position: 'top' }}
              />
              <Bar dataKey="normalizedScore" radius={[3, 3, 0, 0]}>
                {normalized.map(entry => (
                  <Cell
                    key={entry.participants}
                    fill={entry.participants === config.participants ? '#f97316' : '#374151'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick select */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <Field label="Set participants from graph">
            <div className="flex flex-wrap gap-1.5">
              {[5, 8, 10, 12, 15].map(n => (
                <button
                  key={n}
                  onClick={() => setRallyConfig({ participants: n })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    config.participants === n
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Summary table */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[5, 8, 10, 12, 15].map(n => {
            const d = normalized.find(row => row.participants === n);
            if (!d) return null;
            return (
              <button
                key={n}
                onClick={() => setRallyConfig({ participants: n })}
                className={`text-center rounded-lg p-2 border transition-colors cursor-pointer ${
                  config.participants === n
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <p className="text-xs text-gray-500">{n} players</p>
                <p className="text-lg font-bold text-orange-400">{d.normalizedScore.toFixed(0)}%</p>
                <p className="text-xs text-gray-500">{formatTroops(d.troopsPerParticipant)}/ea</p>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
