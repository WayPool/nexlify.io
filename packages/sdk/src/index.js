"use strict";
/**
 * @platform/sdk
 *
 * SDK for building platform modules.
 * Modules can ONLY depend on this package.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = exports.ModuleManifestSchema = void 0;
exports.validateManifest = validateManifest;
exports.createRiskFinding = createRiskFinding;
// =============================================================================
// Module Manifest Validation
// =============================================================================
const zod_1 = require("zod");
exports.ModuleManifestSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-z][a-z0-9-]*$/),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    name_i18n_key: zod_1.z.string(),
    description_i18n_key: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    license: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()),
    policies: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.enum(['rbac', 'abac']),
        rules: zod_1.z.record(zod_1.z.unknown()),
    })),
    db_migrations_path: zod_1.z.string(),
    risk_providers: zod_1.z.array(zod_1.z.string()),
    ui_extensions: zod_1.z.object({
        routes: zod_1.z
            .array(zod_1.z.object({
            path: zod_1.z.string(),
            component: zod_1.z.string(),
            permission: zod_1.z.string().optional(),
        }))
            .optional(),
        widgets: zod_1.z
            .array(zod_1.z.object({
            id: zod_1.z.string(),
            component: zod_1.z.string(),
            slots: zod_1.z.array(zod_1.z.string()),
        }))
            .optional(),
        menu_items: zod_1.z
            .array(zod_1.z.object({
            label_i18n_key: zod_1.z.string(),
            icon: zod_1.z.string(),
            path: zod_1.z.string(),
            permission: zod_1.z.string().optional(),
        }))
            .optional(),
    }),
    dependencies: zod_1.z.record(zod_1.z.string()).optional(),
    config_schema: zod_1.z.record(zod_1.z.unknown()).optional(),
});
function validateManifest(manifest) {
    return exports.ModuleManifestSchema.parse(manifest);
}
// =============================================================================
// Helper Functions
// =============================================================================
const uuid_1 = require("uuid");
Object.defineProperty(exports, "uuid", { enumerable: true, get: function () { return uuid_1.v4; } });
/**
 * Create a risk finding with required fields
 */
function createRiskFinding(input) {
    const now = new Date().toISOString();
    return {
        ...input,
        id: (0, uuid_1.v4)(),
        status: 'new',
        created_at: now,
        updated_at: now,
    };
}
//# sourceMappingURL=index.js.map