"use strict";
/**
 * Database migration runner.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const promise_1 = __importDefault(require("mysql2/promise"));
const config_js_1 = require("../config.js");
const MIGRATIONS_DIR = (0, path_1.join)(import.meta.dirname, 'migrations');
async function createMigrationsTable(connection) {
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
async function getExecutedMigrations(connection) {
    const [rows] = await connection.execute('SELECT name FROM _migrations ORDER BY id');
    return rows.map((row) => row.name);
}
async function recordMigration(connection, name) {
    await connection.execute('INSERT INTO _migrations (name) VALUES (?)', [name]);
}
async function runMigrations() {
    console.log('Connecting to database...');
    const connection = await promise_1.default.createConnection({
        host: config_js_1.config.database.host,
        port: config_js_1.config.database.port,
        user: config_js_1.config.database.user,
        password: config_js_1.config.database.password,
        database: config_js_1.config.database.name,
        multipleStatements: true,
    });
    try {
        console.log('Creating migrations table if not exists...');
        await createMigrationsTable(connection);
        console.log('Getting executed migrations...');
        const executedMigrations = await getExecutedMigrations(connection);
        console.log('Reading migration files...');
        const migrationFiles = (0, fs_1.readdirSync)(MIGRATIONS_DIR)
            .filter((file) => file.endsWith('.sql'))
            .sort();
        const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));
        if (pendingMigrations.length === 0) {
            console.log('No pending migrations.');
            return;
        }
        console.log(`Found ${pendingMigrations.length} pending migrations.`);
        for (const migrationFile of pendingMigrations) {
            console.log(`Running migration: ${migrationFile}...`);
            const sql = (0, fs_1.readFileSync)((0, path_1.join)(MIGRATIONS_DIR, migrationFile), 'utf-8');
            await connection.execute(sql);
            await recordMigration(connection, migrationFile);
            console.log(`Migration ${migrationFile} completed.`);
        }
        console.log('All migrations completed successfully.');
    }
    finally {
        await connection.end();
    }
}
runMigrations().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map