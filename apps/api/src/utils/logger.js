"use strict";
/**
 * Logging utility using Winston.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createModuleLogger = createModuleLogger;
const winston_1 = __importDefault(require("winston"));
const config_js_1 = require("../config.js");
const { combine, timestamp, printf, colorize, json } = winston_1.default.format;
const devFormat = combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
}));
const prodFormat = combine(timestamp(), json());
exports.logger = winston_1.default.createLogger({
    level: config_js_1.config.env === 'production' ? 'info' : 'debug',
    format: config_js_1.config.env === 'production' ? prodFormat : devFormat,
    transports: [
        new winston_1.default.transports.Console(),
        // In production, add file transports or external logging service
    ],
});
/**
 * Create a child logger with module context.
 */
function createModuleLogger(moduleId) {
    return exports.logger.child({ module: moduleId });
}
//# sourceMappingURL=logger.js.map