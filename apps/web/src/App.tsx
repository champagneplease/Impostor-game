import React from 'react';
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

      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>El Impostor &copy; {new Date().getFullYear()} — Diseñado para jugar entre amigos</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>24 Categorías</span>
            <span>&bull;</span>
            <span>+720 Palabras</span>
            <span>&bull;</span>
            <span className="text-lime-400 font-semibold">100% Sin Registro</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
