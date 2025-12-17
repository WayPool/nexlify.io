"use strict";
/**
 * Database connection and client export.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const config_js_1 = require("../config.js");
// Create MySQL connection pool
const pool = promise_1.default.createPool({
    host: config_js_1.config.database.host,
    port: config_js_1.config.database.port,
    user: config_js_1.config.database.user,
    password: config_js_1.config.database.password,
    database: config_js_1.config.database.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.pool = pool;
// Create Drizzle instance
exports.db = (0, mysql2_1.drizzle)(pool);
//# sourceMappingURL=index.js.map