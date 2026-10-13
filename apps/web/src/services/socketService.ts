import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  RoomState,
  SecretRoleAssignment,
  ServerToClientEvents,
  VotingResult,
  GameEndSummary,
  Player,
} from '@impostor/shared';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'waking_up';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class SocketService {
  private socket: TypedSocket | null = null;
  private status: ConnectionStatus = 'idle';
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private wakeUpTimer: NodeJS.Timeout | null = null;

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public subscribeStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((l) => l(newStatus));
  }

  public connect(): Promise<TypedSocket> {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.socket) {
      this.disconnect();
    }

    this.setStatus('connecting');

    // Temporizador de 4 segundos: Si Render está en reposo (plan gratuito/suspendido), notificar al usuario
    this.wakeUpTimer = setTimeout(() => {
      if (this.status === 'connecting') {
        this.setStatus('waking_up');
      }
    }, 3500);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    return new Promise((resolve, reject) => {
      try {
        const socketInstance: TypedSocket = io(apiUrl, {
          transports: ['websocket', 'polling'],
          timeout: 25000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1500,
        });

        this.socket = socketInstance;

        socketInstance.on('connect', () => {
          if (this.wakeUpTimer) clearTimeout(this.wakeUpTimer);
          this.setStatus('connected');
          resolve(socketInstance);
        });

        socketInstance.on('connect_error', (err) => {
          console.warn('[SocketService] Error de conexión:', err.message);
          this.setStatus('error');
          // No rechazamos inmediatamente para permitir reintentos automáticos
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('[SocketService] Desconectado:', reason);
          this.setStatus('disconnected');
        });
      } catch (err) {
        if (this.wakeUpTimer) clearTimeout(this.wakeUpTimer);
        this.setStatus('error');
        reject(err);
      }
    });
  }

  public disconnect(): void {
    if (this.wakeUpTimer) {
      clearTimeout(this.wakeUpTimer);
      this.wakeUpTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.setStatus('idle');
  }

  public getSocket(): TypedSocket | null {
    return this.socket;
  }

  public saveReconnectToken(roomCode: string, token: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(`impostor_token_${roomCode.toUpperCase()}`, token);
      }
    } catch {}
  }

  public getReconnectToken(roomCode: string): string | undefined {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem(`impostor_token_${roomCode.toUpperCase()}`) || undefined;
      }
    } catch {}
    return undefined;
  }

  public clearReconnectToken(roomCode: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(`impostor_token_${roomCode.toUpperCase()}`);
      }
    } catch {}
  }
}

export const socketService = new SocketService();
