import { useRallyStore } from '../../store/useRallyStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { SectionCard } from '../ui';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = {
  Infantry: '#3b82f6',   // blue
  Cavalry: '#a855f7',    // purple
  Archery: '#22c55e',    // green
};

export function OptimalRatioPie() {
  const result = useRallyStore(s => s.result);

  if (!result) return null;

  const { ratio } = result;

  const data = [
    { name: 'Infantry', value: parseFloat((ratio.inf * 100).toFixed(1)) },
    { name: 'Cavalry', value: parseFloat((ratio.cav * 100).toFixed(1)) },
    { name: 'Archery', value: parseFloat((ratio.arc * 100).toFixed(1)) },
  ];

  const CustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
    const RADIAN = Math.PI / 180;
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
    if (Number(percent) < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(Number(percent) * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <SectionCard title="Optimal Troop Ratio" icon={<PieIcon size={15} />}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Pie */}
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={90}
                dataKey="value"
              >
                {data.map(entry => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, '']}
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#f9fafb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1">
          {data.map(entry => (
            <div key={entry.name} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: COLORS[entry.name as keyof typeof COLORS] }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">{entry.name}</span>
                  <span className="text-sm font-bold" style={{ color: COLORS[entry.name as keyof typeof COLORS] }}>
                    {entry.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${entry.value}%`,
                      background: COLORS[entry.name as keyof typeof COLORS],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
