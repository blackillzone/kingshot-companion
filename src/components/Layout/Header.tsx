import { useRallyStore } from '../../store/useRallyStore';
import { User, BookOpen, Users, BarChart2, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { id: 'formation', label: 'Formation', icon: BarChart2 },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'profiles', label: 'Profiles', icon: User },
  { id: 'guide', label: 'Guide', icon: BookOpen },
] as const;

export function Header() {
  const activeTab = useRallyStore(s => s.activeTab);
  const setActiveTab = useRallyStore(s => s.setActiveTab);
  const profiles = useRallyStore(s => s.profiles);
  const activeProfile = useRallyStore(s => s.activeProfile);
  const selectProfile = useRallyStore(s => s.selectProfile);

  return (
    <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Bear emoji as logo */}
            <span className="text-2xl">🐻</span>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Kingshot</h1>
              <p className="text-xs text-orange-400 leading-none">Bear Trap Calculator</p>
            </div>
          </div>

          {/* Profile switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 transition-colors">
              <User size={14} className="text-orange-400" />
              <span className="max-w-32 truncate">{activeProfile?.name ?? 'Select Profile'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-1 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {profiles.map(p => (
                <button
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
                  onClick={() => setActiveTab('profiles')}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-700 rounded-b-lg transition-colors"
                >
                  + Manage profiles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
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
      </div>
    </header>
  );
}
