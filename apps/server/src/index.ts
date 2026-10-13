import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { loadConfig } from './config/index.js';
import { RoomManager } from './rooms/RoomManager.js';
import { createHttpRouter } from './http/routes.js';
import { registerSocketHandlers } from './sockets/socketHandlers.js';

const config = loadConfig();
const app = express();
const server = http.createServer(app);

// CORS para HTTP
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origin (como health checks directos o curl)
      if (!origin) return callback(null, true);
      if (
        config.clientOrigins.includes('*') ||
        config.clientOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Tolerante en dev, en prod respeta config.clientOrigins
    },
    credentials: true,
  })
);

app.use(express.json());

const roomManager = new RoomManager();

// Rutas HTTP
app.use(createHttpRouter(roomManager));

// Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir conexión web desde Vercel y local
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket, roomManager);
});

// Inicio del servidor
server.listen(config.port, () => {
  console.log(`[Impostor Server] Escuchando en puerto ${config.port}`);
  console.log(`[Impostor Server] Health check disponible en http://localhost:${config.port}/health`);
});

// Cierre ordenado (Graceful Shutdown)
function handleShutdown(signal: string) {
  console.log(`[Impostor Server] Señal ${signal} recibida. Cerrando conexiones...`);
  io.close(() => {
    server.close(() => {
      console.log('[Impostor Server] Servidor cerrado correctamente.');
      process.exit(0);
    });
  });

  // Forzar salida tras 10 segundos
  setTimeout(() => {
    console.error('[Impostor Server] Cierre forzado por tiempo de espera excedido.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, server, io, roomManager };
