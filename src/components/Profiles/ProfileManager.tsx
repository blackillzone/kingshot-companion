import { useState, useRef } from 'react';
import { useRallyStore } from '../../store/useRallyStore';
import { SectionCard } from '../ui';
import { User, Trash2, Download, Upload, Plus } from 'lucide-react';
import { exportProfile, importProfileFromJson } from '../../lib/storage';
import clsx from 'clsx';

export function ProfileManager() {
  const profiles = useRallyStore(s => s.profiles);
  const activeProfile = useRallyStore(s => s.activeProfile);
  const newProfile = useRallyStore(s => s.newProfile);
  const selectProfile = useRallyStore(s => s.selectProfile);
  const removeProfile = useRallyStore(s => s.removeProfile);
  const updateProfile = useRallyStore(s => s.updateProfile);

  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      newProfile(newName.trim());
      setNewName('');
      setShowNew(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const json = ev.target?.result as string;
      const profile = importProfileFromJson(json);
      if (profile) {
        updateProfile(profile);
        setImportError(null);
      } else {
        setImportError('Invalid profile file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <SectionCard title="Saved Profiles" icon={<User size={15} />}>
        <div className="space-y-2">
          {profiles.map(p => (
            <div
              key={p.id}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors',
                p.id === activeProfile?.id
                  ? 'border-orange-500/40 bg-orange-500/5'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              )}
            >
              <button
                type="button"
                onClick={() => selectProfile(p.id)}
                className="flex-1 text-left"
              >
                <p className={clsx('text-sm font-medium', p.id === activeProfile?.id ? 'text-orange-400' : 'text-gray-200')}>
                  {p.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  INF {p.stats.inf_atk}%/{p.stats.inf_let}% ·
                  CAV {p.stats.cav_atk}%/{p.stats.cav_let}% ·
                  ARC {p.stats.arc_atk}%/{p.stats.arc_let}%
                </p>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {/* Export */}
                <button
                  type="button"
                  onClick={() => exportProfile(p)}
                  title="Export profile"
                  className="p-2 text-gray-500 hover:text-orange-400 transition-colors rounded-lg hover:bg-gray-700"
                >
                  <Download size={14} />
                </button>

                {/* Delete */}
                {confirmDelete === p.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { removeProfile(p.id); setConfirmDelete(null); }}
                      className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(p.id)}
                    title="Delete profile"
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700"
                    disabled={profiles.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New profile */}
        {showNew ? (
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="New profile name..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => { setShowNew(false); setNewName(''); }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowNew(true)}
              disabled={profiles.length >= 10}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              New Profile
            </button>

            {/* Import */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              <Upload size={14} />
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        )}

        {importError && (
          <p className="text-xs text-red-400 mt-2">{importError}</p>
        )}

        <p className="text-xs text-gray-600 mt-3">
          Up to 10 profiles. Auto-saved to localStorage — data stays in your browser.
        </p>
      </SectionCard>
    </div>
  );
}
