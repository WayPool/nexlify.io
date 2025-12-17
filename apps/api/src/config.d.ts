/**
 * Application configuration.
 * Loaded from environment variables.
 */
import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    env: z.ZodDefault<z.ZodEnum<["development", "staging", "production"]>>;
    port: z.ZodDefault<z.ZodNumber>;
    database: z.ZodObject<{
        host: z.ZodString;
        port: z.ZodDefault<z.ZodNumber>;
        user: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        user: string;
        password: string;
        name: string;
    }, {
        host: string;
        user: string;
        password: string;
        name: string;
        port?: number | undefined;
    }>;
    jwt: z.ZodObject<{
        secret: z.ZodString;
        expires_in: z.ZodDefault<z.ZodString>;
        refresh_expires_in: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secret: string;
        expires_in: string;
        refresh_expires_in: string;
    }, {
        secret: string;
        expires_in?: string | undefined;
        refresh_expires_in?: string | undefined;
    }>;
    cors: z.ZodObject<{
        origins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        origins: string[];
    }, {
        origins?: string[] | undefined;
    }>;
    smtp: z.ZodObject<{
        host: z.ZodString;
        port: z.ZodDefault<z.ZodNumber>;
        user: z.ZodString;
        password: z.ZodString;
        from: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        user: string;
        password: string;
        from: string;
    }, {
        host: string;
        user: string;
        password: string;
        from: string;
        port?: number | undefined;
    }>;
    stripe: z.ZodObject<{
        secret_key: z.ZodString;
        webhook_secret: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secret_key: string;
        webhook_secret?: string | undefined;
    }, {
        secret_key: string;
        webhook_secret?: string | undefined;
    }>;
    google: z.ZodObject<{
        client_id: z.ZodString;
        client_secret: z.ZodString;
        callback_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        client_id: string;
        client_secret: string;
        callback_url: string;
    }, {
        client_id: string;
        client_secret: string;
        callback_url: string;
    }>;
    blockchain: z.ZodObject<{
        rpc_url: z.ZodString;
        contract_address: z.ZodString;
        private_key: z.ZodString;
        chain_id: z.ZodDefault<z.ZodNumber>;
        batch_size: z.ZodDefault<z.ZodNumber>;
        batch_interval_ms: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        rpc_url: string;
        contract_address: string;
        private_key: string;
        chain_id: number;
        batch_size: number;
        batch_interval_ms: number;
    }, {
        rpc_url: string;
        contract_address: string;
        private_key: string;
        chain_id?: number | undefined;
        batch_size?: number | undefined;
        batch_interval_ms?: number | undefined;
    }>;
    openai: z.ZodObject<{
        api_key: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        api_key?: string | undefined;
    }, {
        api_key?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    env: "development" | "staging" | "production";
    port: number;
    database: {
        port: number;
        host: string;
        user: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expires_in: string;
        refresh_expires_in: string;
    };
    cors: {
        origins: string[];
    };
    smtp: {
        port: number;
        host: string;
        user: string;
        password: string;
        from: string;
    };
    stripe: {
        secret_key: string;
        webhook_secret?: string | undefined;
    };
    google: {
        client_id: string;
        client_secret: string;
        callback_url: string;
    };
    blockchain: {
        rpc_url: string;
        contract_address: string;
        private_key: string;
        chain_id: number;
        batch_size: number;
        batch_interval_ms: number;
    };
    openai: {
        api_key?: string | undefined;
    };
}, {
    database: {
        host: string;
        user: string;
        password: string;
        name: string;
        port?: number | undefined;
    };
    jwt: {
        secret: string;
        expires_in?: string | undefined;
        refresh_expires_in?: string | undefined;
    };
    cors: {
        origins?: string[] | undefined;
    };
    smtp: {
        host: string;
        user: string;
        password: string;
        from: string;
        port?: number | undefined;
    };
    stripe: {
        secret_key: string;
        webhook_secret?: string | undefined;
    };
    google: {
        client_id: string;
        client_secret: string;
        callback_url: string;
    };
    blockchain: {
        rpc_url: string;
        contract_address: string;
        private_key: string;
        chain_id?: number | undefined;
        batch_size?: number | undefined;
        batch_interval_ms?: number | undefined;
    };
    openai: {
        api_key?: string | undefined;
    };
    env?: "development" | "staging" | "production" | undefined;
    port?: number | undefined;
}>;
export declare const config: {
    env: "development" | "staging" | "production";
    port: number;
    database: {
        port: number;
        host: string;
        user: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expires_in: string;
        refresh_expires_in: string;
    };
    cors: {
        origins: string[];
    };
    smtp: {
        port: number;
        host: string;
        user: string;
        password: string;
        from: string;
    };
    stripe: {
        secret_key: string;
        webhook_secret?: string | undefined;
    };
    google: {
        client_id: string;
        client_secret: string;
        callback_url: string;
    };
    blockchain: {
        rpc_url: string;
        contract_address: string;
        private_key: string;
        chain_id: number;
        batch_size: number;
        batch_interval_ms: number;
    };
    openai: {
        api_key?: string | undefined;
    };
};
export type Config = z.infer<typeof configSchema>;
export {};
//# sourceMappingURL=config.d.ts.map