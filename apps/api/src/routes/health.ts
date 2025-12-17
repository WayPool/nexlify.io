/**
 * Health check routes.
 */

import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

healthRoutes.get('/ready', (_req, res) => {
  // TODO: Check database connection, redis, etc.
  res.json({
    status: 'ready',
    checks: {
      database: true,
      cache: true,
    },
  });
});

healthRoutes.get('/live', (_req, res) => {
  res.json({ status: 'live' });
});
