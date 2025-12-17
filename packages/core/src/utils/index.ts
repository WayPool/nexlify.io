/**
 * Core Utilities
 *
 * Common utility functions used across the platform.
 */

import { createHash } from 'crypto';

// =============================================================================
// Hashing Utilities
// =============================================================================

/**
 * Create SHA-256 hash of data
 */
export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Create canonical JSON string (deterministic)
 */
export function canonicalJson(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

/**
 * Hash an object using canonical JSON
 */
export function hashObject(obj: unknown): string {
  return sha256(canonicalJson(obj));
}

// =============================================================================
// Merkle Tree
// =============================================================================

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

/**
 * Build a Merkle tree from leaf hashes
 */
export function buildMerkleTree(hashes: string[]): MerkleTree {
  if (hashes.length === 0) {
    return { root: '', leaves: [], layers: [] };
  }

  const layers: string[][] = [hashes];

  while (layers[layers.length - 1].length > 1) {
    const currentLayer = layers[layers.length - 1];
    const nextLayer: string[] = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = currentLayer[i + 1] ?? left; // Duplicate last if odd
      nextLayer.push(sha256(left + right));
    }

    layers.push(nextLayer);
  }

  return {
    root: layers[layers.length - 1][0],
    leaves: hashes,
    layers,
  };
}

/**
 * Get proof for a leaf in the Merkle tree
 */
export function getMerkleProof(tree: MerkleTree, leafIndex: number): string[] {
  if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
    return [];
  }

  const proof: string[] = [];
  let index = leafIndex;

  for (let i = 0; i < tree.layers.length - 1; i++) {
    const layer = tree.layers[i];
    const isLeft = index % 2 === 0;
    const siblingIndex = isLeft ? index + 1 : index - 1;

    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Verify a Merkle proof
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string,
  leafIndex: number
): boolean {
  let hash = leaf;
  let index = leafIndex;

  for (const sibling of proof) {
    const isLeft = index % 2 === 0;
    hash = isLeft ? sha256(hash + sibling) : sha256(sibling + hash);
    index = Math.floor(index / 2);
  }

  return hash === root;
}

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Get ISO string for current time
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Add duration to date
 */
export function addDuration(
  date: Date,
  duration: { days?: number; hours?: number; minutes?: number; seconds?: number }
): Date {
  const result = new Date(date);

  if (duration.days) result.setDate(result.getDate() + duration.days);
  if (duration.hours) result.setHours(result.getHours() + duration.hours);
  if (duration.minutes) result.setMinutes(result.getMinutes() + duration.minutes);
  if (duration.seconds) result.setSeconds(result.getSeconds() + duration.seconds);

  return result;
}

/**
 * Format date for display (ISO without timezone)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Convert string to slug (URL-safe)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + '...';
}

/**
 * Mask sensitive data (show only last N characters)
 */
export function maskSensitive(text: string, visibleChars: number = 4): string {
  if (text.length <= visibleChars) return '****';
  return '*'.repeat(text.length - visibleChars) + text.slice(-visibleChars);
}

/**
 * Generate random string of specified length
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

// =============================================================================
// Object Utilities
// =============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specified keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// =============================================================================
// Array Utilities
// =============================================================================

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;

  for (const item of array) {
    const key = keyFn(item);
    if (!(key in groups)) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  return groups;
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const {
    minLength = 12,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = true,
  } = options;

  if (password.length < minLength) {
    errors.push(`validation.password.min_length`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(`validation.password.uppercase`);
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push(`validation.password.lowercase`);
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push(`validation.password.number`);
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(`validation.password.special`);
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// Async Utilities
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Execute promises with concurrency limit
 */
export async function parallelLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = fn(item).then((result) => {
      results.push(result);
    });

    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}
