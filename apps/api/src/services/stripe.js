"use strict";
/**
 * Stripe Service
 *
 * Handles all Stripe operations including products, prices,
 * checkout sessions, and subscription management.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEXLIFY_PLANS = exports.stripe = exports.PLAN_LIMITS = void 0;
exports.getPlanLimits = getPlanLimits;
exports.isWithinLimit = isWithinLimit;
exports.getUsagePercentage = getUsagePercentage;
exports.ensureStripeProducts = ensureStripeProducts;
exports.getOrCreateCustomer = getOrCreateCustomer;
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.getSubscription = getSubscription;
exports.cancelSubscription = cancelSubscription;
exports.reactivateSubscription = reactivateSubscription;
exports.updateSubscription = updateSubscription;
exports.constructWebhookEvent = constructWebhookEvent;
exports.extractSubscriptionData = extractSubscriptionData;
exports.listInvoices = listInvoices;
const stripe_1 = __importDefault(require("stripe"));
const config_js_1 = require("../config.js");
const logger_js_1 = require("../utils/logger.js");
// Initialize Stripe with the secret key
const stripe = new stripe_1.default(config_js_1.config.stripe.secret_key, {
    apiVersion: '2023-10-16',
});
exports.stripe = stripe;
// Cache for price IDs
let cachedPrices = null;
// =============================================================================
// Plan Configuration
// =============================================================================
const NEXLIFY_PLANS = {
    essential: {
        name: 'Nexlify Starter',
        description: 'Ideal para pequeñas empresas y autónomos',
        monthlyPrice: 39500, // 395€ in cents
        yearlyPrice: 394800, // 329€ x 12 = 3.948€ in cents (2 meses gratis)
        features: [
            'Hasta 2 usuarios',
            '3 Módulos activos',
            '50 detectores de riesgo',
            'Expediente inspección',
            'Auditorías IA',
            'Soporte email',
        ],
    },
    professional: {
        name: 'Nexlify Business',
        description: 'Para empresas en crecimiento',
        monthlyPrice: 235000, // 2.350€ in cents
        yearlyPrice: 2349600, // 1.958€ x 12 = 23.496€ in cents (2 meses gratis)
        features: [
            'Hasta 25 usuarios',
            '15 Módulos activos',
            '150 detectores de riesgo',
            'Todo lo de Starter',
            'Multi-Empresas (3)',
            'Soporte prioritario',
        ],
    },
    enterprise: {
        name: 'Nexlify Enterprise',
        description: 'Solución completa para grandes corporaciones',
        monthlyPrice: 795000, // 7.950€ in cents
        yearlyPrice: 7950000, // 6.625€ x 12 = 79.500€ in cents (2 meses gratis)
        features: [
            'Usuarios ilimitados',
            'Todos los Módulos',
            '395+ detectores de riesgo',
            'Todo lo de Business',
            'Multi-Empresas ilimitado',
            'Asistente IA avanzado',
            'API completa',
            'Account Manager dedicado',
        ],
    },
};
exports.NEXLIFY_PLANS = NEXLIFY_PLANS;
// =============================================================================
// Plan Limits Configuration
// =============================================================================
exports.PLAN_LIMITS = {
    essential: {
        users: 2,
        modules: 3,
        detectors: 50,
        companies: 1,
        apiAccess: false,
        aiAssistant: 'basic',
        support: 'email',
    },
    professional: {
        users: 25,
        modules: 15,
        detectors: 150,
        companies: 3,
        apiAccess: false,
        aiAssistant: 'advanced',
        support: 'priority',
    },
    enterprise: {
        users: -1, // -1 means unlimited
        modules: -1,
        detectors: 395,
        companies: -1,
        apiAccess: true,
        aiAssistant: 'full',
        support: 'dedicated',
    },
};
/**
 * Gets the limits for a specific plan.
 */
function getPlanLimits(planId) {
    return exports.PLAN_LIMITS[planId] || exports.PLAN_LIMITS.essential;
}
/**
 * Checks if a value exceeds the plan limit.
 * Returns true if within limit, false if exceeded.
 * -1 means unlimited.
 */
function isWithinLimit(current, limit) {
    if (limit === -1)
        return true; // Unlimited
    return current < limit;
}
/**
 * Gets usage percentage (capped at 100 for unlimited).
 */
function getUsagePercentage(used, limit) {
    if (limit === -1)
        return 0; // Show 0% for unlimited
    if (limit === 0)
        return 100;
    return Math.round((used / limit) * 100);
}
// =============================================================================
// Product & Price Management
// =============================================================================
/**
 * Ensures all Nexlify products and prices exist in Stripe.
 * Creates them if they don't exist, returns cached IDs if they do.
 */
async function ensureStripeProducts() {
    if (cachedPrices) {
        return cachedPrices;
    }
    logger_js_1.logger.info('Checking/creating Stripe products and prices for Nexlify...');
    const prices = {
        essential: { monthly: '', yearly: '' },
        professional: { monthly: '', yearly: '' },
        enterprise: { monthly: '', yearly: '' },
    };
    for (const [planId, planConfig] of Object.entries(NEXLIFY_PLANS)) {
        const productName = planConfig.name;
        // Find existing product or create new one
        let product;
        const existingProducts = await stripe.products.list({
            limit: 100,
        });
        const existingProduct = existingProducts.data.find((p) => p.name === productName && p.active);
        if (existingProduct) {
            product = existingProduct;
            logger_js_1.logger.info(`Found existing product: ${productName}`);
        }
        else {
            product = await stripe.products.create({
                name: productName,
                description: planConfig.description,
                metadata: {
                    plan_id: planId,
                    platform: 'nexlify',
                },
            });
            logger_js_1.logger.info(`Created new product: ${productName}`);
        }
        // Find or create monthly price
        const existingPrices = await stripe.prices.list({
            product: product.id,
            active: true,
            limit: 10,
        });
        const existingMonthly = existingPrices.data.find((p) => p.recurring?.interval === 'month' && p.unit_amount === planConfig.monthlyPrice);
        const existingYearly = existingPrices.data.find((p) => p.recurring?.interval === 'year' && p.unit_amount === planConfig.yearlyPrice);
        // Monthly price
        if (existingMonthly) {
            prices[planId].monthly = existingMonthly.id;
            logger_js_1.logger.info(`Found existing monthly price for ${planId}: ${existingMonthly.id}`);
        }
        else {
            const monthlyPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: planConfig.monthlyPrice,
                currency: 'eur',
                recurring: { interval: 'month' },
                metadata: {
                    plan_id: planId,
                    billing_cycle: 'monthly',
                    platform: 'nexlify',
                },
            });
            prices[planId].monthly = monthlyPrice.id;
            logger_js_1.logger.info(`Created monthly price for ${planId}: ${monthlyPrice.id}`);
        }
        // Yearly price (with 2 months discount)
        if (existingYearly) {
            prices[planId].yearly = existingYearly.id;
            logger_js_1.logger.info(`Found existing yearly price for ${planId}: ${existingYearly.id}`);
        }
        else {
            const yearlyPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: planConfig.yearlyPrice,
                currency: 'eur',
                recurring: { interval: 'year' },
                metadata: {
                    plan_id: planId,
                    billing_cycle: 'yearly',
                    platform: 'nexlify',
                    discount: '2_months_free',
                },
            });
            prices[planId].yearly = yearlyPrice.id;
            logger_js_1.logger.info(`Created yearly price for ${planId}: ${yearlyPrice.id}`);
        }
    }
    cachedPrices = prices;
    logger_js_1.logger.info('Stripe products and prices ready:', prices);
    return prices;
}
// =============================================================================
// Customer Management
// =============================================================================
/**
 * Gets or creates a Stripe customer for a tenant.
 */
async function getOrCreateCustomer(tenantId, email, name, existingCustomerId) {
    if (existingCustomerId) {
        try {
            const customer = await stripe.customers.retrieve(existingCustomerId);
            if (!customer.deleted) {
                return customer;
            }
        }
        catch (error) {
            logger_js_1.logger.warn(`Could not retrieve customer ${existingCustomerId}, creating new one`);
        }
    }
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            tenant_id: tenantId,
            platform: 'nexlify',
        },
    });
    logger_js_1.logger.info(`Created Stripe customer ${customer.id} for tenant ${tenantId}`);
    return customer;
}
// =============================================================================
// Checkout Sessions
// =============================================================================
/**
 * Creates a checkout session for a subscription.
 */
async function createCheckoutSession(customerId, priceId, tenantId, successUrl, cancelUrl) {
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
            metadata: {
                tenant_id: tenantId,
                platform: 'nexlify',
            },
        },
        metadata: {
            tenant_id: tenantId,
            platform: 'nexlify',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: { enabled: true },
        customer_update: {
            name: 'auto',
            address: 'auto',
        },
        locale: 'es',
    });
    logger_js_1.logger.info(`Created checkout session ${session.id} for tenant ${tenantId}`);
    return session;
}
// =============================================================================
// Portal Sessions
// =============================================================================
/**
 * Creates a billing portal session for customer self-service.
 */
async function createPortalSession(customerId, returnUrl) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session;
}
// =============================================================================
// Subscription Management
// =============================================================================
/**
 * Gets subscription details.
 */
async function getSubscription(subscriptionId) {
    try {
        return await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price.product'],
        });
    }
    catch (error) {
        logger_js_1.logger.warn(`Could not retrieve subscription ${subscriptionId}`);
        return null;
    }
}
/**
 * Cancels a subscription at period end.
 */
async function cancelSubscription(subscriptionId, immediately = false) {
    if (immediately) {
        return await stripe.subscriptions.cancel(subscriptionId);
    }
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });
}
/**
 * Reactivates a cancelled subscription.
 */
async function reactivateSubscription(subscriptionId) {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
    });
}
/**
 * Updates a subscription to a new plan/price.
 */
async function updateSubscription(subscriptionId, newPriceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return await stripe.subscriptions.update(subscriptionId, {
        items: [
            {
                id: subscription.items.data[0].id,
                price: newPriceId,
            },
        ],
        proration_behavior: 'create_prorations',
    });
}
// =============================================================================
// Webhook Handling
// =============================================================================
/**
 * Constructs and verifies a webhook event.
 */
function constructWebhookEvent(payload, signature) {
    if (!config_js_1.config.stripe.webhook_secret) {
        throw new Error('Stripe webhook secret not configured');
    }
    return stripe.webhooks.constructEvent(payload, signature, config_js_1.config.stripe.webhook_secret);
}
/**
 * Extracts subscription data from a Stripe event.
 */
function extractSubscriptionData(subscription) {
    const item = subscription.items.data[0];
    const price = item?.price;
    return {
        id: subscription.id,
        status: subscription.status,
        planId: price?.metadata?.plan_id || null,
        billingCycle: price?.metadata?.billing_cycle || null,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        tenantId: subscription.metadata?.tenant_id || null,
    };
}
// =============================================================================
// Invoices
// =============================================================================
/**
 * Lists invoices for a customer.
 */
async function listInvoices(customerId, limit = 10) {
    const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
    });
    return invoices.data;
}
//# sourceMappingURL=stripe.js.map