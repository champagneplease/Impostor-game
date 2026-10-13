import { io } from 'socket.io-client';
export class SocketService {
    socket = null;
    status = 'idle';
    statusListeners = new Set();
    wakeUpTimer = null;
    getStatus() {
        return this.status;
    }
    subscribeStatus(listener) {
        this.statusListeners.add(listener);
        listener(this.status);
        return () => this.statusListeners.delete(listener);
    }
    setStatus(newStatus) {
        this.status = newStatus;
        this.statusListeners.forEach((l) => l(newStatus));
    }
    connect() {
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
                const socketInstance = io(apiUrl, {
                    transports: ['websocket', 'polling'],
                    timeout: 25000,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1500,
                });
                this.socket = socketInstance;
                socketInstance.on('connect', () => {
                    if (this.wakeUpTimer)
                        clearTimeout(this.wakeUpTimer);
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
            }
            catch (err) {
                if (this.wakeUpTimer)
                    clearTimeout(this.wakeUpTimer);
                this.setStatus('error');
                reject(err);
            }
        });
    }
    disconnect() {
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
    getSocket() {
        return this.socket;
    }
    saveReconnectToken(roomCode, token) {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.setItem(`impostor_token_${roomCode.toUpperCase()}`, token);
            }
        }
        catch { }
    }
    getReconnectToken(roomCode) {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return sessionStorage.getItem(`impostor_token_${roomCode.toUpperCase()}`) || undefined;
            }
        }
        catch { }
        return undefined;
    }
    clearReconnectToken(roomCode) {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.removeItem(`impostor_token_${roomCode.toUpperCase()}`);
            }
        }
        catch { }
    }
}
export const socketService = new SocketService();
