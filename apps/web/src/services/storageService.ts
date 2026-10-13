import {
  CategoryItem,
  GameEndSummary,
  GameHistoryEntry,
  GameSettings,
  LocalAppStorage,
  PlayerStatRecord,
  WordItem,
  DEFAULT_GAME_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_WORDS,
  ImportCategoriesPayloadSchema,
} from '@impostor/shared';

const STORAGE_KEY = 'impostor_app_data_v1';

export const DEFAULT_STORAGE: LocalAppStorage = {
  version: 1,
  settings: { ...DEFAULT_GAME_SETTINGS },
  customCategories: [],
  customWords: [],
  stats: {
    gamesPlayed: 0,
    normalWins: 0,
    impostorWins: 0,
    players: {},
  },
  history: [],
  recentWords: [],
  recentImpostors: [],
  preferences: {
    soundEnabled: true,
    reducedMotion: false,
  },
};

export class StorageService {
  public static load(): LocalAppStorage {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_STORAGE;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STORAGE;

      const parsed = JSON.parse(raw);
      // Validación básica de versión y estructura
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        return DEFAULT_STORAGE;
      }

      return {
        ...DEFAULT_STORAGE,
        ...parsed,
        settings: { ...DEFAULT_STORAGE.settings, ...(parsed.settings || {}) },
        preferences: { ...DEFAULT_STORAGE.preferences, ...(parsed.preferences || {}) },
        stats: { ...DEFAULT_STORAGE.stats, ...(parsed.stats || {}) },
      };
    } catch (err) {
      console.warn('[StorageService] Error al leer localStorage, utilizando valores por defecto:', err);
      return DEFAULT_STORAGE;
    }
  }

  public static save(data: LocalAppStorage): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('[StorageService] Error al guardar en localStorage:', err);
      return false;
    }
  }

  public static updatePreferences(prefs: Partial<LocalAppStorage['preferences']>): void {
    const current = this.load();
    current.preferences = { ...current.preferences, ...prefs };
    this.save(current);
  }

  public static recordGameResult(summary: GameEndSummary): void {
    const current = this.load();

    // Evitar registrar la misma partida dos veces por timestamp
    const alreadyRecorded = current.history.some(
      (h) => h.date === new Date(summary.timestamp).toISOString() && h.secretWord === summary.secretWord
    );
    if (alreadyRecorded) return;

    current.stats.gamesPlayed++;
    if (summary.winner === 'normals') {
      current.stats.normalWins++;
    } else {
      current.stats.impostorWins++;
    }

    // Actualizar estadísticas por jugador
    for (const p of summary.players) {
      const pName = p.name.trim();
      const existing: PlayerStatRecord = current.stats.players[pName] || {
        name: pName,
        gamesPlayed: 0,
        timesImpostor: 0,
        impostorWins: 0,
        normalWins: 0,
        timesCaught: 0,
        votesReceived: 0,
        currentStreak: 0,
        bestStreak: 0,
      };

      existing.gamesPlayed++;

      const isImpostor = p.role === 'impostor';
      const playerWon = (isImpostor && summary.winner === 'impostors') || (!isImpostor && summary.winner === 'normals');

      if (isImpostor) {
        existing.timesImpostor++;
        if (playerWon) {
          existing.impostorWins++;
        }
        if (summary.votingResult?.eliminatedPlayerId === p.id) {
          existing.timesCaught++;
        }
      } else {
        if (playerWon) {
          existing.normalWins++;
        }
      }

      // Votos recibidos
      if (summary.votingResult?.voteCounts[p.id]) {
        existing.votesReceived += summary.votingResult.voteCounts[p.id] || 0;
      }

      // Racha
      if (playerWon) {
        existing.currentStreak++;
        if (existing.currentStreak > existing.bestStreak) {
          existing.bestStreak = existing.currentStreak;
        }
      } else {
        existing.currentStreak = 0;
      }

      current.stats.players[pName] = existing;
    }

    // Entrada de historial
    const historyEntry: GameHistoryEntry = {
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date(summary.timestamp).toISOString(),
      categoryName: summary.categoryName,
      secretWord: summary.secretWord,
      winner: summary.winner,
      reason: summary.reason,
      playerCount: summary.players.length,
      impostorCount: summary.impostorIds.length,
      impostorNames: summary.players.filter((p) => p.role === 'impostor').map((p) => p.name),
      playerNames: summary.players.map((p) => p.name),
    };

    current.history.unshift(historyEntry);
    if (current.history.length > 50) {
      current.history = current.history.slice(0, 50); // Límite de 50 partidas históricas
    }

    this.save(current);
  }

  public static clearStats(): void {
    const current = this.load();
    current.stats = {
      gamesPlayed: 0,
      normalWins: 0,
      impostorWins: 0,
      players: {},
    };
    current.history = [];
    this.save(current);
  }

  public static exportCategories(): string {
    const current = this.load();
    const payload = {
      version: 1,
      categories: [...INITIAL_CATEGORIES, ...current.customCategories],
      words: [...INITIAL_WORDS, ...current.customWords],
    };
    return JSON.stringify(payload, null, 2);
  }

  public static importCategories(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = ImportCategoriesPayloadSchema.safeParse(parsed);
      if (!validated.success) {
        return {
          success: false,
          error: `Estructura JSON inválida: ${validated.error.issues[0]?.message || 'Verifica los campos'}`,
        };
      }

      const current = this.load();
      // Filtrar palabras y categorías que no sean las iniciales para guardarlas como custom
      const initialCatIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
      const initialWordIds = new Set(INITIAL_WORDS.map((w) => w.id));

      const newCustomCats = validated.data.categories.filter((c) => !initialCatIds.has(c.id));
      const newCustomWords = validated.data.words.filter((w) => !initialWordIds.has(w.id));

      current.customCategories = newCustomCats;
      current.customWords = newCustomWords;
      this.save(current);

      return {
        success: true,
        count: newCustomWords.length,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al parsear el archivo JSON.',
      };
    }
  }

  public static resetToDefaultCategories(): void {
    const current = this.load();
    current.customCategories = [];
    current.customWords = [];
    this.save(current);
  }
}
