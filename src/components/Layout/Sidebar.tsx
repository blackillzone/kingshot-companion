import { useRallyStore } from '../../store/useRallyStore';
import { Shield, Database } from 'lucide-react';
import clsx from 'clsx';

const MENU_ITEMS = [
  { id: 'user-data' as const, label: 'User Data',   icon: Database  },
  { id: 'bear-trap' as const, label: 'Bear Trap',   icon: Shield    },
] as const;

export function Sidebar() {
  const activeView    = useRallyStore(s => s.activeView);
  const setActiveView = useRallyStore(s => s.setActiveView);

  return (
    <aside className="w-44 shrink-0 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Branding */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8 shrink-0" role="img" aria-label="Kings[HOT] logo">
            <defs>
              <linearGradient id="sbPepperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff2222"/>
                <stop offset="100%" stopColor="#8b0000"/>
              </linearGradient>
              <linearGradient id="sbLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80"/>
                <stop offset="100%" stopColor="#166534"/>
              </linearGradient>
            </defs>
            {/* Stem */}
            <path d="M32 8 C32 8 31 5 33 3" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round"/>
            {/* Leaf */}
            <path d="M32 8 C28 4 22 5 22 9 C22 13 28 12 32 8Z" fill="url(#sbLeafGrad)"/>
            {/* Body */}
            <path d="M32 8 C38 9 44 17 44 28 C44 38 40 47 36 53 C34 57 32 59 31 56 C30 53 27 47 26 40 C24 31 24 19 28 11 C29 9 30 8 32 8Z" fill="url(#sbPepperGrad)"/>
            {/* Highlight */}
            <path d="M30 13 C28 20 27 29 28 38" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.35"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Kings[HOT]</p>
            <p className="text-xs text-orange-400 leading-tight">Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase px-2 mb-3">
          Main Menu
        </p>
        <ul className="space-y-1">
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setActiveView(id)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeView === id
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
