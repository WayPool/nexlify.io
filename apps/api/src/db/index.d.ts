/**
 * Database connection and client export.
 */
import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const db: import("drizzle-orm/mysql2").MySql2Database<Record<string, never>>;
export { pool };
//# sourceMappingURL=index.d.ts.map