"use strict";
/**
 * Core Utilities
 *
 * Common utility functions used across the platform.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.canonicalJson = canonicalJson;
exports.hashObject = hashObject;
exports.buildMerkleTree = buildMerkleTree;
exports.getMerkleProof = getMerkleProof;
exports.verifyMerkleProof = verifyMerkleProof;
exports.nowISO = nowISO;
exports.addDuration = addDuration;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.slugify = slugify;
exports.truncate = truncate;
exports.maskSensitive = maskSensitive;
exports.randomString = randomString;
exports.deepClone = deepClone;
exports.pick = pick;
exports.omit = omit;
exports.isEmpty = isEmpty;
exports.chunk = chunk;
exports.unique = unique;
exports.groupBy = groupBy;
exports.isValidEmail = isValidEmail;
exports.isValidUUID = isValidUUID;
exports.validatePassword = validatePassword;
exports.sleep = sleep;
exports.retry = retry;
exports.parallelLimit = parallelLimit;
const crypto_1 = require("crypto");
// =============================================================================
// Hashing Utilities
// =============================================================================
/**
 * Create SHA-256 hash of data
 */
function sha256(data) {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
}
/**
 * Create canonical JSON string (deterministic)
 */
function canonicalJson(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}
/**
 * Hash an object using canonical JSON
 */
function hashObject(obj) {
    return sha256(canonicalJson(obj));
}
/**
 * Build a Merkle tree from leaf hashes
 */
function buildMerkleTree(hashes) {
    if (hashes.length === 0) {
        return { root: '', leaves: [], layers: [] };
    }
    const layers = [hashes];
    while (layers[layers.length - 1].length > 1) {
        const currentLayer = layers[layers.length - 1];
        const nextLayer = [];
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
function getMerkleProof(tree, leafIndex) {
    if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
        return [];
    }
    const proof = [];
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
function verifyMerkleProof(leaf, proof, root, leafIndex) {
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
function nowISO() {
    return new Date().toISOString();
}
/**
 * Add duration to date
 */
function addDuration(date, duration) {
    const result = new Date(date);
    if (duration.days)
        result.setDate(result.getDate() + duration.days);
    if (duration.hours)
        result.setHours(result.getHours() + duration.hours);
    if (duration.minutes)
        result.setMinutes(result.getMinutes() + duration.minutes);
    if (duration.seconds)
        result.setSeconds(result.getSeconds() + duration.seconds);
    return result;
}
/**
 * Format date for display (ISO without timezone)
 */
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}
/**
 * Format datetime for display
 */
function formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().replace('T', ' ').slice(0, 19);
}
// =============================================================================
// String Utilities
// =============================================================================
/**
 * Convert string to slug (URL-safe)
 */
function slugify(text) {
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
function truncate(text, length) {
    if (text.length <= length)
        return text;
    return text.slice(0, length - 3) + '...';
}
/**
 * Mask sensitive data (show only last N characters)
 */
function maskSensitive(text, visibleChars = 4) {
    if (text.length <= visibleChars)
        return '****';
    return '*'.repeat(text.length - visibleChars) + text.slice(-visibleChars);
}
/**
 * Generate random string of specified length
 */
function randomString(length) {
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
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Pick specified keys from object
 */
function pick(obj, keys) {
    const result = {};
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
function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
/**
 * Check if object is empty
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
// =============================================================================
// Array Utilities
// =============================================================================
/**
 * Chunk array into smaller arrays
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Remove duplicates from array
 */
function unique(array) {
    return [...new Set(array)];
}
/**
 * Group array by key
 */
function groupBy(array, keyFn) {
    const groups = {};
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
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Validate password strength
 */
function validatePassword(password, options = {}) {
    const errors = [];
    const { minLength = 12, requireUppercase = true, requireLowercase = true, requireNumber = true, requireSpecial = true, } = options;
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry async function with exponential backoff
 */
async function retry(fn, options = {}) {
    const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30000 } = options;
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
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
async function parallelLimit(items, limit, fn) {
    const results = [];
    const executing = [];
    for (const item of items) {
        const p = fn(item).then((result) => {
            results.push(result);
        });
        executing.push(p);
        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(executing.findIndex((e) => e === p), 1);
        }
    }
    await Promise.all(executing);
    return results;
}
//# sourceMappingURL=index.js.map