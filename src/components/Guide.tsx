import { SectionCard } from './ui';
import { BookOpen } from 'lucide-react';

export function Guide() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <SectionCard title="How to use this calculator" icon={<BookOpen size={15} />}>
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h3 className="font-semibold text-orange-400 mb-1">Step 1 — Enter your rally leader stats</h3>
            <p className="text-gray-400">
              The easiest way: run a <strong className="text-white">Terror Rally</strong> with the exact heroes and gear
              you plan to use for bear. After the battle, open the battle report and copy the
              ATK% and LET% values for each troop type.
            </p>
            <p className="text-gray-400 mt-1">
              If you use a Beast attack instead, enter your base stats and add the widget bonuses separately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400 mb-1">Step 2 — Set rally configuration</h3>
            <p className="text-gray-400">
              Enter your rally capacity (march size). Set the number of participants (up to 15).
              Each player sends an equal share of the total capacity.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400 mb-1">Step 3 — Read results</h3>
            <p className="text-gray-400">
              The <strong className="text-white">Formation</strong> tab shows your optimal Infantry/Cavalry/Archery ratio
              and the exact troop counts each participant should send.
            </p>
            <p className="text-gray-400 mt-1">
              The <strong className="text-white">Participants</strong> tab helps you decide how many players to include
              in the rally to maximize total damage.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="How the formula works" icon={<BookOpen size={15} />}>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Based on <a href="https://frakinator.streamlit.app" className="text-orange-400 hover:underline" target="_blank">Frakinator</a>'s
            battle mechanics research. The total damage dealt to the bear is:
          </p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs space-y-1">
            <p className="text-gray-300">D = L × [ (1/3)×A_inf×√f_inf + A_cav×√f_cav + (4.4/3)×A_arc×√f_arc ]</p>
            <p className="text-gray-500 mt-2">Where:</p>
            <p>A_type = (1 + ATK%/100) × (1 + LET%/100)  <span className="text-gray-500">← Attack Factor</span></p>
            <p>f_inf + f_cav + f_arc = 1  <span className="text-gray-500">← troop fractions</span></p>
            <p>L = proportional to rally size</p>
          </div>
          <p>
            Archers get a <strong className="text-white">×1.1 bonus</strong> because Bear Trap troops are full infantry
            (archers deal +10% vs infantry). With T7+ troops and TG3+, an additional ×1.1 applies.
          </p>
          <p>
            The <strong className="text-white">optimal ratio</strong> is found analytically using Lagrange multipliers —
            no simulation needed.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Key terms" icon={<BookOpen size={15} />}>
        <dl className="space-y-2 text-sm">
          {[
            { term: 'ATK%', def: 'Attack bonus — multiplies base troop damage' },
            { term: 'LET%', def: 'Lethality bonus — multiplies damage alongside ATK% (they compound)' },
            { term: 'Widget', def: 'Rally widget bonus — only add if reading stats from a Beast attack (not Terror rally)' },
            { term: 'TG Level', def: 'Troop Gilded level — TG3+ with T7+ unlocks a bonus archer multiplier' },
            { term: 'Rally capacity', def: 'Total troops your rally can hold. Set this to your march size' },
            { term: 'Joiner heroes', def: 'Heroes that buff all troops globally (Amane, Chenko, Yeonwoo are the most common)' },
          ].map(item => (
            <div key={item.term} className="flex gap-3">
              <dt className="font-semibold text-orange-400 w-24 shrink-0">{item.term}</dt>
              <dd className="text-gray-400">{item.def}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  );
}
