export interface ServerConfig {
  port: number;
  clientOrigins: string[];
  logLevel: string;
}

export function loadConfig(): ServerConfig {
  const port = parseInt(process.env.PORT || '3001', 10);
  const rawOrigins = process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:3000';
  const clientOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    port,
    clientOrigins,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
