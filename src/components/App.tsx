import { useRallyStore } from '../store/useRallyStore';
import { Header } from './Layout/Header';
import { Footer } from './Layout/Footer';
import { StatsForm } from './LeaderStats/StatsForm';
import { RallyConfig } from './RallyConfig/RallyConfig';
import { OptimalRatioPie } from './Results/OptimalRatioPie';
import { TroopTable } from './Results/TroopTable';
import { DamageScore } from './Results/DamageScore';
import { JoinerRecommender } from './Results/JoinerRecommender';
import { ParticipantGraph } from './Results/ParticipantGraph';
import { ProfileManager } from './Profiles/ProfileManager';
import { Guide } from './Guide';

export function App() {
  const activeTab = useRallyStore(s => s.activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {activeTab === 'formation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: inputs */}
            <div className="space-y-4">
              <StatsForm />
              <RallyConfig />
              <JoinerRecommender />
            </div>

            {/* Right column: results */}
            <div className="space-y-4">
              <OptimalRatioPie />
              <TroopTable />
              <DamageScore />
            </div>
          </div>
        )}

        {activeTab === 'participants' && <ParticipantGraph />}
        {activeTab === 'profiles' && <ProfileManager />}
        {activeTab === 'guide' && <Guide />}
      </main>

      <Footer />
    </div>
  );
}
