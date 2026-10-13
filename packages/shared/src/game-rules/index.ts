import {
  CategoryItem,
  DifficultyLevel,
  GameEndSummary,
  GameSettings,
  Player,
  PlayerRole,
  SecretRoleAssignment,
  VictoryReason,
  VictoryTeam,
  VotingResult,
  WordItem,
} from '../types/index.js';

export type RandomNumberGenerator = () => number;

/**
 * Normaliza una palabra para comparación estricta pero tolerante a mayúsculas,
 * minúsculas y espacios externos/múltiples.
 */
export function normalizeGuessText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos para robustez en tipeo rápido
    .replace(/\s+/g, ' ');
}

/**
 * Generador de códigos de sala cortos, legibles y no secuenciales.
 * Excluye caracteres ambiguos (0, O, 1, I).
 */
export function generateRoomCode(length = 6, rng: RandomNumberGenerator = Math.random): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(rng() * chars.length);
    result += chars[idx];
  }
  return result;
}

/**
 * Selecciona una categoría y palabra al azar respetando filtros y palabras recientes.
 */
export function pickRandomWordAndCategory(params: {
  categories: CategoryItem[];
  words: WordItem[];
  selectedCategoryIds: string[];
  difficulty: DifficultyLevel;
  recentWordIds?: string[];
  rng?: RandomNumberGenerator;
}): { category: CategoryItem; word: WordItem } {
  const {
    categories,
    words,
    selectedCategoryIds,
    difficulty,
    recentWordIds = [],
    rng = Math.random,
  } = params;

  // Filtrar categorías habilitadas y seleccionadas
  const validCategories = categories.filter(
    (c) => c.enabled && selectedCategoryIds.includes(c.id)
  );

  if (validCategories.length === 0) {
    throw new Error('No hay categorías habilitadas o seleccionadas para iniciar la partida.');
  }

  // Filtrar palabras válidas para las categorías seleccionadas
  const eligibleCategoryIds = new Set(validCategories.map((c) => c.id));
  let pool = words.filter(
    (w) =>
      w.enabled &&
      eligibleCategoryIds.has(w.categoryId) &&
      (difficulty === 'all' || w.difficulty === difficulty)
  );

  if (pool.length === 0) {
    throw new Error(
      `No se encontraron palabras disponibles con la dificultad «${difficulty}» en las categorías seleccionadas.`
    );
  }

  // Filtrar palabras recientes si hay suficientes alternativas (> 5)
  const notRecentPool = pool.filter((w) => !recentWordIds.includes(w.id));
  const finalPool = notRecentPool.length >= 3 ? notRecentPool : pool;

  const selectedWord = finalPool[Math.floor(rng() * finalPool.length)]!;
  const selectedCategory = validCategories.find((c) => c.id === selectedWord.categoryId);

  if (!selectedCategory) {
    throw new Error('Inconsistencia al vincular la palabra seleccionada con su categoría.');
  }

  return { category: selectedCategory, word: selectedWord };
}

/**
 * Asigna roles de impostor y jugadores normales evitando que un mismo jugador
 * sea impostor en rondas consecutivas cuando hay suficientes alternativas.
 */
export function assignPlayerRoles(params: {
  players: Player[];
  impostorCount: number;
  recentImpostorIds?: string[];
  rng?: RandomNumberGenerator;
}): Map<string, PlayerRole> {
  const { players, impostorCount, recentImpostorIds = [], rng = Math.random } = params;

  if (players.length < 3) {
    throw new Error('Se requiere un mínimo de 3 jugadores para repartir roles.');
  }

  if (impostorCount >= players.length) {
    throw new Error('La cantidad de impostores debe ser menor al número total de jugadores.');
  }

  if (impostorCount < 1) {
    throw new Error('Debe haber al menos 1 impostor.');
  }

  // Clonar lista de IDs de jugadores
  const allIds = players.map((p) => p.id);
  const eligibleNonRecent = allIds.filter((id) => !recentImpostorIds.includes(id));

  // Si hay suficientes jugadores no recientes para cubrir los impostores, elegimos de ahí
  let candidatePool =
    eligibleNonRecent.length >= impostorCount ? [...eligibleNonRecent] : [...allIds];

  // Algoritmo Fisher-Yates shuffle
  for (let i = candidatePool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = candidatePool[i]!;
    candidatePool[i] = candidatePool[j]!;
    candidatePool[j] = temp;
  }

  const chosenImpostorIds = new Set(candidatePool.slice(0, impostorCount));

  const roleMap = new Map<string, PlayerRole>();
  for (const player of players) {
    roleMap.set(player.id, chosenImpostorIds.has(player.id) ? 'impostor' : 'player');
  }

  return roleMap;
}

/**
 * Construye la información privada para cada jugador.
 * CRÍTICO: Los impostores NUNCA reciben la palabra secreta.
 */
export function buildSecretRoleAssignments(params: {
  players: Player[];
  roleMap: Map<string, PlayerRole>;
  secretWord: WordItem;
  categoryName: string;
  settings: GameSettings;
}): Map<string, SecretRoleAssignment> {
  const { players, roleMap, secretWord, categoryName, settings } = params;
  const assignments = new Map<string, SecretRoleAssignment>();

  for (const player of players) {
    const role = roleMap.get(player.id) || 'player';

    if (role === 'player') {
      assignments.set(player.id, {
        playerId: player.id,
        role: 'player',
        word: secretWord.text,
        categoryName,
      });
    } else {
      // Rol Impostor: NUNCA incluye secretWord
      let hint: string | undefined = undefined;
      if (settings.enableHints) {
        if (secretWord.impostorHint && secretWord.impostorHint.trim()) {
          hint = secretWord.impostorHint.trim().split(/\s+/)[0];
        } else {
          hint = categoryName.trim().split(/\s+/)[0] || 'General';
        }
      }

      assignments.set(player.id, {
        playerId: player.id,
        role: 'impostor',
        hint,
        categoryName: settings.showCategoryToAll ? categoryName : 'Oculta',
      });
    }
  }

  return assignments;
}

/**
 * Determina el orden de turnos para el debate (opcionalmente aleatorizado).
 */
export function determineTurnOrder(
  players: Player[],
  randomize: boolean,
  rng: RandomNumberGenerator = Math.random
): string[] {
  const ids = players.map((p) => p.id);
  if (!randomize) return ids;

  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Procesa los votos de una ronda y determina si hubo un jugador más votado o empate.
 */
export function processVotes(params: {
  votes: Map<string, string>; // voterId -> targetId
  eligibleVoters: string[];
  eligibleTargets: string[];
  impostorIds: string[];
}): VotingResult {
  const { votes, eligibleVoters, eligibleTargets, impostorIds } = params;

  const voteCounts: Record<string, number> = {};
  for (const targetId of eligibleTargets) {
    voteCounts[targetId] = 0;
  }

  for (const voterId of eligibleVoters) {
    const targetId = votes.get(voterId);
    if (targetId && eligibleTargets.includes(targetId)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  }

  // Encontrar el valor máximo de votos
  let maxVotes = -1;
  for (const count of Object.values(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
    }
  }

  const mostVotedPlayerIds = Object.keys(voteCounts).filter(
    (id) => voteCounts[id] === maxVotes && maxVotes > 0
  );

  // Si no hay votos o hay empate entre los más votados
  const isTie = mostVotedPlayerIds.length !== 1;

  let eliminatedPlayerId: string | undefined = undefined;
  let isImpostorEliminated: boolean | undefined = undefined;
  const remainingImpostors = [...impostorIds];

  if (!isTie && mostVotedPlayerIds[0]) {
    eliminatedPlayerId = mostVotedPlayerIds[0];
    isImpostorEliminated = impostorIds.includes(eliminatedPlayerId);
    if (isImpostorEliminated) {
      const idx = remainingImpostors.indexOf(eliminatedPlayerId);
      if (idx !== -1) {
        remainingImpostors.splice(idx, 1);
      }
    }
  }

  return {
    voteCounts,
    mostVotedPlayerIds,
    isTie,
    eliminatedPlayerId,
    isImpostorEliminated,
    remainingImpostors,
  };
}

/**
 * Valida la suposición de última oportunidad del impostor contra la palabra secreta.
 */
export function verifyLastChanceGuess(
  guess: string,
  secretWord: string
): boolean {
  const normalizedGuess = normalizeGuessText(guess);
  const normalizedTarget = normalizeGuessText(secretWord);

  // Coincidencia exacta normalizada (sin mayúsculas/minúsculas ni espacios de más)
  return normalizedGuess === normalizedTarget;
}

/**
 * Evalúa las condiciones de victoria de la partida según el resultado de votación o última oportunidad.
 */
export function evaluateGameEnd(params: {
  players: Player[];
  roleMap: Map<string, PlayerRole>;
  secretWord: WordItem;
  categoryName: string;
  votingResult: VotingResult;
  isSecondTie?: boolean;
  lastChanceGuessResult?: {
    impostorId: string;
    guess: string;
    wasCorrect: boolean;
  };
  durationSeconds?: number;
}): GameEndSummary {
  const {
    players,
    roleMap,
    secretWord,
    categoryName,
    votingResult,
    isSecondTie = false,
    lastChanceGuessResult,
    durationSeconds = 0,
  } = params;

  const impostorIds = players
    .filter((p) => roleMap.get(p.id) === 'impostor')
    .map((p) => p.id);

  let winner: VictoryTeam = 'impostors';
  let reason: VictoryReason = 'impostors_survived';

  if (isSecondTie) {
    // Si la segunda votación también termina empatada, ganan los impostores
    winner = 'impostors';
    reason = 'tie_second_round';
  } else if (lastChanceGuessResult) {
    if (lastChanceGuessResult.wasCorrect) {
      winner = 'impostors';
      reason = 'impostor_guessed_word';
    } else {
      winner = 'normals';
      reason = 'impostor_failed_guess';
    }
  } else if (votingResult.remainingImpostors.length === 0) {
    // Todos los impostores fueron descubiertos
    winner = 'normals';
    reason = 'all_impostors_found';
  } else {
    // Quedan impostores sin identificar
    winner = 'impostors';
    reason = 'impostors_survived';
  }

  return {
    winner,
    reason,
    secretWord: secretWord.text,
    categoryName,
    impostorIds,
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      role: roleMap.get(p.id) || 'player',
    })),
    votingResult,
    lastChanceGuess: lastChanceGuessResult
      ? {
          impostorId: lastChanceGuessResult.impostorId,
          guessedWord: lastChanceGuessResult.guess,
          wasCorrect: lastChanceGuessResult.wasCorrect,
        }
      : undefined,
    durationSeconds,
    timestamp: Date.now(),
  };
}
