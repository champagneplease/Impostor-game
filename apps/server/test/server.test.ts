import http from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RoomManager } from '../src/rooms/RoomManager.js';
import { registerSocketHandlers } from '../src/sockets/socketHandlers.js';
import { createHttpRouter } from '../src/http/routes.js';
import { RoomState, SecretRoleAssignment } from '@impostor/shared';

describe('Servidor del Impostor y Pruebas de Integración Multijugador', () => {
  let server: http.Server;
  let ioServer: Server;
  let roomManager: RoomManager;
  let port: number;
  let serverUrl: string;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    roomManager = new RoomManager();
    app.use(createHttpRouter(roomManager));

    ioServer = new Server(server, {
      cors: { origin: '*' },
    });

    ioServer.on('connection', (socket) => {
      registerSocketHandlers(ioServer, socket, roomManager);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        port = typeof addr === 'object' && addr ? addr.port : 3001;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    ioServer.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('debe responder correctamente al endpoint HTTP /health', async () => {
    const res = await fetch(`${serverUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('impostor-server');
    expect(data.activeRooms).toBeGreaterThanOrEqual(0);
  });

  it('debe permitir crear una sala y devolver código y token de anfitrión', async () => {
    const client = ClientSocket(serverUrl, { autoConnect: true });

    const createResponse = await new Promise<{ success: boolean; code?: string; token?: string }>((resolve) => {
      client.emit('room:create', { playerName: 'Anfitrión' }, (res: any) => resolve(res));
    });

    expect(createResponse.success).toBe(true);
    expect(createResponse.code).toHaveLength(6);
    expect(createResponse.token).toBeDefined();

    client.disconnect();
  });

  it('debe rechazar nombres duplicados en la misma sala', async () => {
    const client1 = ClientSocket(serverUrl);
    const client2 = ClientSocket(serverUrl);

    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { playerName: 'Martín' }, resolve);
    });

    const joinRes = await new Promise<any>((resolve) => {
      client2.emit('room:join', { code: createRes.code, playerName: 'Martín' }, resolve);
    });

    expect(joinRes.success).toBe(false);
    expect(joinRes.error).toContain('Ya existe');

    client1.disconnect();
    client2.disconnect();
  });

  it('debe soportar reconexión con token y mantener la identidad del jugador', async () => {
    const client1 = ClientSocket(serverUrl);
    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { playerName: 'Lucas' }, resolve);
    });

    const client2 = ClientSocket(serverUrl);
    const joinRes = await new Promise<any>((resolve) => {
      client2.emit('room:join', { code: createRes.code, playerName: 'Camila' }, resolve);
    });

    expect(joinRes.token).toBeDefined();
    const camilaToken = joinRes.token;

    // Desconectar cliente 2
    client2.disconnect();

    // Reconectar cliente 2 con el mismo token en un nuevo socket
    const client2Reconnected = ClientSocket(serverUrl);
    const reconnectRes = await new Promise<any>((resolve) => {
      client2Reconnected.emit(
        'room:join',
        { code: createRes.code, playerName: 'Camila', token: camilaToken },
        resolve
      );
    });

    expect(reconnectRes.success).toBe(true);

    client1.disconnect();
    client2Reconnected.disconnect();
  });

  it('SIMULACIÓN COMPLETA CON 4 JUGADORES: Privacidad estricta, votación y resultados', async () => {
    const clients: ClientSocketType[] = [];
    const playerNames = ['Jugador_1', 'Jugador_2', 'Jugador_3', 'Jugador_4'];
    let roomCode = '';

    // 1. Conectar 4 clientes
    for (let i = 0; i < 4; i++) {
      const cli = ClientSocket(serverUrl);
      clients.push(cli);
    }

    // Cliente 0 crea la sala
    const createRes = await new Promise<any>((resolve) => {
      clients[0]!.emit('room:create', { playerName: playerNames[0] }, resolve);
    });
    expect(createRes.success).toBe(true);
    roomCode = createRes.code;

    // Clientes 1, 2, 3 se unen
    for (let i = 1; i < 4; i++) {
      const joinRes = await new Promise<any>((resolve) => {
        clients[i]!.emit('room:join', { code: roomCode, playerName: playerNames[i] }, resolve);
      });
      expect(joinRes.success).toBe(true);
    }

    // Esperar a que la sala tenga los 4 jugadores
    const room = roomManager.getRoom(roomCode)!;
    expect(room.players.size).toBe(4);

    // 2. Escuchar la asignación de roles privados
    const receivedRoles = new Map<number, SecretRoleAssignment>();
    const rolePromises = clients.map(
      (cli, idx) =>
        new Promise<void>((resolve) => {
          cli.on('game:role', (role: SecretRoleAssignment) => {
            receivedRoles.set(idx, role);
            resolve();
          });
        })
    );

    // El anfitrión inicia la partida
    clients[0]!.emit('game:start');
    await Promise.all(rolePromises);

    expect(receivedRoles.size).toBe(4);

    let impostorCount = 0;
    let normalCount = 0;
    let normalWord: string | undefined = undefined;

    for (let i = 0; i < 4; i++) {
      const role = receivedRoles.get(i)!;
      if (role.role === 'impostor') {
        impostorCount++;
        // CRÍTICO: El impostor NUNCA debe tener la palabra secreta
        expect(role.word).toBeUndefined();
      } else {
        normalCount++;
        expect(role.word).toBeDefined();
        if (!normalWord) {
          normalWord = role.word;
        } else {
          // Todos los jugadores normales deben tener exactamente la misma palabra
          expect(role.word).toBe(normalWord);
        }
      }
    }

    expect(impostorCount).toBe(1);
    expect(normalCount).toBe(3);

    // 3. Pasar a fase de debate y luego a votación
    const phaseWaitDebate = new Promise<void>((resolve) => {
      clients[0]!.once('game:phase_changed', (phase) => {
        if (phase === 'debate') resolve();
      });
    });
    clients[0]!.emit('game:next_phase'); // a debate
    await phaseWaitDebate;

    const phaseWaitVoting = new Promise<void>((resolve) => {
      clients[0]!.once('game:phase_changed', (phase) => {
        if (phase === 'voting') resolve();
      });
    });
    clients[0]!.emit('game:next_phase'); // a voting
    await phaseWaitVoting;

    // 4. Identificar el impostor y votar por él para verificar victoria
    const impostorIndex = Array.from(receivedRoles.entries()).find(
      ([, r]) => r.role === 'impostor'
    )![0];
    const impostorPlayerId = receivedRoles.get(impostorIndex)!.playerId;

    // Todos los jugadores normales votan por el impostor
    // El impostor vota por otro jugador
    const otherPlayerId = receivedRoles.get((impostorIndex + 1) % 4)!.playerId;

    // Escuchar el resultado de la votación
    const voteResultPromise = new Promise<any>((resolve) => {
      clients[0]!.once('game:vote_result', resolve);
    });

    for (let i = 0; i < 4; i++) {
      if (i === impostorIndex) {
        clients[i]!.emit('game:submit_vote', { targetId: otherPlayerId });
      } else {
        clients[i]!.emit('game:submit_vote', { targetId: impostorPlayerId });
      }
    }

    const voteResult = await voteResultPromise;
    expect(voteResult.isTie).toBe(false);
    expect(voteResult.eliminatedPlayerId).toBe(impostorPlayerId);
    expect(voteResult.isImpostorEliminated).toBe(true);

    // Desconectar todos los clientes de prueba
    for (const cli of clients) {
      cli.disconnect();
    }
  });
});
