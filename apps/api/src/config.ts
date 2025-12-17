/**
 * Application configuration.
 * Loaded from environment variables.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  env: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().default(3001),

  // Database
  database: z.object({
    host: z.string(),
    port: z.coerce.number().default(3306),
    user: z.string(),
    password: z.string(),
    name: z.string(),
  }),

  // JWT
  jwt: z.object({
    secret: z.string().min(32),
    expires_in: z.string().default('24h'),
    refresh_expires_in: z.string().default('7d'),
  }),

  // CORS
  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000']),
  }),

  // SMTP
  smtp: z.object({
    host: z.string(),
    port: z.coerce.number().default(587),
    user: z.string(),
    password: z.string(),
    from: z.string(),
  }),

  // Stripe
  stripe: z.object({
    secret_key: z.string(),
    webhook_secret: z.string().optional(),
  }),

  // Google OAuth
  google: z.object({
    client_id: z.string(),
    client_secret: z.string(),
    callback_url: z.string(),
  }),

  // Blockchain
  blockchain: z.object({
    rpc_url: z.string(),
    contract_address: z.string(),
    private_key: z.string(),
    chain_id: z.coerce.number().default(1),
    batch_size: z.coerce.number().default(100),
    batch_interval_ms: z.coerce.number().default(60000),
  }),

  // OpenAI (for AI features)
  openai: z.object({
    api_key: z.string().optional(),
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

export const config = loadConfig();
export type Config = z.infer<typeof configSchema>;
