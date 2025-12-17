/**
 * Database migration runner.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { config } from '../config.js';

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

interface MigrationRecord {
  id: number;
  name: string;
  executed_at: Date;
}

async function createMigrationsTable(connection: mysql.Connection): Promise<void> {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getExecutedMigrations(connection: mysql.Connection): Promise<string[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    'SELECT name FROM _migrations ORDER BY id'
  );
  return rows.map((row) => row.name);
}

async function recordMigration(connection: mysql.Connection, name: string): Promise<void> {
  await connection.execute('INSERT INTO _migrations (name) VALUES (?)', [name]);
}

async function runMigrations(): Promise<void> {
  console.log('Connecting to database...');

  const connection = await mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    multipleStatements: true,
  });

  try {
    console.log('Creating migrations table if not exists...');
    await createMigrationsTable(connection);

    console.log('Getting executed migrations...');
    const executedMigrations = await getExecutedMigrations(connection);

    console.log('Reading migration files...');
    const migrationFiles = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const pendingMigrations = migrationFiles.filter(
      (file) => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations.`);

    for (const migrationFile of pendingMigrations) {
      console.log(`Running migration: ${migrationFile}...`);

      const sql = readFileSync(join(MIGRATIONS_DIR, migrationFile), 'utf-8');

      await connection.execute(sql);
      await recordMigration(connection, migrationFile);

      console.log(`Migration ${migrationFile} completed.`);
    }

    console.log('All migrations completed successfully.');
  } finally {
    await connection.end();
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
