import React from 'react';
import { Instagram } from 'lucide-react';
import { Header } from './components/common/Header';
import { useGameStore } from './stores/useGameStore';
import { HomeScreen } from './features/home/HomeScreen';
import { SharedSetupScreen } from './features/shared-mode/SharedSetupScreen';
import { SharedGameScreen } from './features/shared-mode/SharedGameScreen';
import { OnlineEntryScreen } from './features/online-mode/OnlineEntryScreen';
import { OnlineLobbyScreen } from './features/online-mode/OnlineLobbyScreen';
import { OnlineGameScreen } from './features/online-mode/OnlineGameScreen';
import { CategoriesManagerScreen } from './features/categories/CategoriesManagerScreen';
import { StatsScreen } from './features/stats/StatsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { RulesScreen } from './features/rules/RulesScreen';

export const App: React.FC = () => {
  const { currentView } = useGameStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen />;
      case 'shared_setup':
        return <SharedSetupScreen />;
      case 'shared_game':
        return <SharedGameScreen />;
      case 'online_entry':
        return <OnlineEntryScreen />;
      case 'online_lobby':
        return <OnlineLobbyScreen />;
      case 'online_game':
        return <OnlineGameScreen />;
      case 'categories':
        return <CategoriesManagerScreen />;
      case 'stats':
        return <StatsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'rules':
        return <RulesScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100">
      <Header />

      <main className="flex-1 pb-12">
        {renderCurrentView()}
      </main>

      {/* Footer con marca de agua del creador */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500 bg-dark-950">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>El Impostor &copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span>24 Categorías</span>
          </div>

          <a
            href="https://www.instagram.com/_nachomirnd/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors group px-3.5 py-1.5 rounded-full bg-dark-900 border border-white/[0.08] hover:border-red-500/40"
          >
            <Instagram className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
              Creado por <strong className="text-red-400 font-bold">@_nachomirnd</strong>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
