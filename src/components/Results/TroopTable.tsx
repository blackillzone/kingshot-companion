import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard } from '../ui';
import { Table } from 'lucide-react';
import { formatTroops } from '../../lib/formulas';
import clsx from 'clsx';

export function TroopTable() {
  const result = useRallyStore(s => s.result);
  const config = useRallyStore(s => s.rallyConfig);

  if (!result) return null;

  const { distribution, ratio } = result;

  // Color code deviation from optimal
  const deviation = (actual: number, optimal: number): string => {
    const diff = Math.abs(actual - optimal);
    if (diff < 0.05) return 'text-green-400';
    if (diff < 0.15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const troopePerP = Math.floor(config.capacity / config.participants);
  const infRatio = distribution.inf / troopePerP;
  const cavRatio = distribution.cav / troopePerP;
  const arcRatio = distribution.arc / troopePerP;

  const rows = [
    {
      type: 'Infantry',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-500',
      perParticipant: distribution.inf,
      total: distribution.totalInf,
      optimalPct: ratio.inf,
      actualPct: infRatio,
    },
    {
      type: 'Cavalry',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-500',
      perParticipant: distribution.cav,
      total: distribution.totalCav,
      optimalPct: ratio.cav,
      actualPct: cavRatio,
    },
    {
      type: 'Archery',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      dot: 'bg-green-500',
      perParticipant: distribution.arc,
      total: distribution.totalArc,
      optimalPct: ratio.arc,
      actualPct: arcRatio,
    },
  ];

  return (
    <SectionCard title="Troop Distribution" icon={<Table size={15} />}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-800">
              <th className="text-left pb-2 font-medium">Type</th>
              <th className="text-right pb-2 font-medium">Optimal %</th>
              <th className="text-right pb-2 font-medium">Per Participant</th>
              <th className="text-right pb-2 font-medium">Total in Rally</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map(row => (
              <tr key={row.type}>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2 h-2 rounded-full shrink-0', row.dot)} />
                    <span className="text-gray-200 font-medium">{row.type}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <span className={clsx('font-mono text-xs px-1.5 py-0.5 rounded border', row.color)}>
                    {(row.optimalPct * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span className={clsx('font-mono font-semibold', deviation(row.actualPct, row.optimalPct))}>
                    {row.perParticipant.toLocaleString()}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-gray-400">
                  {formatTroops(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-700 text-gray-400 font-medium">
              <td className="pt-2.5 text-xs">Total</td>
              <td className="pt-2.5 text-right text-xs">100%</td>
              <td className="pt-2.5 text-right font-mono text-white">
                {distribution.troopsPerParticipant.toLocaleString()}
              </td>
              <td className="pt-2.5 text-right font-mono">
                {formatTroops(distribution.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-600 mt-3">
        Rounded to nearest 100. Archery takes the remainder to fill exactly.
        Colors: <span className="text-green-400">●</span> optimal &nbsp;
        <span className="text-yellow-400">●</span> &lt;15% deviation &nbsp;
        <span className="text-red-400">●</span> &gt;15% deviation
      </p>
    </SectionCard>
  );
}
