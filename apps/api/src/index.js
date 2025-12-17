"use strict";
/**
 * @platform/api
 *
 * Main API server entry point.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_js_1 = require("./config.js");
const logger_js_1 = require("./utils/logger.js");
const error_handler_js_1 = require("./middleware/error-handler.js");
const auth_js_1 = require("./middleware/auth.js");
const audit_js_1 = require("./middleware/audit.js");
// Routes
const auth_js_2 = require("./routes/auth.js");
const users_js_1 = require("./routes/users.js");
const tenants_js_1 = require("./routes/tenants.js");
const risks_js_1 = require("./routes/risks.js");
const modules_js_1 = require("./routes/modules.js");
const audit_js_2 = require("./routes/audit.js");
const billing_js_1 = require("./routes/billing.js");
const health_js_1 = require("./routes/health.js");
const dashboard_js_1 = require("./routes/dashboard.js");
const banking_js_1 = require("./routes/banking.js");
const app = (0, express_1.default)();
exports.app = app;
// Trust proxy for proper IP detection behind reverse proxy (Plesk/nginx)
app.set('trust proxy', 1);
// =============================================================================
// Security Middleware
// =============================================================================
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_js_1.config.cors.origins,
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
// =============================================================================
// Body Parsing
// =============================================================================
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// =============================================================================
// Request Logging
// =============================================================================
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_js_1.logger.info('Request processed', {
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
app.use('/api/health', health_js_1.healthRoutes);
// Auth routes (no auth required for login/register)
app.use('/api/auth', auth_js_2.authRoutes);
// Protected routes
app.use('/api/users', auth_js_1.authMiddleware, audit_js_1.auditMiddleware, users_js_1.userRoutes);
app.use('/api/tenants', auth_js_1.authMiddleware, audit_js_1.auditMiddleware, tenants_js_1.tenantRoutes);
app.use('/api/risks', auth_js_1.authMiddleware, audit_js_1.auditMiddleware, risks_js_1.riskRoutes);
app.use('/api/modules', auth_js_1.authMiddleware, audit_js_1.auditMiddleware, modules_js_1.moduleRoutes);
app.use('/api/audit', auth_js_1.authMiddleware, audit_js_2.auditRoutes);
// Billing routes - webhook is public, other routes have their own auth
app.use('/api/billing', billing_js_1.billingRoutes);
app.use('/api/dashboard', dashboard_js_1.dashboardRoutes);
app.use('/api/banking', banking_js_1.bankingRoutes);
// Module API routes (dynamically registered)
// These are mounted at /api/modules/:moduleId/...
// =============================================================================
// Error Handling
// =============================================================================
app.use(error_handler_js_1.errorHandler);
// =============================================================================
// Server Start
// =============================================================================
const PORT = config_js_1.config.port || 3001;
app.listen(PORT, () => {
    logger_js_1.logger.info(`API server started`, {
        port: PORT,
        env: config_js_1.config.env,
    });
});
//# sourceMappingURL=index.js.map