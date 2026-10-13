import { GameSettings } from '../types/index.js';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  playerCount: 4,
  impostorCount: 1,
  selectedCategoryIds: ['futbol', 'peliculas', 'comida', 'videojuegos'],
  difficulty: 'all',
  enableHints: true,
  showCategoryToAll: true,
  debateDurationSeconds: 180,
  turnOrderRandomized: true,
  allowLastChanceGuess: true,
  allowSelfVote: false,
};

export const GAME_LIMITS = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 16,
  RECOMMENDED_MIN_PLAYERS: 4,
  MAX_IMPOSTORS: 4,
  MIN_PLAYER_NAME_LENGTH: 1,
  MAX_PLAYER_NAME_LENGTH: 25,
  MAX_CUSTOM_CATEGORIES: 50,
  MAX_CUSTOM_WORDS_PER_CATEGORY: 200,
  ROOM_CODE_LENGTH: 6,
  MAX_ROOMS: 500,
  RECONNECT_GRACE_PERIOD_MS: 45000, // 45 segundos para reconectarse
};

export const STORAGE_KEYS = {
  APP_DATA: 'impostor_app_data_v1',
  RECONNECT_TOKEN_PREFIX: 'impostor_reconnect_token_',
  CURRENT_ROOM_CODE: 'impostor_current_room',
};
