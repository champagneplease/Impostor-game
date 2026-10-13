import { jsx as _jsx } from "react/jsx-runtime";
import { useGameStore } from '../../stores/useGameStore';
import { SharedRoleRevealScreen } from './SharedRoleRevealScreen';
import { SharedDebateScreen } from './SharedDebateScreen';
import { SharedVotingScreen } from './SharedVotingScreen';
import { SharedLastChanceScreen } from './SharedLastChanceScreen';
import { SharedResultsScreen } from './SharedResultsScreen';
export const SharedGameScreen = () => {
    const { sharedPhase } = useGameStore();
    switch (sharedPhase) {
        case 'role_reveal':
            return _jsx(SharedRoleRevealScreen, {});
        case 'debate':
            return _jsx(SharedDebateScreen, {});
        case 'voting':
        case 'tie_breaker':
            return _jsx(SharedVotingScreen, {});
        case 'last_chance':
            return _jsx(SharedLastChanceScreen, {});
        case 'game_over':
            return _jsx(SharedResultsScreen, {});
        default:
            return null;
    }
};
