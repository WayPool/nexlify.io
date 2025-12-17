"use strict";
/**
 * Application configuration.
 * Loaded from environment variables.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    env: zod_1.z.enum(['development', 'staging', 'production']).default('development'),
    port: zod_1.z.coerce.number().default(3001),
    // Database
    database: zod_1.z.object({
        host: zod_1.z.string(),
        port: zod_1.z.coerce.number().default(3306),
        user: zod_1.z.string(),
        password: zod_1.z.string(),
        name: zod_1.z.string(),
    }),
    // JWT
    jwt: zod_1.z.object({
        secret: zod_1.z.string().min(32),
        expires_in: zod_1.z.string().default('24h'),
        refresh_expires_in: zod_1.z.string().default('7d'),
    }),
    // CORS
    cors: zod_1.z.object({
        origins: zod_1.z.array(zod_1.z.string()).default(['http://localhost:3000']),
    }),
    // SMTP
    smtp: zod_1.z.object({
        host: zod_1.z.string(),
        port: zod_1.z.coerce.number().default(587),
        user: zod_1.z.string(),
        password: zod_1.z.string(),
        from: zod_1.z.string(),
    }),
    // Stripe
    stripe: zod_1.z.object({
        secret_key: zod_1.z.string(),
        webhook_secret: zod_1.z.string().optional(),
    }),
    // Google OAuth
    google: zod_1.z.object({
        client_id: zod_1.z.string(),
        client_secret: zod_1.z.string(),
        callback_url: zod_1.z.string(),
    }),
    // Blockchain
    blockchain: zod_1.z.object({
        rpc_url: zod_1.z.string(),
        contract_address: zod_1.z.string(),
        private_key: zod_1.z.string(),
        chain_id: zod_1.z.coerce.number().default(1),
        batch_size: zod_1.z.coerce.number().default(100),
        batch_interval_ms: zod_1.z.coerce.number().default(60000),
    }),
    // OpenAI (for AI features)
    openai: zod_1.z.object({
        api_key: zod_1.z.string().optional(),
    }),
});
function loadConfig() {
    const rawConfig = {
        env: process.env.NODE_ENV,
        port: process.env.PORT,
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            name: process.env.DB_NAME || 'platform',
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-32chars',
            expires_in: process.env.JWT_EXPIRES_IN,
            refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
        },
        cors: {
            origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        },
        smtp: {
            host: process.env.SMTP_HOST || 'localhost',
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER || '',
            password: process.env.SMTP_PASSWORD || '',
            from: process.env.SMTP_FROM || 'noreply@platform.local',
        },
        stripe: {
            secret_key: process.env.STRIPE_SECRET_KEY || '',
            webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        },
        google: {
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            callback_url: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        blockchain: {
            rpc_url: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
            contract_address: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
            private_key: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
            chain_id: process.env.BLOCKCHAIN_CHAIN_ID,
            batch_size: process.env.BLOCKCHAIN_BATCH_SIZE,
            batch_interval_ms: process.env.BLOCKCHAIN_BATCH_INTERVAL_MS,
        },
        openai: {
            api_key: process.env.OPENAI_API_KEY,
        },
    };
    return configSchema.parse(rawConfig);
}
exports.config = loadConfig();
//# sourceMappingURL=config.js.map