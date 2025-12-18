/**
 * Security middleware for protection against common attacks.
 *
 * Features:
 * - Brute force protection for login endpoints
 * - Rate limiting per endpoint category
 * - IP-based blocking for repeated failures
 * - Request size limits
 * - Security headers
 *
 * Note: Does NOT block search engine bots or AI crawlers
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// In-memory store for login attempts (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();
const ipBlacklist = new Set<string>();

// Configuration
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes after max attempts
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Clean up every hour

// Known good bot user agents (for SEO - do not block these)
const ALLOWED_BOTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp', // Yahoo
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'applebot',
  'pinterestbot',
  'redditbot',
  // AI crawlers
  'gptbot',
  'chatgpt',
  'claudebot',
  'anthropic',
  'perplexitybot',
  'bytespider',
  'ccbot',
  'cohere-ai',
];

/**
 * Check if the request is from a known good bot
 */
function isAllowedBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return ALLOWED_BOTS.some((bot) => ua.includes(bot));
}

/**
 * Get client IP address, handling proxies
 */
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded : forwarded[0];
    return ips.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Periodic cleanup of old login attempts
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    // Remove entries older than the window + block duration
    if (now - data.lastAttempt > LOGIN_WINDOW_MS + LOGIN_BLOCK_DURATION_MS) {
      loginAttempts.delete(key);
    }
    // Unblock IPs after block duration
    if (data.blockedUntil && now > data.blockedUntil) {
      data.blockedUntil = undefined;
      data.count = 0;
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Check if an IP is blocked due to too many failed attempts
 */
export function isIPBlocked(ip: string): boolean {
  const data = loginAttempts.get(ip);
  if (!data) return false;

  if (data.blockedUntil && Date.now() < data.blockedUntil) {
    return true;
  }

  return false;
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(ip: string, email?: string): void {
  const now = Date.now();
  const key = ip;

  const data = loginAttempts.get(key) || { count: 0, lastAttempt: now };

  // Reset if outside window
  if (now - data.lastAttempt > LOGIN_WINDOW_MS) {
    data.count = 0;
  }

  data.count += 1;
  data.lastAttempt = now;

  // Block IP if max attempts exceeded
  if (data.count >= LOGIN_MAX_ATTEMPTS) {
    data.blockedUntil = now + LOGIN_BLOCK_DURATION_MS;
    logger.warn('IP blocked due to too many failed login attempts', {
      ip,
      email,
      attempts: data.count,
      blockedUntil: new Date(data.blockedUntil).toISOString(),
    });
  }

  loginAttempts.set(key, data);
}

/**
 * Record a successful login (resets the counter)
 */
export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Middleware to check for blocked IPs on login routes
 */
export function bruteForceProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip check for allowed bots
  if (isAllowedBot(req.headers['user-agent'])) {
    return next();
  }

  const ip = getClientIP(req);

  if (isIPBlocked(ip)) {
    const data = loginAttempts.get(ip);
    const retryAfter = data?.blockedUntil
      ? Math.ceil((data.blockedUntil - Date.now()) / 1000)
      : LOGIN_BLOCK_DURATION_MS / 1000;

    logger.warn('Blocked request from IP due to brute force protection', { ip, path: req.path });

    res.status(429).json({
      error: 'Too many failed attempts',
      message: 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.',
      retry_after: retryAfter,
    });
    return;
  }

  next();
}

/**
 * Rate limiter for authentication endpoints (stricter)
 * Allows bots to pass through
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isAllowedBot(req.headers['user-agent']),
  message: {
    error: 'Too many authentication attempts',
    message: 'Demasiados intentos de autenticación. Por favor, espera 15 minutos.',
  },
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { ip: getClientIP(req), path: req.path });
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Demasiados intentos de autenticación. Por favor, espera 15 minutos.',
    });
  },
});

/**
 * Rate limiter for public form submissions (investor inquiries, etc.)
 * Allows bots to pass through for SEO
 */
export const formSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isAllowedBot(req.headers['user-agent']),
  message: {
    error: 'Too many submissions',
    message: 'Has enviado demasiadas solicitudes. Por favor, intenta más tarde.',
  },
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    logger.warn('Form submission rate limit exceeded', { ip: getClientIP(req), path: req.path });
    res.status(429).json({
      error: 'Too many submissions',
      message: 'Has enviado demasiadas solicitudes. Por favor, intenta más tarde.',
    });
  },
});

/**
 * Rate limiter for sensitive operations (password reset, etc.)
 */
export const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isAllowedBot(req.headers['user-agent']),
  message: {
    error: 'Too many requests',
    message: 'Has excedido el límite de solicitudes. Por favor, intenta más tarde.',
  },
  keyGenerator: (req) => getClientIP(req),
});

/**
 * Rate limiter for file uploads (Data Room)
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isAllowedBot(req.headers['user-agent']),
  message: {
    error: 'Too many uploads',
    message: 'Has subido demasiados archivos. Por favor, espera un momento.',
  },
  keyGenerator: (req) => getClientIP(req),
});

/**
 * General API rate limiter (less strict, allows bots)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isAllowedBot(req.headers['user-agent']),
  message: {
    error: 'Too many requests',
    message: 'Demasiadas solicitudes. Por favor, reduce la frecuencia.',
  },
  keyGenerator: (req) => getClientIP(req),
});

/**
 * Security headers middleware (compatible with SEO)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking (but allow embedding from same origin)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection (legacy, but doesn't hurt)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy (allows SEO tracking)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self)'
  );

  next();
}

/**
 * Request validation middleware
 * Checks for suspicious patterns in requests
 */
export function requestValidation(req: Request, res: Response, next: NextFunction): void {
  // Skip validation for allowed bots
  if (isAllowedBot(req.headers['user-agent'])) {
    return next();
  }

  // Check for SQL injection patterns in query params
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL meta-characters
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // SQL injection
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // SQL OR
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))/i, // XSS img
  ];

  const queryString = JSON.stringify(req.query);
  const bodyString = typeof req.body === 'object' ? JSON.stringify(req.body) : '';

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(queryString) || pattern.test(bodyString)) {
      logger.warn('Suspicious request pattern detected', {
        ip: getClientIP(req),
        path: req.path,
        method: req.method,
        pattern: pattern.toString(),
      });

      res.status(400).json({
        error: 'Invalid request',
        message: 'La solicitud contiene caracteres no válidos.',
      });
      return;
    }
  }

  next();
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'warn'
): void {
  logger[level](`[SECURITY] ${event}`, details);
}

export default {
  bruteForceProtection,
  authRateLimiter,
  formSubmissionLimiter,
  sensitiveOpLimiter,
  uploadLimiter,
  apiRateLimiter,
  securityHeaders,
  requestValidation,
  recordFailedLogin,
  recordSuccessfulLogin,
  isIPBlocked,
  logSecurityEvent,
};
