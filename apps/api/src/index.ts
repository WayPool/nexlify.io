/**
 * @platform/api
 *
 * Main API server entry point.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';
import { auditMiddleware } from './middleware/audit.js';

// Routes
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { tenantRoutes } from './routes/tenants.js';
import { riskRoutes } from './routes/risks.js';
import { moduleRoutes } from './routes/modules.js';
import { auditRoutes } from './routes/audit.js';
import { billingRoutes } from './routes/billing.js';
import { healthRoutes } from './routes/health.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { bankingRoutes } from './routes/banking.js';

const app = express();

// Trust proxy for proper IP detection behind reverse proxy (Plesk/nginx)
app.set('trust proxy', 1);

// =============================================================================
// Security Middleware
// =============================================================================

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// =============================================================================
// Body Parsing
// =============================================================================

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// Request Logging
// =============================================================================

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
    });
  });
  next();
});

// =============================================================================
// Routes
// =============================================================================

// Health check (no auth)
app.use('/api/health', healthRoutes);

// Auth routes (no auth required for login/register)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authMiddleware, auditMiddleware, userRoutes);
app.use('/api/tenants', authMiddleware, auditMiddleware, tenantRoutes);
app.use('/api/risks', authMiddleware, auditMiddleware, riskRoutes);
app.use('/api/modules', authMiddleware, auditMiddleware, moduleRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
// Billing routes - webhook is public, other routes have their own auth
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/banking', bankingRoutes);

// Module API routes (dynamically registered)
// These are mounted at /api/modules/:moduleId/...

// =============================================================================
// Error Handling
// =============================================================================

app.use(errorHandler);

// =============================================================================
// Server Start
// =============================================================================

const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`API server started`, {
    port: PORT,
    env: config.env,
  });
});

export { app };
