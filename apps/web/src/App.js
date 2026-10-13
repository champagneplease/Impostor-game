import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const App = () => {
    const { currentView } = useGameStore();
    const renderCurrentView = () => {
        switch (currentView) {
            case 'home':
                return _jsx(HomeScreen, {});
            case 'shared_setup':
                return _jsx(SharedSetupScreen, {});
            case 'shared_game':
                return _jsx(SharedGameScreen, {});
            case 'online_entry':
                return _jsx(OnlineEntryScreen, {});
            case 'online_lobby':
                return _jsx(OnlineLobbyScreen, {});
            case 'online_game':
                return _jsx(OnlineGameScreen, {});
            case 'categories':
                return _jsx(CategoriesManagerScreen, {});
            case 'stats':
                return _jsx(StatsScreen, {});
            case 'settings':
                return _jsx(SettingsScreen, {});
            case 'rules':
                return _jsx(RulesScreen, {});
            default:
                return _jsx(HomeScreen, {});
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-dark-950 text-slate-100", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 pb-12", children: renderCurrentView() }), _jsx("footer", { className: "border-t border-slate-900/80 py-6 text-center text-xs text-slate-500", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2", children: [_jsxs("span", { children: ["El Impostor \u00A9 ", new Date().getFullYear(), " \u2014 Dise\u00F1ado para jugar entre amigos"] }), _jsxs("div", { className: "flex items-center gap-4 text-[11px] text-slate-400", children: [_jsx("span", { children: "24 Categor\u00EDas" }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: "+720 Palabras" }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "text-lime-400 font-semibold", children: "100% Sin Registro" })] })] }) })] }));
};
export default App;
