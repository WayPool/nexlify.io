"use strict";
/**
 * Health check routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
exports.healthRoutes = (0, express_1.Router)();
exports.healthRoutes.get('/', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
    });
});
exports.healthRoutes.get('/ready', (_req, res) => {
    // TODO: Check database connection, redis, etc.
    res.json({
        status: 'ready',
        checks: {
            database: true,
            cache: true,
        },
    });
});
exports.healthRoutes.get('/live', (_req, res) => {
    res.json({ status: 'live' });
});
//# sourceMappingURL=health.js.map