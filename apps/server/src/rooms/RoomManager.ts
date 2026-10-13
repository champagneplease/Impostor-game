import crypto from 'node:crypto';
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
  generateRoomCode,
  pickRandomWordAndCategory,
  processVotes,
  verifyLastChanceGuess,
  INITIAL_CATEGORIES,
  INITIAL_WORDS,
  GAME_LIMITS,
} from '@impostor/shared';

export interface RoomInstance {
  code: string;
  hostPlayerId: string;
  players: Map<string, Player>;
  socketToPlayerId: Map<string, string>;
  playerToSocketId: Map<string, string>;
  reconnectTokens: Map<string, string>; // playerId -> token
  tokenToPlayerId: Map<string, string>; // token -> playerId
  disconnectTimeouts: Map<string, NodeJS.Timeout>;
  settings: GameSettings;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  turnOrder: string[];
  activeTurnIndex: number;
  customCategories: CategoryItem[];
  customWords: WordItem[];
  recentWordIds: string[];
  recentImpostorIds: string[];
  secretWord?: WordItem;
  selectedCategory?: CategoryItem;
  roleMap?: Map<string, PlayerRole>;
  secretAssignments?: Map<string, SecretRoleAssignment>;
  votes: Map<string, string>; // voterId -> targetId
  isSecondTie: boolean;
  tieCandidates?: string[];
  lastChancePlayerId?: string;
  endSummary?: GameEndSummary;
  createdAt: number;
  lastActivity: number;
}

export class RoomManager {
  private rooms = new Map<string, RoomInstance>();

  public createRoom(hostName: string, socketId: string): { room: RoomInstance; player: Player; token: string } {
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode(GAME_LIMITS.ROOM_CODE_LENGTH);
      attempts++;
    } while (this.rooms.has(code) && attempts < 20);

    const playerId = `p_${crypto.randomUUID().slice(0, 8)}`;
    const token = crypto.randomBytes(16).toString('hex');

    const hostPlayer: Player = {
      id: playerId,
      name: hostName,
      isHost: true,
      isConnected: true,
      isReady: true,
    };

    const room: RoomInstance = {
      code,
      hostPlayerId: playerId,
      players: new Map([[playerId, hostPlayer]]),
      socketToPlayerId: new Map([[socketId, playerId]]),
      playerToSocketId: new Map([[playerId, socketId]]),
      reconnectTokens: new Map([[playerId, token]]),
      tokenToPlayerId: new Map([[token, playerId]]),
      disconnectTimeouts: new Map(),
      settings: { ...DEFAULT_GAME_SETTINGS },
      phase: 'setup',
      currentRound: 0,
      totalRounds: 1,
      turnOrder: [],
      activeTurnIndex: 0,
      customCategories: [],
      customWords: [],
      recentWordIds: [],
      recentImpostorIds: [],
      votes: new Map(),
      isSecondTie: false,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.rooms.set(code, room);
    return { room, player: hostPlayer, token };
  }

  public getRoom(code: string): RoomInstance | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public joinRoom(params: {
    code: string;
    playerName: string;
    socketId: string;
    token?: string;
  }): { room: RoomInstance; player: Player; token: string; isReconnect: boolean } {
    const { code, playerName, socketId, token } = params;
    const room = this.getRoom(code);

    if (!room) {
      throw new Error('La sala especificada no existe.');
    }

    room.lastActivity = Date.now();

    // Comprobar reconexión por token
    if (token && room.tokenToPlayerId.has(token)) {
      const existingPlayerId = room.tokenToPlayerId.get(token)!;
      const player = room.players.get(existingPlayerId);

      if (player) {
        // Cancelar temporizador de desconexión si existía
        const timeout = room.disconnectTimeouts.get(existingPlayerId);
        if (timeout) {
          clearTimeout(timeout);
          room.disconnectTimeouts.delete(existingPlayerId);
        }

        player.isConnected = true;
        room.socketToPlayerId.set(socketId, existingPlayerId);
        room.playerToSocketId.set(existingPlayerId, socketId);

        return { room, player, token, isReconnect: true };
      }
    }

    // Unir como nuevo jugador
    if (room.phase !== 'setup') {
      throw new Error('La partida ya ha comenzado en esta sala.');
    }

    if (room.players.size >= GAME_LIMITS.MAX_PLAYERS) {
      throw new Error(`La sala está llena (máximo ${GAME_LIMITS.MAX_PLAYERS} jugadores).`);
    }

    // Comprobar nombres duplicados
    const nameTaken = Array.from(room.players.values()).some(
      (p) => p.name.trim().toLowerCase() === playerName.trim().toLowerCase()
    );
    if (nameTaken) {
      throw new Error('Ya existe un participante con ese nombre en la sala.');
    }

    const playerId = `p_${crypto.randomUUID().slice(0, 8)}`;
    const newToken = crypto.randomBytes(16).toString('hex');

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isConnected: true,
      isReady: false,
    };

    room.players.set(playerId, newPlayer);
    room.socketToPlayerId.set(socketId, playerId);
    room.playerToSocketId.set(playerId, socketId);
    room.reconnectTokens.set(playerId, newToken);
    room.tokenToPlayerId.set(newToken, playerId);

    // Ajustar playerCount en settings
    room.settings.playerCount = room.players.size;

    return { room, player: newPlayer, token: newToken, isReconnect: false };
  }

  public handleDisconnect(socketId: string): {
    room?: RoomInstance;
    playerId?: string;
    isHostLeft?: boolean;
    allDisconnected?: boolean;
  } {
    for (const room of this.rooms.values()) {
      const playerId = room.socketToPlayerId.get(socketId);
      if (!playerId) continue;

      room.socketToPlayerId.delete(socketId);
      const player = room.players.get(playerId);
      if (!player) continue;

      player.isConnected = false;
      room.lastActivity = Date.now();

      // Iniciar período de gracia para reconexión
      const timeout = setTimeout(() => {
        this.permanentlyRemovePlayer(room, playerId);
      }, GAME_LIMITS.RECONNECT_GRACE_PERIOD_MS);

      room.disconnectTimeouts.set(playerId, timeout);

      const isHostLeft = room.hostPlayerId === playerId;
      if (isHostLeft) {
        this.migrateHostIfPossible(room);
      }

      const allDisconnected = Array.from(room.players.values()).every((p) => !p.isConnected);
      return { room, playerId, isHostLeft, allDisconnected };
    }

    return {};
  }

  private migrateHostIfPossible(room: RoomInstance): void {
    const nextConnected = Array.from(room.players.values()).find(
      (p) => p.isConnected && p.id !== room.hostPlayerId
    );

    if (nextConnected) {
      const oldHost = room.players.get(room.hostPlayerId);
      if (oldHost) oldHost.isHost = false;

      nextConnected.isHost = true;
      room.hostPlayerId = nextConnected.id;
    }
  }

  public removePlayer(room: RoomInstance, playerId: string): void {
    this.permanentlyRemovePlayer(room, playerId);
  }

  private permanentlyRemovePlayer(room: RoomInstance, playerId: string): void {
    const timeout = room.disconnectTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      room.disconnectTimeouts.delete(playerId);
    }

    const socketId = room.playerToSocketId.get(playerId);
    if (socketId) {
      room.socketToPlayerId.delete(socketId);
      room.playerToSocketId.delete(playerId);
    }

    const token = room.reconnectTokens.get(playerId);
    if (token) {
      room.tokenToPlayerId.delete(token);
      room.reconnectTokens.delete(playerId);
    }

    room.players.delete(playerId);
    room.votes.delete(playerId);

    if (room.hostPlayerId === playerId) {
      this.migrateHostIfPossible(room);
    }

    // Si la sala queda sin jugadores, destruirla
    if (room.players.size === 0) {
      this.rooms.delete(room.code);
    } else {
      room.settings.playerCount = room.players.size;
    }
  }

  public updateSettings(room: RoomInstance, newSettings: Partial<GameSettings>): void {
    if (room.phase !== 'setup') {
      throw new Error('No se pueden modificar los ajustes una vez comenzada la partida.');
    }

    room.settings = {
      ...room.settings,
      ...newSettings,
      playerCount: room.players.size,
    };
    room.lastActivity = Date.now();
  }

  public startGame(room: RoomInstance): void {
    if (room.players.size < GAME_LIMITS.MIN_PLAYERS) {
      throw new Error(`Se requieren al menos ${GAME_LIMITS.MIN_PLAYERS} jugadores para comenzar.`);
    }

    if (room.settings.impostorCount >= room.players.size) {
      throw new Error('La cantidad de impostores no puede ser igual o mayor al número de participantes.');
    }

    const allCategories = [...INITIAL_CATEGORIES, ...room.customCategories];
    const allWords = [...INITIAL_WORDS, ...room.customWords];

    const { category, word } = pickRandomWordAndCategory({
      categories: allCategories,
      words: allWords,
      selectedCategoryIds: room.settings.selectedCategoryIds,
      difficulty: room.settings.difficulty,
      recentWordIds: room.recentWordIds,
    });

    const activePlayers = Array.from(room.players.values());
    const roleMap = assignPlayerRoles({
      players: activePlayers,
      impostorCount: room.settings.impostorCount,
      recentImpostorIds: room.recentImpostorIds,
    });

    const secretAssignments = buildSecretRoleAssignments({
      players: activePlayers,
      roleMap,
      secretWord: word,
      categoryName: category.name,
      settings: room.settings,
    });

    const turnOrder = determineTurnOrder(activePlayers, room.settings.turnOrderRandomized);

    // Actualizar historial reciente
    room.recentWordIds = [word.id, ...room.recentWordIds].slice(0, 15);
    const impostorIds = activePlayers
      .filter((p) => roleMap.get(p.id) === 'impostor')
      .map((p) => p.id);
    room.recentImpostorIds = [...impostorIds, ...room.recentImpostorIds].slice(0, 10);

    room.secretWord = word;
    room.selectedCategory = category;
    room.roleMap = roleMap;
    room.secretAssignments = secretAssignments;
    room.turnOrder = turnOrder;
    room.activeTurnIndex = 0;
    room.votes.clear();
    room.isSecondTie = false;
    room.tieCandidates = undefined;
    room.lastChancePlayerId = undefined;
    room.endSummary = undefined;
    room.phase = 'role_reveal';
    room.currentRound++;
    room.lastActivity = Date.now();
  }

  public setPhase(room: RoomInstance, nextPhase: GamePhase): void {
    room.phase = nextPhase;
    room.lastActivity = Date.now();

    if (nextPhase === 'voting' || nextPhase === 'tie_breaker') {
      room.votes.clear();
    }
  }

  public submitVote(room: RoomInstance, voterId: string, targetId: string): {
    allVotesReceived: boolean;
    result?: VotingResult;
    nextPhase?: GamePhase;
    endSummary?: GameEndSummary;
  } {
    if (room.phase !== 'voting' && room.phase !== 'tie_breaker') {
      throw new Error('La votación no está activa en esta fase.');
    }

    const voter = room.players.get(voterId);
    if (!voter || !voter.isConnected) {
      throw new Error('Jugador no válido para emitir voto.');
    }

    if (!room.settings.allowSelfVote && voterId === targetId) {
      throw new Error('No está permitido votarse a uno mismo según las reglas.');
    }

    // En desempate solo se puede votar a los candidatos empatados
    const eligibleTargets =
      room.phase === 'tie_breaker' && room.tieCandidates
        ? room.tieCandidates
        : Array.from(room.players.keys());

    if (!eligibleTargets.includes(targetId)) {
      throw new Error('El objetivo seleccionado no es elegible para votación.');
    }

    if (room.votes.has(voterId)) {
      throw new Error('Ya has emitido tu voto en esta ronda.');
    }

    room.votes.set(voterId, targetId);
    room.lastActivity = Date.now();

    // Comprobar si todos los jugadores conectados han votado
    const eligibleVoters = Array.from(room.players.values())
      .filter((p) => p.isConnected)
      .map((p) => p.id);

    const allVotesReceived = eligibleVoters.every((id) => room.votes.has(id));

    if (!allVotesReceived) {
      return { allVotesReceived: false };
    }

    // Procesar votos
    const impostorIds = Array.from(room.players.values())
      .filter((p) => room.roleMap?.get(p.id) === 'impostor')
      .map((p) => p.id);

    const result = processVotes({
      votes: room.votes,
      eligibleVoters,
      eligibleTargets,
      impostorIds,
    });

    if (result.isTie) {
      if (room.phase === 'tie_breaker') {
        // Segunda votación empatada: ganan los impostores
        const endSummary = evaluateGameEnd({
          players: Array.from(room.players.values()),
          roleMap: room.roleMap!,
          secretWord: room.secretWord!,
          categoryName: room.selectedCategory!.name,
          votingResult: result,
          isSecondTie: true,
        });

        room.phase = 'game_over';
        room.endSummary = endSummary;
        return { allVotesReceived: true, result, nextPhase: 'game_over', endSummary };
      }

      // Primer empate: pasar a desempate
      room.phase = 'tie_breaker';
      room.tieCandidates = result.mostVotedPlayerIds;
      room.votes.clear();
      return { allVotesReceived: true, result, nextPhase: 'tie_breaker' };
    }

    // Hubo un jugador eliminado
    if (result.eliminatedPlayerId && result.isImpostorEliminated) {
      // Si eliminaron a un impostor y está habilitada la última oportunidad
      if (room.settings.allowLastChanceGuess) {
        room.phase = 'last_chance';
        room.lastChancePlayerId = result.eliminatedPlayerId;
        return { allVotesReceived: true, result, nextPhase: 'last_chance' };
      }
    }

    // Finalizar juego normal
    const endSummary = evaluateGameEnd({
      players: Array.from(room.players.values()),
      roleMap: room.roleMap!,
      secretWord: room.secretWord!,
      categoryName: room.selectedCategory!.name,
      votingResult: result,
    });

    room.phase = 'game_over';
    room.endSummary = endSummary;
    return { allVotesReceived: true, result, nextPhase: 'game_over', endSummary };
  }

  public submitLastChanceGuess(
    room: RoomInstance,
    impostorId: string,
    guess: string
  ): GameEndSummary {
    if (room.phase !== 'last_chance') {
      throw new Error('La fase de última oportunidad no está activa.');
    }

    if (room.lastChancePlayerId !== impostorId) {
      throw new Error('Solo el impostor descubierto puede adivinar la palabra.');
    }

    const wasCorrect = verifyLastChanceGuess(guess, room.secretWord!.text);

    const fakeVotingResult: VotingResult = {
      voteCounts: {},
      mostVotedPlayerIds: [impostorId],
      isTie: false,
      eliminatedPlayerId: impostorId,
      isImpostorEliminated: true,
      remainingImpostors: [],
    };

    const endSummary = evaluateGameEnd({
      players: Array.from(room.players.values()),
      roleMap: room.roleMap!,
      secretWord: room.secretWord!,
      categoryName: room.selectedCategory!.name,
      votingResult: fakeVotingResult,
      lastChanceGuessResult: {
        impostorId,
        guess,
        wasCorrect,
      },
    });

    room.phase = 'game_over';
    room.endSummary = endSummary;
    room.lastActivity = Date.now();
    return endSummary;
  }

  public prepareRematch(room: RoomInstance): void {
    room.phase = 'setup';
    room.votes.clear();
    room.secretWord = undefined;
    room.selectedCategory = undefined;
    room.roleMap = undefined;
    room.secretAssignments = undefined;
    room.endSummary = undefined;
    room.tieCandidates = undefined;
    room.lastChancePlayerId = undefined;
    room.lastActivity = Date.now();
  }

  public getPlayerRole(room: RoomInstance, playerId: string): SecretRoleAssignment | undefined {
    return room.secretAssignments?.get(playerId);
  }

  public getPublicState(room: RoomInstance): RoomState {
    const eligibleVoters = Array.from(room.players.values()).filter((p) => p.isConnected);

    return {
      code: room.code,
      hostId: room.hostPlayerId,
      players: Array.from(room.players.values()),
      settings: room.settings,
      phase: room.phase,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      turnOrder: room.turnOrder,
      activePlayerTurnId: room.turnOrder[room.activeTurnIndex],
      votesReceivedCount: room.votes.size,
      totalEligibleVoters: eligibleVoters.length,
      tieCandidates: room.tieCandidates,
      lastChancePlayerId: room.lastChancePlayerId,
      endSummary: room.endSummary,
    };
  }

  public getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  public getConnectedSocketsCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.socketToPlayerId.size;
    }
    return count;
  }
}
