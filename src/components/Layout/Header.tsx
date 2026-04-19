import { useRallyStore } from '../../store/useRallyStore';
import { User, BookOpen, Users, BarChart2, ChevronDown, Sword, ShieldCheck, Star } from 'lucide-react';
import clsx from 'clsx';

const BT_TABS = [
  { id: 'formation',    label: 'Formation',    icon: BarChart2 },
  { id: 'participants', label: 'Participants',  icon: Users     },
  { id: 'guide',        label: 'Guide',         icon: BookOpen  },
] as const;

const UD_TABS = [
  { id: 'heroes',       label: 'Heroes',         icon: Star        },
  { id: 'gov-gear',     label: 'Governor',        icon: ShieldCheck },
  { id: 'static-stats', label: 'Global Stats',    icon: BarChart2   },
  { id: 'troops',       label: 'Troops',          icon: Sword       },
] as const;

export function Header() {
  const activeView      = useRallyStore(s => s.activeView);
  const activeTab       = useRallyStore(s => s.activeTab);
  const setActiveTab    = useRallyStore(s => s.setActiveTab);
  const userDataTab     = useRallyStore(s => s.userDataTab);
  const setUserDataTab  = useRallyStore(s => s.setUserDataTab);
  const profiles        = useRallyStore(s => s.profiles);
  const activeProfile   = useRallyStore(s => s.activeProfile);
  const selectProfile   = useRallyStore(s => s.selectProfile);
  const setActiveView   = useRallyStore(s => s.setActiveView);

  return (
    <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          {/* View title */}
          <div>
            {activeView === 'bear-trap' && (
              <h2 className="text-base font-semibold text-white">Bear Trap Calculator</h2>
            )}
            {activeView === 'profiles' && (
              <h2 className="text-base font-semibold text-white">Profile Management</h2>
            )}
            {activeView === 'user-data' && (
              <h2 className="text-base font-semibold text-white">User Data</h2>
            )}
          </div>

          {/* Profile switcher */}
          <div className="relative group">
            <button type="button" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 transition-colors">
              <User size={14} className="text-orange-400" />
              <span className="max-w-32 truncate">{activeProfile?.name ?? 'Select Profile'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-1 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {profiles.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => selectProfile(p.id)}
                  className={clsx(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors',
                    p.id === activeProfile?.id ? 'text-orange-400 font-medium' : 'text-gray-200'
                  )}
                >
                  {p.name}
                </button>
              ))}
              <div className="border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveView('profiles')}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-700 rounded-b-lg transition-colors"
                >
                  + Manage profiles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation — Bear Trap */}
        {activeView === 'bear-trap' && (
          <nav className="flex gap-1 -mb-px">
            {BT_TABS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Tab navigation — User Data */}
        {activeView === 'user-data' && (
          <nav className="flex gap-1 -mb-px">
            {UD_TABS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setUserDataTab(id)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  userDataTab === id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

