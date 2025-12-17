/**
 * Core Utilities
 *
 * Common utility functions used across the platform.
 */
/**
 * Create SHA-256 hash of data
 */
export declare function sha256(data: string | Buffer): string;
/**
 * Create canonical JSON string (deterministic)
 */
export declare function canonicalJson(obj: unknown): string;
/**
 * Hash an object using canonical JSON
 */
export declare function hashObject(obj: unknown): string;
export interface MerkleTree {
    root: string;
    leaves: string[];
    layers: string[][];
}
/**
 * Build a Merkle tree from leaf hashes
 */
export declare function buildMerkleTree(hashes: string[]): MerkleTree;
/**
 * Get proof for a leaf in the Merkle tree
 */
export declare function getMerkleProof(tree: MerkleTree, leafIndex: number): string[];
/**
 * Verify a Merkle proof
 */
export declare function verifyMerkleProof(leaf: string, proof: string[], root: string, leafIndex: number): boolean;
/**
 * Get ISO string for current time
 */
export declare function nowISO(): string;
/**
 * Add duration to date
 */
export declare function addDuration(date: Date, duration: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}): Date;
/**
 * Format date for display (ISO without timezone)
 */
export declare function formatDate(date: Date | string): string;
/**
 * Format datetime for display
 */
export declare function formatDateTime(date: Date | string): string;
/**
 * Convert string to slug (URL-safe)
 */
export declare function slugify(text: string): string;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(text: string, length: number): string;
/**
 * Mask sensitive data (show only last N characters)
 */
export declare function maskSensitive(text: string, visibleChars?: number): string;
/**
 * Generate random string of specified length
 */
export declare function randomString(length: number): string;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Pick specified keys from object
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specified keys from object
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Check if object is empty
 */
export declare function isEmpty(obj: object): boolean;
/**
 * Chunk array into smaller arrays
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Remove duplicates from array
 */
export declare function unique<T>(array: T[]): T[];
/**
 * Group array by key
 */
export declare function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]>;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate UUID format
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * Validate password strength
 */
export declare function validatePassword(password: string, options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
}): {
    valid: boolean;
    errors: string[];
};
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry async function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
}): Promise<T>;
/**
 * Execute promises with concurrency limit
 */
export declare function parallelLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]>;
//# sourceMappingURL=index.d.ts.map