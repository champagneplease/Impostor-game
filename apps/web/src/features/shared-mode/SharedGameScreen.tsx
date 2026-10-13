import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { SharedRoleRevealScreen } from './SharedRoleRevealScreen';
import { SharedDebateScreen } from './SharedDebateScreen';
import { SharedVotingScreen } from './SharedVotingScreen';
import { SharedLastChanceScreen } from './SharedLastChanceScreen';
import { SharedResultsScreen } from './SharedResultsScreen';

export const SharedGameScreen: React.FC = () => {
  const { sharedPhase } = useGameStore();

  switch (sharedPhase) {
    case 'role_reveal':
      return <SharedRoleRevealScreen />;
    case 'debate':
      return <SharedDebateScreen />;
    case 'voting':
    case 'tie_breaker':
      return <SharedVotingScreen />;
    case 'last_chance':
      return <SharedLastChanceScreen />;
    case 'game_over':
      return <SharedResultsScreen />;
    default:
      return null;
  }
};
