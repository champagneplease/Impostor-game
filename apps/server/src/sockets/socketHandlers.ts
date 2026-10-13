import { Server, Socket } from 'socket.io';
import {
  GuessSubmissionSchema,
  PlayerNameSchema,
  RoomCodeSchema,
  VoteSubmissionSchema,
} from '@impostor/shared';
import { RoomManager } from '../rooms/RoomManager.js';

export function registerSocketHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  // 1. Crear Sala
  socket.on('room:create', (payload: { playerName: string }, callback) => {
    try {
      const nameParsed = PlayerNameSchema.safeParse(payload?.playerName);
      if (!nameParsed.success) {
        return callback?.({
          success: false,
          error: nameParsed.error.issues[0]?.message || 'Nombre inválido',
        });
      }

      const { room, player, token } = roomManager.createRoom(nameParsed.data, socket.id);
      socket.join(`room_${room.code}`);

      callback?.({
        success: true,
        code: room.code,
        token,
      });

      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al crear sala';
      callback?.({ success: false, error: errorMsg });
    }
  });

  // 2. Unirse a Sala
  socket.on('room:join', (payload: { code: string; playerName: string; token?: string }, callback) => {
    try {
      const codeParsed = RoomCodeSchema.safeParse(payload?.code);
      if (!codeParsed.success) {
        return callback?.({
          success: false,
          error: codeParsed.error.issues[0]?.message || 'Código de sala inválido',
        });
      }

      const nameParsed = PlayerNameSchema.safeParse(payload?.playerName);
      if (!nameParsed.success) {
        return callback?.({
          success: false,
          error: nameParsed.error.issues[0]?.message || 'Nombre inválido',
        });
      }

      const { room, player, token, isReconnect } = roomManager.joinRoom({
        code: codeParsed.data,
        playerName: nameParsed.data,
        socketId: socket.id,
        token: payload.token,
      });

      socket.join(`room_${room.code}`);

      callback?.({
        success: true,
        state: roomManager.getPublicState(room),
        token,
      });

      if (isReconnect) {
        io.to(`room_${room.code}`).emit('room:player_reconnected', player);
      } else {
        io.to(`room_${room.code}`).emit('room:player_joined', player);
      }

      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));

      // Si la partida está en curso y es reconexión, re-emitir rol privado al jugador
      if (room.phase !== 'setup') {
        const privateRole = roomManager.getPlayerRole(room, player.id);
        if (privateRole) {
          socket.emit('game:role', privateRole);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al unirse';
      callback?.({ success: false, error: errorMsg });
    }
  });

  // 3. Salir de la Sala
  socket.on('room:leave', () => {
    const { room, playerId } = roomManager.handleDisconnect(socket.id);
    if (room && playerId) {
      socket.leave(`room_${room.code}`);
      io.to(`room_${room.code}`).emit('room:player_left', playerId);
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    }
  });

  // 4. Modificar Estado Preparado (Ready)
  socket.on('room:toggle_ready', () => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (!playerId) return;

    const player = room.players.get(playerId);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    }
  });

  // 5. Actualizar Ajustes (Solo Anfitrión)
  socket.on('room:update_settings', (settings) => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (playerId !== room.hostPlayerId) {
      return socket.emit('room:error', {
        code: 'FORBIDDEN',
        message: 'Solo el anfitrión puede modificar los ajustes de la partida.',
      });
    }

    try {
      roomManager.updateSettings(room, settings);
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    } catch (err: unknown) {
      socket.emit('room:error', {
        code: 'INVALID_SETTINGS',
        message: err instanceof Error ? err.message : 'Ajustes inválidos',
      });
    }
  });

  // 6. Iniciar Partida (Solo Anfitrión)
  socket.on('game:start', () => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (playerId !== room.hostPlayerId) {
      return socket.emit('room:error', {
        code: 'FORBIDDEN',
        message: 'Solo el anfitrión puede iniciar la partida.',
      });
    }

    try {
      roomManager.startGame(room);

      // Enviar a cada socket individualmente su rol privado
      for (const [pId, p] of room.players.entries()) {
        const pSocketId = room.playerToSocketId.get(pId);
        if (pSocketId) {
          const role = roomManager.getPlayerRole(room, pId);
          if (role) {
            io.to(pSocketId).emit('game:role', role);
          }
        }
      }

      io.to(`room_${room.code}`).emit('game:phase_changed', 'role_reveal');
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    } catch (err: unknown) {
      socket.emit('room:error', {
        code: 'CANNOT_START',
        message: err instanceof Error ? err.message : 'No se pudo iniciar la partida',
      });
    }
  });

  // 7. Solicitar Rol Privado (Revalidación bajo demanda)
  socket.on('game:request_role', (callback) => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return callback?.({ error: 'No estás en una sala' });
    const room = roomManager.getRoom(code);
    if (!room) return callback?.({ error: 'Sala inexistente' });

    const playerId = room.socketToPlayerId.get(socket.id);
    if (!playerId) return callback?.({ error: 'Jugador no identificado' });

    const role = roomManager.getPlayerRole(room, playerId);
    if (!role) return callback?.({ error: 'Rol no asignado todavía' });

    callback?.(role);
  });

  // 8. Avanzar a Siguiente Fase (Solo Anfitrión)
  socket.on('game:next_phase', () => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (playerId !== room.hostPlayerId) {
      return socket.emit('room:error', {
        code: 'FORBIDDEN',
        message: 'Solo el anfitrión puede cambiar de fase.',
      });
    }

    let nextPhase: string = room.phase;
    if (room.phase === 'role_reveal') {
      nextPhase = 'debate';
    } else if (room.phase === 'debate') {
      nextPhase = 'voting';
    }

    roomManager.setPhase(room, nextPhase as any);
    io.to(`room_${room.code}`).emit('game:phase_changed', nextPhase as any);
    io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
  });

  // 9. Emitir Voto
  socket.on('game:submit_vote', (payload: { targetId: string }) => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const voterId = room.socketToPlayerId.get(socket.id);
    if (!voterId) return;

    const parsed = VoteSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      return socket.emit('room:error', {
        code: 'INVALID_VOTE',
        message: 'Formato de voto inválido',
      });
    }

    try {
      const outcome = roomManager.submitVote(room, voterId, parsed.data.targetId);

      // Notificar progreso del conteo de votos (ej: 3 de 5 recibidos) sin revelar votos
      io.to(`room_${room.code}`).emit('game:vote_progress', {
        received: room.votes.size,
        total: roomManager.getPublicState(room).totalEligibleVoters,
      });

      if (outcome.allVotesReceived) {
        if (outcome.result) {
          io.to(`room_${room.code}`).emit('game:vote_result', outcome.result);
        }

        if (outcome.nextPhase === 'tie_breaker') {
          io.to(`room_${room.code}`).emit('game:phase_changed', 'tie_breaker');
        } else if (outcome.nextPhase === 'last_chance') {
          io.to(`room_${room.code}`).emit('game:phase_changed', 'last_chance');
        } else if (outcome.nextPhase === 'game_over' && outcome.endSummary) {
          io.to(`room_${room.code}`).emit('game:round_result', outcome.endSummary);
          io.to(`room_${room.code}`).emit('game:phase_changed', 'game_over');
        }
      }

      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    } catch (err: unknown) {
      socket.emit('room:error', {
        code: 'VOTE_ERROR',
        message: err instanceof Error ? err.message : 'Error al procesar voto',
      });
    }
  });

  // 10. Adivinanza de Última Oportunidad
  socket.on('game:submit_guess', (payload: { guess: string }) => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (!playerId) return;

    const parsed = GuessSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      return socket.emit('room:error', {
        code: 'INVALID_GUESS',
        message: 'Adivinanza inválida',
      });
    }

    try {
      const endSummary = roomManager.submitLastChanceGuess(room, playerId, parsed.data.guess);
      io.to(`room_${room.code}`).emit('game:round_result', endSummary);
      io.to(`room_${room.code}`).emit('game:phase_changed', 'game_over');
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    } catch (err: unknown) {
      socket.emit('room:error', {
        code: 'GUESS_ERROR',
        message: err instanceof Error ? err.message : 'Error al procesar adivinanza',
      });
    }
  });

  // 11. Revancha (Solo Anfitrión)
  socket.on('game:rematch', () => {
    const code = findRoomCodeForSocket(socket, roomManager);
    if (!code) return;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const playerId = room.socketToPlayerId.get(socket.id);
    if (playerId !== room.hostPlayerId) {
      return socket.emit('room:error', {
        code: 'FORBIDDEN',
        message: 'Solo el anfitrión puede solicitar la revancha.',
      });
    }

    roomManager.prepareRematch(room);
    io.to(`room_${room.code}`).emit('game:phase_changed', 'setup');
    io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
  });

  // 12. Desconexión de Socket
  socket.on('disconnect', () => {
    const { room, playerId } = roomManager.handleDisconnect(socket.id);
    if (room && playerId) {
      io.to(`room_${room.code}`).emit('room:player_left', playerId);
      io.to(`room_${room.code}`).emit('room:state', roomManager.getPublicState(room));
    }
  });
}

function findRoomCodeForSocket(socket: Socket, roomManager: RoomManager): string | undefined {
  for (const r of socket.rooms) {
    if (r.startsWith('room_')) {
      return r.replace('room_', '');
    }
  }
  return undefined;
}
