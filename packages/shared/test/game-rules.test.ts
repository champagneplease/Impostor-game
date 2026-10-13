import { describe, expect, it } from 'vitest';
import {
  assignPlayerRoles,
  buildSecretRoleAssignments,
  evaluateGameEnd,
  generateRoomCode,
  normalizeGuessText,
  pickRandomWordAndCategory,
  processVotes,
  verifyLastChanceGuess,
} from '../src/game-rules';
import { INITIAL_CATEGORIES } from '../src/data/categories';
import { INITIAL_WORDS } from '../src/data/words';
import { DEFAULT_GAME_SETTINGS } from '../src/constants';
import { Player, PlayerRole } from '../src/types';

describe('Motor de Reglas del Impostor', () => {
  const dummyPlayers: Player[] = [
    { id: 'p1', name: 'Nacho' },
    { id: 'p2', name: 'Sofía' },
    { id: 'p3', name: 'Mateo' },
    { id: 'p4', name: 'Valentina' },
  ];

  it('debe tener al menos 24 categorías y 30 palabras por cada categoría', () => {
    expect(INITIAL_CATEGORIES.length).toBeGreaterThanOrEqual(24);
    for (const cat of INITIAL_CATEGORIES) {
      const wordsForCat = INITIAL_WORDS.filter((w) => w.categoryId === cat.id);
      expect(
        wordsForCat.length,
        `La categoría ${cat.name} (${cat.id}) tiene menos de 30 palabras`
      ).toBeGreaterThanOrEqual(30);
    }
  });

  it('todas las pistas del impostor deben ser estrictamente una sola palabra sin espacios', () => {
    for (const word of INITIAL_WORDS) {
      if (word.impostorHint) {
        expect(word.impostorHint.trim()).not.toContain(' ');
        expect(word.impostorHint.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('debe generar códigos de sala de 6 caracteres válidos y no ambiguos', () => {
    const code = generateRoomCode(6);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/);
  });

  it('debe seleccionar palabras aleatorias y respetar exclusión de palabras recientes', () => {
    const word1 = pickRandomWordAndCategory({
      categories: INITIAL_CATEGORIES,
      words: INITIAL_WORDS,
      selectedCategoryIds: ['futbol'],
      difficulty: 'all',
    });
    expect(word1.category.id).toBe('futbol');
    expect(word1.word.text).toBeDefined();

    // Intentar excluir la palabra recién jugada
    const word2 = pickRandomWordAndCategory({
      categories: INITIAL_CATEGORIES,
      words: INITIAL_WORDS,
      selectedCategoryIds: ['futbol'],
      difficulty: 'all',
      recentWordIds: [word1.word.id],
    });
    expect(word2.word.id).not.toBe(word1.word.id);
  });

  it('debe lanzar error al intentar seleccionar palabras de categorías no válidas o vacías', () => {
    expect(() =>
      pickRandomWordAndCategory({
        categories: INITIAL_CATEGORIES,
        words: INITIAL_WORDS,
        selectedCategoryIds: ['categoria-inexistente'],
        difficulty: 'all',
      })
    ).toThrow();
  });

  it('debe asignar la cantidad exacta de impostores', () => {
    const roleMap1 = assignPlayerRoles({
      players: dummyPlayers,
      impostorCount: 1,
    });

    const impostors1 = Array.from(roleMap1.values()).filter((r) => r === 'impostor');
    expect(impostors1).toHaveLength(1);

    const roleMap2 = assignPlayerRoles({
      players: dummyPlayers,
      impostorCount: 2,
    });
    const impostors2 = Array.from(roleMap2.values()).filter((r) => r === 'impostor');
    expect(impostors2).toHaveLength(2);
  });

  it('debe evitar que un jugador sea impostor en rondas consecutivas si hay alternativas', () => {
    // Si p1 fue impostor recientemente, debe intentar elegir a otro
    const roleMap = assignPlayerRoles({
      players: dummyPlayers,
      impostorCount: 1,
      recentImpostorIds: ['p1'],
    });
    expect(roleMap.get('p1')).toBe('player');
  });

  it('CRÍTICO: El impostor NUNCA debe recibir la palabra secreta en su payload', () => {
    const roleMap = new Map<string, PlayerRole>([
      ['p1', 'player'],
      ['p2', 'impostor'],
      ['p3', 'player'],
      ['p4', 'player'],
    ]);

    const secretWord = INITIAL_WORDS[0]!;
    const assignments = buildSecretRoleAssignments({
      players: dummyPlayers,
      roleMap,
      secretWord,
      categoryName: 'Fútbol',
      settings: { ...DEFAULT_GAME_SETTINGS, enableHints: true },
    });

    const p1Role = assignments.get('p1')!;
    const p2Role = assignments.get('p2')!;

    // Jugador normal recibe la palabra
    expect(p1Role.role).toBe('player');
    expect(p1Role.word).toBe(secretWord.text);

    // Impostor NO recibe la palabra
    expect(p2Role.role).toBe('impostor');
    expect(p2Role.word).toBeUndefined();
    expect(p2Role.hint).toBeDefined(); // Tiene pista habilitada
  });

  it('debe ocultar pistas cuando enableHints está deshabilitado', () => {
    const roleMap = new Map<string, PlayerRole>([
      ['p1', 'player'],
      ['p2', 'impostor'],
      ['p3', 'player'],
      ['p4', 'player'],
    ]);

    const secretWord = INITIAL_WORDS[0]!;
    const assignments = buildSecretRoleAssignments({
      players: dummyPlayers,
      roleMap,
      secretWord,
      categoryName: 'Fútbol',
      settings: { ...DEFAULT_GAME_SETTINGS, enableHints: false },
    });

    const p2Role = assignments.get('p2')!;
    expect(p2Role.hint).toBeUndefined();
    expect(p2Role.word).toBeUndefined();
  });

  it('debe procesar votos correctamente e identificar al jugador más votado', () => {
    const votes = new Map<string, string>([
      ['p1', 'p2'],
      ['p3', 'p2'],
      ['p4', 'p2'],
      ['p2', 'p1'],
    ]);

    const result = processVotes({
      votes,
      eligibleVoters: ['p1', 'p2', 'p3', 'p4'],
      eligibleTargets: ['p1', 'p2', 'p3', 'p4'],
      impostorIds: ['p2'],
    });

    expect(result.isTie).toBe(false);
    expect(result.eliminatedPlayerId).toBe('p2');
    expect(result.isImpostorEliminated).toBe(true);
    expect(result.remainingImpostors).toHaveLength(0);
  });

  it('debe detectar empates en las votaciones', () => {
    const votes = new Map<string, string>([
      ['p1', 'p2'],
      ['p3', 'p2'],
      ['p2', 'p4'],
      ['p4', 'p1'], // p2 tiene 2 votos, p4 tiene 1, p1 tiene 1 -> gana p2
    ]);

    const tieVotes = new Map<string, string>([
      ['p1', 'p2'],
      ['p3', 'p2'],
      ['p2', 'p4'],
      ['p4', 'p2'], // p2 tiene 3
    ]);

    const strictTie = new Map<string, string>([
      ['p1', 'p2'],
      ['p3', 'p2'],
      ['p2', 'p4'],
      ['p4', 'p4'], // p2 tiene 2 votos, p4 tiene 2 votos -> Empate
    ]);

    const result = processVotes({
      votes: strictTie,
      eligibleVoters: ['p1', 'p2', 'p3', 'p4'],
      eligibleTargets: ['p1', 'p2', 'p3', 'p4'],
      impostorIds: ['p2'],
    });

    expect(result.isTie).toBe(true);
    expect(result.mostVotedPlayerIds).toEqual(expect.arrayContaining(['p2', 'p4']));
    expect(result.eliminatedPlayerId).toBeUndefined();
  });

  it('debe normalizar y verificar adivinanzas de última oportunidad con precisión exacta', () => {
    const secret = 'Lionel Messi';
    expect(verifyLastChanceGuess('lionel messi', secret)).toBe(true);
    expect(verifyLastChanceGuess('  LIONEL MESSI  ', secret)).toBe(true);
    expect(verifyLastChanceGuess('Lionel', secret)).toBe(false); // Coincidencia parcial no permitida
    expect(verifyLastChanceGuess('Messi', secret)).toBe(false);
    expect(verifyLastChanceGuess('Cristiano Ronaldo', secret)).toBe(false);
  });

  it('debe otorgar la victoria a los normales si descubren a todos los impostores', () => {
    const roleMap = new Map<string, PlayerRole>([
      ['p1', 'player'],
      ['p2', 'impostor'],
      ['p3', 'player'],
      ['p4', 'player'],
    ]);

    const votingResult = {
      voteCounts: { p2: 3, p1: 1 },
      mostVotedPlayerIds: ['p2'],
      isTie: false,
      eliminatedPlayerId: 'p2',
      isImpostorEliminated: true,
      remainingImpostors: [],
    };

    const summary = evaluateGameEnd({
      players: dummyPlayers,
      roleMap,
      secretWord: INITIAL_WORDS[0]!,
      categoryName: 'Fútbol',
      votingResult,
    });

    expect(summary.winner).toBe('normals');
    expect(summary.reason).toBe('all_impostors_found');
  });

  it('debe otorgar la victoria a los impostores si la segunda votación termina en empate', () => {
    const roleMap = new Map<string, PlayerRole>([
      ['p1', 'player'],
      ['p2', 'impostor'],
      ['p3', 'player'],
      ['p4', 'player'],
    ]);

    const votingResult = {
      voteCounts: { p1: 2, p2: 2 },
      mostVotedPlayerIds: ['p1', 'p2'],
      isTie: true,
      remainingImpostors: ['p2'],
    };

    const summary = evaluateGameEnd({
      players: dummyPlayers,
      roleMap,
      secretWord: INITIAL_WORDS[0]!,
      categoryName: 'Fútbol',
      votingResult,
      isSecondTie: true,
    });

    expect(summary.winner).toBe('impostors');
    expect(summary.reason).toBe('tie_second_round');
  });

  it('debe otorgar la victoria a los impostores si adivinan la palabra en la última oportunidad', () => {
    const roleMap = new Map<string, PlayerRole>([
      ['p1', 'player'],
      ['p2', 'impostor'],
      ['p3', 'player'],
      ['p4', 'player'],
    ]);

    const votingResult = {
      voteCounts: { p2: 3 },
      mostVotedPlayerIds: ['p2'],
      isTie: false,
      eliminatedPlayerId: 'p2',
      isImpostorEliminated: true,
      remainingImpostors: [],
    };

    const summary = evaluateGameEnd({
      players: dummyPlayers,
      roleMap,
      secretWord: INITIAL_WORDS[0]!,
      categoryName: 'Fútbol',
      votingResult,
      lastChanceGuessResult: {
        impostorId: 'p2',
        guess: INITIAL_WORDS[0]!.text,
        wasCorrect: true,
      },
    });

    expect(summary.winner).toBe('impostors');
    expect(summary.reason).toBe('impostor_guessed_word');
  });
});
