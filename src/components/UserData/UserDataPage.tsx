import { useState } from 'react';
import { useRallyStore } from '../../store/useRallyStore';
import { GovDataEditor } from '../Profiles/GovDataEditor';
import { HeroDetailPanel } from '../Profiles/HeroRoster';
import type { HeroName, OwnedHeroData } from '../../types';
import { defaultOwnedHeroData } from '../../lib/storage';

export function UserDataPage() {
  const activeProfile   = useRallyStore(s => s.activeProfile);
  const updateProfile   = useRallyStore(s => s.updateProfile);
  const userDataTab     = useRallyStore(s => s.userDataTab);
  const setUserDataTab  = useRallyStore(s => s.setUserDataTab);

  const [selectedHero, setSelectedHero] = useState<HeroName | null>(null);

  if (!activeProfile) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        Sélectionnez un profil dans la page <span className="text-orange-400">Profiles</span> pour éditer les données.
      </p>
    );
  }

  const ownedHeroes = activeProfile.ownedHeroes ?? {};
  const selectedData: OwnedHeroData | null = selectedHero
    ? (ownedHeroes[selectedHero] ?? defaultOwnedHeroData())
    : null;

  function updateHero(name: HeroName, patch: Partial<OwnedHeroData>) {
    const current = ownedHeroes[name] ?? defaultOwnedHeroData();
    updateProfile({ ownedHeroes: { ...ownedHeroes, [name]: { ...current, ...patch } } });
  }

  return (
    <div className="max-w-7xl mx-auto grid gap-4" style={{ gridTemplateColumns: '1fr 420px' }}>
      {/* Colonne gauche : onglets */}
      <div className="col-start-1 row-start-1">
        <GovDataEditor
          selectedHero={selectedHero}
          setSelectedHero={setSelectedHero}
          activeTab={userDataTab}
          setActiveTab={setUserDataTab}
        />
      </div>

      {/* Colonne droite : panel héros */}
      <div className="col-start-2 row-start-1 sticky top-4 self-start">
        {selectedHero && selectedData && (
          <HeroDetailPanel
            name={selectedHero}
            data={selectedData}
            onUpdate={patch => updateHero(selectedHero, patch)}
            onClose={() => setSelectedHero(null)}
          />
        )}
      </div>
    </div>
  );
}
