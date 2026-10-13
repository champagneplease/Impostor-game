import { create } from 'zustand';
import {
  CategoryItem,
  DEFAULT_GAME_SETTINGS,
  GameEndSummary,
  GamePhase,
  GameSettings,
  Player,
  PlayerRole,
  RoomState,
  SecretRoleAssignment,
  VotingResult,
  WordItem,
  assignPlayerRoles,
  buildSecretRoleAssignments,
  determineTurnOrder,
  evaluateGameEnd,
  pickRandomWordAndCategory,
  processVotes,
  verifyLastChanceGuess,
  INITIAL_CATEGORIES,
  INITIAL_WORDS,
} from '@impostor/shared';
import { StorageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { ConnectionStatus, socketService } from '../services/socketService';

export type AppView =
  | 'home'
  | 'mode_select'
  | 'shared_setup'
  | 'shared_game'
  | 'online_entry'
  | 'online_lobby'
  | 'online_game'
  | 'categories'
  | 'stats'
  | 'settings'
  | 'rules';

interface GameStoreState {
  currentView: AppView;
  setView: (view: AppView) => void;

  // Preferencias
  soundEnabled: boolean;
  reducedMotion: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;

  // Estado Modo Compartido (Offline)
  sharedPlayers: string[];
  sharedSettings: GameSettings;
  sharedPhase: GamePhase;
  sharedSecretWord?: WordItem;
  sharedCategory?: CategoryItem;
  sharedRoleAssignments: SecretRoleAssignment[];
  sharedRevealIndex: number;
  sharedIsCardFlipped: boolean;
  sharedTurnOrder: string[];
  sharedActiveSpeakerIdx: number;
  sharedDebateTimeRemaining: number;
  sharedVotes: Map<string, string>;
  sharedVotingPlayerIdx: number;
  sharedVotingCurtainActive: boolean;
  sharedVotingResult?: VotingResult;
  sharedTieCandidates?: string[];
  sharedIsSecondTie: boolean;
  sharedLastChanceImpostorId?: string;
  sharedEndSummary?: GameEndSummary;

  // Acciones Modo Compartido
  setSharedPlayers: (players: string[]) => void;
  updateSharedSettings: (settings: Partial<GameSettings>) => void;
  startSharedGame: () => void;
  revealSharedRole: () => void;
  hideAndNextSharedRole: () => void;
  startSharedVoting: () => void;
  submitSharedVote: (targetId: string) => void;
  submitSharedGroupAccusation: (accusedPlayerId: string) => void;
  advanceSharedVotingCurtain: () => void;
  submitSharedLastChanceGuess: (guess: string) => void;
  restartSharedGame: () => void;
  modifySharedConfig: () => void;

  // Estado Modo Multijugador Online
  onlineConnectionStatus: ConnectionStatus;
  onlinePlayerName: string;
  onlineRoomCode: string;
  onlineRoomState: RoomState | null;
  onlineMyPlayerId: string | null;
  onlineMyRole: SecretRoleAssignment | null;
  onlineVoteTargetId: string | null;
  onlineVoteSubmitted: boolean;
  onlineLastChanceGuess: string;

  // Acciones Modo Multijugador
  setOnlinePlayerName: (name: string) => void;
  setOnlineRoomCode: (code: string) => void;
  setOnlineConnectionStatus: (status: ConnectionStatus) => void;
  setOnlineRoomState: (state: RoomState | null) => void;
  setOnlineMyPlayerId: (id: string | null) => void;
  setOnlineMyRole: (role: SecretRoleAssignment | null) => void;
  setOnlineVoteTargetId: (id: string | null) => void;
  setOnlineVoteSubmitted: (submitted: boolean) => void;
  leaveOnlineGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialStorage = StorageService.load();

  return {
    currentView: 'home',
    setView: (view) => {
      audioService.playClick();
      set({ currentView: view });
    },

    soundEnabled: initialStorage.preferences.soundEnabled,
    reducedMotion: initialStorage.preferences.reducedMotion,
    setSoundEnabled: (enabled) => {
      StorageService.updatePreferences({ soundEnabled: enabled });
      set({ soundEnabled: enabled });
    },
    setReducedMotion: (reduced) => {
      StorageService.updatePreferences({ reducedMotion: reduced });
      set({ reducedMotion: reduced });
    },

    // Modo compartido: Valores iniciales
    sharedPlayers: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
    sharedSettings: initialStorage.settings,
    sharedPhase: 'setup',
    sharedRoleAssignments: [],
    sharedRevealIndex: 0,
    sharedIsCardFlipped: false,
    sharedTurnOrder: [],
    sharedActiveSpeakerIdx: 0,
    sharedDebateTimeRemaining: initialStorage.settings.debateDurationSeconds,
    sharedVotes: new Map(),
    sharedVotingPlayerIdx: 0,
    sharedVotingCurtainActive: false,
    sharedIsSecondTie: false,

    setSharedPlayers: (players) => set({ sharedPlayers: players }),
    updateSharedSettings: (settings) => {
      const updated = { ...get().sharedSettings, ...settings };
      const currentStore = StorageService.load();
      currentStore.settings = updated;
      StorageService.save(currentStore);
      set({ sharedSettings: updated });
    },

    startSharedGame: () => {
      const state = get();
      const players = state.sharedPlayers.map((name, idx) => ({
        id: `local_p_${idx}`,
        name: name.trim() || `Jugador ${idx + 1}`,
      }));

      if (players.length < 3) {
        audioService.playError();
        return;
      }

      const storage = StorageService.load();
      const allCategories = [...INITIAL_CATEGORIES, ...storage.customCategories];
      const allWords = [...INITIAL_WORDS, ...storage.customWords];

      const { category, word } = pickRandomWordAndCategory({
        categories: allCategories,
        words: allWords,
        selectedCategoryIds: state.sharedSettings.selectedCategoryIds,
        difficulty: state.sharedSettings.difficulty,
        recentWordIds: storage.recentWords,
      });

      const roleMap = assignPlayerRoles({
        players,
        impostorCount: state.sharedSettings.impostorCount,
        recentImpostorIds: storage.recentImpostors,
      });

      const assignmentsMap = buildSecretRoleAssignments({
        players,
        roleMap,
        secretWord: word,
        categoryName: category.name,
        settings: state.sharedSettings,
      });

      const assignments = players.map((p) => assignmentsMap.get(p.id)!);
      const turnOrder = determineTurnOrder(players, state.sharedSettings.turnOrderRandomized);

      // Actualizar recientes en local storage
      storage.recentWords = [word.id, ...storage.recentWords].slice(0, 15);
      const impostorIds = players.filter((p) => roleMap.get(p.id) === 'impostor').map((p) => p.name);
      storage.recentImpostors = [...impostorIds, ...storage.recentImpostors].slice(0, 10);
      StorageService.save(storage);

      audioService.playClick();
      set({
        sharedSecretWord: word,
        sharedCategory: category,
        sharedRoleAssignments: assignments,
        sharedRevealIndex: 0,
        sharedIsCardFlipped: false,
        sharedTurnOrder: turnOrder,
        sharedActiveSpeakerIdx: 0,
        sharedDebateTimeRemaining: state.sharedSettings.debateDurationSeconds,
        sharedVotes: new Map(),
        sharedVotingPlayerIdx: 0,
        sharedVotingCurtainActive: false,
        sharedVotingResult: undefined,
        sharedTieCandidates: undefined,
        sharedIsSecondTie: false,
        sharedLastChanceImpostorId: undefined,
        sharedEndSummary: undefined,
        sharedPhase: 'role_reveal',
        currentView: 'shared_game',
      });
    },

    revealSharedRole: () => {
      audioService.playReveal();
      set({ sharedIsCardFlipped: true });
    },

    hideAndNextSharedRole: () => {
      audioService.playClick();
      const state = get();
      const nextIdx = state.sharedRevealIndex + 1;

      if (nextIdx < state.sharedRoleAssignments.length) {
        set({
          sharedRevealIndex: nextIdx,
          sharedIsCardFlipped: false,
        });
      } else {
        // Todos vieron su rol -> Pasar a debate
        set({
          sharedPhase: 'debate',
          sharedIsCardFlipped: false,
        });
      }
    },

    startSharedVoting: () => {
      audioService.playClick();
      set({
        sharedPhase: 'voting',
        sharedVotingPlayerIdx: 0,
        sharedVotingCurtainActive: false,
        sharedVotes: new Map(),
      });
    },

    submitSharedVote: (targetId: string) => {
      audioService.playClick();
      const state = get();
      const voters = state.sharedPlayers.map((_, idx) => `local_p_${idx}`);
      const currentVoterId = voters[state.sharedVotingPlayerIdx]!;

      const newVotes = new Map(state.sharedVotes);
      newVotes.set(currentVoterId, targetId);

      set({
        sharedVotes: newVotes,
        sharedVotingCurtainActive: true,
      });
    },

    submitSharedGroupAccusation: (accusedPlayerId: string) => {
      audioService.playClick();
      const state = get();
      const impostorIds = state.sharedRoleAssignments
        .filter((r) => r.role === 'impostor')
        .map((r) => r.playerId);

      const isImpostor = impostorIds.includes(accusedPlayerId);
      const remainingImpostors = isImpostor
        ? impostorIds.filter((id) => id !== accusedPlayerId)
        : impostorIds;

      const groupVotingResult: VotingResult = {
        voteCounts: { [accusedPlayerId]: state.sharedPlayers.length },
        mostVotedPlayerIds: [accusedPlayerId],
        eliminatedPlayerId: accusedPlayerId,
        isImpostorEliminated: isImpostor,
        remainingImpostors,
        isTie: false,
      };

      // Si el grupo descubrió al impostor y tiene última oportunidad
      if (isImpostor && state.sharedSettings.allowLastChanceGuess) {
        set({
          sharedVotingResult: groupVotingResult,
          sharedLastChanceImpostorId: accusedPlayerId,
          sharedPhase: 'last_chance',
          sharedVotingCurtainActive: false,
        });
        return;
      }

      // Fin de la partida inmediato
      const endSummary = evaluateGameEnd({
        players: state.sharedPlayers.map((name, idx) => ({ id: `local_p_${idx}`, name })),
        roleMap: new Map(state.sharedRoleAssignments.map((r) => [r.playerId, r.role])),
        secretWord: state.sharedSecretWord!,
        categoryName: state.sharedCategory!.name,
        votingResult: groupVotingResult,
      });

      StorageService.recordGameResult(endSummary);
      audioService.playVictory();
      set({
        sharedVotingResult: groupVotingResult,
        sharedEndSummary: endSummary,
        sharedPhase: 'game_over',
        sharedVotingCurtainActive: false,
      });
    },

    advanceSharedVotingCurtain: () => {
      audioService.playClick();
      const state = get();
      const totalVoters = state.sharedPlayers.length;
      const nextVoterIdx = state.sharedVotingPlayerIdx + 1;

      if (nextVoterIdx < totalVoters) {
        set({
          sharedVotingPlayerIdx: nextVoterIdx,
          sharedVotingCurtainActive: false,
        });
        return;
      }

      // Todos han votado -> Procesar resultado
      const eligibleVoters = state.sharedPlayers.map((_, idx) => `local_p_${idx}`);
      const eligibleTargets =
        state.sharedPhase === 'tie_breaker' && state.sharedTieCandidates
          ? state.sharedTieCandidates
          : eligibleVoters;

      const impostorIds = state.sharedRoleAssignments
        .filter((r) => r.role === 'impostor')
        .map((r) => r.playerId);

      const votingResult = processVotes({
        votes: state.sharedVotes,
        eligibleVoters,
        eligibleTargets,
        impostorIds,
      });

      if (votingResult.isTie) {
        if (state.sharedPhase === 'tie_breaker') {
          // Segundo empate consecutivo -> Ganan los impostores
          const endSummary = evaluateGameEnd({
            players: state.sharedPlayers.map((name, idx) => ({ id: `local_p_${idx}`, name })),
            roleMap: new Map(state.sharedRoleAssignments.map((r) => [r.playerId, r.role])),
            secretWord: state.sharedSecretWord!,
            categoryName: state.sharedCategory!.name,
            votingResult,
            isSecondTie: true,
          });

          StorageService.recordGameResult(endSummary);
          audioService.playVictory();
          set({
            sharedVotingResult: votingResult,
            sharedEndSummary: endSummary,
            sharedPhase: 'game_over',
            sharedVotingCurtainActive: false,
          });
          return;
        }

        // Primer empate -> Pasar a desempate
        set({
          sharedVotingResult: votingResult,
          sharedTieCandidates: votingResult.mostVotedPlayerIds,
          sharedPhase: 'tie_breaker',
          sharedVotingPlayerIdx: 0,
          sharedVotingCurtainActive: false,
          sharedVotes: new Map(),
        });
        return;
      }

      // Si se descubrió a un impostor y está habilitada la última oportunidad
      if (
        votingResult.eliminatedPlayerId &&
        votingResult.isImpostorEliminated &&
        state.sharedSettings.allowLastChanceGuess
      ) {
        set({
          sharedVotingResult: votingResult,
          sharedLastChanceImpostorId: votingResult.eliminatedPlayerId,
          sharedPhase: 'last_chance',
          sharedVotingCurtainActive: false,
        });
        return;
      }

      // Juego terminado normal
      const endSummary = evaluateGameEnd({
        players: state.sharedPlayers.map((name, idx) => ({ id: `local_p_${idx}`, name })),
        roleMap: new Map(state.sharedRoleAssignments.map((r) => [r.playerId, r.role])),
        secretWord: state.sharedSecretWord!,
        categoryName: state.sharedCategory!.name,
        votingResult,
      });

      StorageService.recordGameResult(endSummary);
      audioService.playVictory();
      set({
        sharedVotingResult: votingResult,
        sharedEndSummary: endSummary,
        sharedPhase: 'game_over',
        sharedVotingCurtainActive: false,
      });
    },

    submitSharedLastChanceGuess: (guess: string) => {
      const state = get();
      const impostorId = state.sharedLastChanceImpostorId || '';
      const wasCorrect = verifyLastChanceGuess(guess, state.sharedSecretWord!.text);

      const fakeResult: VotingResult = {
        voteCounts: {},
        mostVotedPlayerIds: [impostorId],
        isTie: false,
        eliminatedPlayerId: impostorId,
        isImpostorEliminated: true,
        remainingImpostors: [],
      };

      const endSummary = evaluateGameEnd({
        players: state.sharedPlayers.map((name, idx) => ({ id: `local_p_${idx}`, name })),
        roleMap: new Map(state.sharedRoleAssignments.map((r) => [r.playerId, r.role])),
        secretWord: state.sharedSecretWord!,
        categoryName: state.sharedCategory!.name,
        votingResult: fakeResult,
        lastChanceGuessResult: {
          impostorId,
          guess,
          wasCorrect,
        },
      });

      StorageService.recordGameResult(endSummary);
      audioService.playVictory();
      set({
        sharedEndSummary: endSummary,
        sharedPhase: 'game_over',
      });
    },

    restartSharedGame: () => {
      get().startSharedGame();
    },

    modifySharedConfig: () => {
      audioService.playClick();
      set({
        sharedPhase: 'setup',
        currentView: 'shared_setup',
      });
    },

    // Multijugador Online
    onlineConnectionStatus: 'idle',
    onlinePlayerName: '',
    onlineRoomCode: '',
    onlineRoomState: null,
    onlineMyPlayerId: null,
    onlineMyRole: null,
    onlineVoteTargetId: null,
    onlineVoteSubmitted: false,
    onlineLastChanceGuess: '',

    setOnlinePlayerName: (name) => set({ onlinePlayerName: name }),
    setOnlineRoomCode: (code) => set({ onlineRoomCode: code.toUpperCase() }),
    setOnlineConnectionStatus: (status) => set({ onlineConnectionStatus: status }),
    setOnlineRoomState: (roomState) => set({ onlineRoomState: roomState }),
    setOnlineMyPlayerId: (id) => set({ onlineMyPlayerId: id }),
    setOnlineMyRole: (role) => set({ onlineMyRole: role }),
    setOnlineVoteTargetId: (id) => set({ onlineVoteTargetId: id }),
    setOnlineVoteSubmitted: (submitted) => set({ onlineVoteSubmitted: submitted }),

    leaveOnlineGame: () => {
      socketService.disconnect();
      set({
        onlineRoomState: null,
        onlineMyRole: null,
        onlineVoteTargetId: null,
        onlineVoteSubmitted: false,
        onlineConnectionStatus: 'idle',
        currentView: 'home',
      });
    },
  };
});
