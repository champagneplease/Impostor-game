import { Router } from 'express';
import { RoomManager } from '../rooms/RoomManager.js';

export function createHttpRouter(roomManager: RoomManager): Router {
  const router = Router();
  const startTime = Date.now();

  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'impostor-server',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      activeRooms: roomManager.getActiveRoomsCount(),
      connectedSockets: roomManager.getConnectedSocketsCount(),
      timestamp: Date.now(),
    });
  });

  router.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Impostor Game API Server',
      status: 'running',
      healthEndpoint: '/health',
    });
  });

  return router;
}
