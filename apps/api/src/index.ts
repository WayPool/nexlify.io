/**
 * @platform/api
 *
 * Main API server entry point.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';
import { auditMiddleware } from './middleware/audit.js';
import {
  securityHeaders,
  requestValidation,
  apiRateLimiter,
  authRateLimiter,
  formSubmissionLimiter,
  bruteForceProtection,
} from './middleware/security.js';

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
import { profileRoutes } from './routes/profile.js';
import { settingsRoutes } from './routes/settings.js';
import { investorInquiriesRoutes } from './routes/investor-inquiries.js';
import { dataRoomRoutes } from './routes/data-room.js';

const app = express();

// Trust proxy for proper IP detection behind reverse proxy (Plesk/nginx)
app.set('trust proxy', 1);

// =============================================================================
// Security Middleware
// =============================================================================

// Helmet with SEO-friendly config
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding (SEO tools)
    contentSecurityPolicy: false, // Let frontend handle CSP
  })
);

// Additional security headers (SEO-friendly)
app.use(securityHeaders);

app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Request validation (detects malicious patterns)
app.use('/api/', requestValidation);

// General API rate limiting (allows bots for SEO)
app.use('/api/', apiRateLimiter);

// =============================================================================
// Body Parsing
// =============================================================================

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// No-Cache Headers for API
// =============================================================================

app.use('/api/', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

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

// Auth routes with brute force protection and stricter rate limiting
app.use('/api/auth', bruteForceProtection, authRateLimiter, authRoutes);

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
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);

// Investor inquiries (public POST for contact form, protected GET for admin)
// Apply form submission rate limiter for spam protection
app.use('/api/investor-inquiries', formSubmissionLimiter, investorInquiriesRoutes);

// Data Room (managed access for investors)
app.use('/api/data-room', dataRoomRoutes);

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
