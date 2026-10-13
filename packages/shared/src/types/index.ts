/**
 * Tipos fundamentales del Juego del Impostor
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'all';

export interface WordItem {
  id: string;
  categoryId: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impostorHint?: string;
  tags: string[];
  enabled: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isCustom?: boolean;
  enabled: boolean;
}

export type PlayerRole = 'player' | 'impostor';

export interface Player {
  id: string;
  name: string;
  avatarColor?: string;
  isHost?: boolean;
  isConnected?: boolean;
  isReady?: boolean;
}

export interface GameSettings {
  playerCount: number;
  impostorCount: number;
  selectedCategoryIds: string[];
  difficulty: DifficultyLevel;
  enableHints: boolean;
  showCategoryToAll: boolean;
  debateDurationSeconds: number; // 0 = libre / sin límite
  turnOrderRandomized: boolean;
  allowLastChanceGuess: boolean;
  allowSelfVote: boolean;
  votingMode: 'group' | 'individual';
}

export type GamePhase =
  | 'setup'
  | 'role_reveal'
  | 'debate'
  | 'voting'
  | 'tie_breaker'
  | 'last_chance'
  | 'game_over';

export interface SecretRoleAssignment {
  playerId: string;
  role: PlayerRole;
  word?: string; // Solo para jugadores normales
  hint?: string; // Solo para impostores si enableHints = true
  categoryName: string;
}

export interface VoteSubmission {
  voterId: string;
  targetId: string;
}

export interface VotingResult {
  voteCounts: Record<string, number>;
  mostVotedPlayerIds: string[];
  isTie: boolean;
  eliminatedPlayerId?: string;
  isImpostorEliminated?: boolean;
  remainingImpostors: string[];
}

export type VictoryTeam = 'normals' | 'impostors';

export type VictoryReason =
  | 'all_impostors_found'
  | 'impostors_survived'
  | 'impostor_guessed_word'
  | 'impostor_failed_guess'
  | 'tie_second_round';

export interface PlayerSummary {
  id: string;
  name: string;
  role: PlayerRole;
}

export interface GameEndSummary {
  winner: VictoryTeam;
  reason: VictoryReason;
  secretWord: string;
  categoryName: string;
  impostorIds: string[];
  players: PlayerSummary[];
  votingResult?: VotingResult;
  lastChanceGuess?: {
    impostorId: string;
    guessedWord: string;
    wasCorrect: boolean;
  };
  durationSeconds: number;
  timestamp: number;
}

// Persistencia y Estadísticas
export interface PlayerStatRecord {
  name: string;
  gamesPlayed: number;
  timesImpostor: number;
  impostorWins: number;
  normalWins: number;
  timesCaught: number;
  votesReceived: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  categoryName: string;
  secretWord: string;
  winner: VictoryTeam;
  reason: VictoryReason;
  playerCount: number;
  impostorCount: number;
  impostorNames: string[];
  playerNames: string[];
}

export interface LocalAppStorage {
  version: number;
  settings: GameSettings;
  customCategories: CategoryItem[];
  customWords: WordItem[];
  stats: {
    gamesPlayed: number;
    normalWins: number;
    impostorWins: number;
    players: Record<string, PlayerStatRecord>;
  };
  history: GameHistoryEntry[];
  recentWords: string[];
  recentImpostors: string[];
  preferences: {
    soundEnabled: boolean;
    reducedMotion: boolean;
  };
}

// Protocolo Socket.IO Multijugador
export interface RoomState {
  code: string;
  hostId: string;
  players: Player[];
  settings: GameSettings;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  activePlayerTurnId?: string;
  turnOrder: string[];
  votesReceivedCount: number;
  totalEligibleVoters: number;
  tieCandidates?: string[];
  roundStartTime?: number;
  lastChancePlayerId?: string;
  endSummary?: GameEndSummary;
}

export interface ClientToServerEvents {
  'room:create': (payload: { playerName: string }, callback: (response: { success: boolean; code?: string; token?: string; error?: string }) => void) => void;
  'room:join': (payload: { code: string; playerName: string; token?: string }, callback: (response: { success: boolean; state?: RoomState; token?: string; error?: string }) => void) => void;
  'room:leave': () => void;
  'room:toggle_ready': () => void;
  'room:update_settings': (settings: Partial<GameSettings>) => void;
  'game:start': () => void;
  'game:request_role': (callback: (role: SecretRoleAssignment | { error: string }) => void) => void;
  'game:next_phase': () => void;
  'game:submit_vote': (payload: { targetId: string }) => void;
  'game:submit_guess': (payload: { guess: string }) => void;
  'game:rematch': () => void;
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void;
  'room:player_joined': (player: Player) => void;
  'room:player_left': (playerId: string) => void;
  'room:player_reconnected': (player: Player) => void;
  'room:error': (error: { code: string; message: string }) => void;
  'game:role': (assignment: SecretRoleAssignment) => void;
  'game:phase_changed': (phase: GamePhase, extra?: Record<string, unknown>) => void;
  'game:vote_progress': (progress: { received: number; total: number }) => void;
  'game:vote_result': (result: VotingResult) => void;
  'game:round_result': (summary: GameEndSummary) => void;
}
