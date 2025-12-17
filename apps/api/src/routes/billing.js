"use strict";
/**
 * Billing and subscription routes.
 *
 * Handles Stripe checkout, subscriptions, and webhooks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const express_2 = __importDefault(require("express"));
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../db/index.js");
const schema_js_1 = require("../db/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const logger_js_1 = require("../utils/logger.js");
const stripe_js_1 = require("../services/stripe.js");
const config_js_1 = require("../config.js");
exports.billingRoutes = (0, express_1.Router)();
// =============================================================================
// Public Routes (no auth required)
// =============================================================================
/**
 * GET /api/billing/plans
 * List available plans with prices
 */
exports.billingRoutes.get('/plans', async (_req, res, next) => {
    try {
        const prices = await (0, stripe_js_1.ensureStripeProducts)();
        const plans = Object.entries(stripe_js_1.NEXLIFY_PLANS).map(([id, plan]) => ({
            id,
            name: plan.name,
            description: plan.description,
            price_monthly_eur: plan.monthlyPrice / 100,
            price_yearly_eur: plan.yearlyPrice / 100,
            price_id_monthly: prices[id].monthly,
            price_id_yearly: prices[id].yearly,
            features: plan.features,
            savings_yearly_eur: (plan.monthlyPrice * 12 - plan.yearlyPrice) / 100,
        }));
        res.json({ data: plans });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/billing/create-checkout
 * Create a checkout session (public - for landing page)
 */
exports.billingRoutes.post('/create-checkout', async (req, res, next) => {
    try {
        const { plan_id, billing_cycle, email, tenant_name } = zod_1.z
            .object({
            plan_id: zod_1.z.enum(['essential', 'professional', 'enterprise']),
            billing_cycle: zod_1.z.enum(['monthly', 'yearly']),
            email: zod_1.z.string().email(),
            tenant_name: zod_1.z.string().min(2),
        })
            .parse(req.body);
        const prices = await (0, stripe_js_1.ensureStripeProducts)();
        const priceId = prices[plan_id][billing_cycle];
        // Create or get customer
        const customer = await (0, stripe_js_1.getOrCreateCustomer)('pending_' + Date.now(), // Temporary tenant ID, will be updated after checkout
        email, tenant_name);
        const baseUrl = config_js_1.config.cors.origins[0] || 'https://nexlify.io';
        const session = await (0, stripe_js_1.createCheckoutSession)(customer.id, priceId, customer.metadata.tenant_id || '', `${baseUrl}/app/register?session_id={CHECKOUT_SESSION_ID}&plan=${plan_id}&billing=${billing_cycle}`, `${baseUrl}/#pricing`);
        res.json({
            checkout_url: session.url,
            session_id: session.id,
        });
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// Webhook Route (no auth, raw body)
// =============================================================================
/**
 * POST /api/billing/webhook
 * Stripe webhook handler
 */
exports.billingRoutes.post('/webhook', express_2.default.raw({ type: 'application/json' }), async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
    }
    try {
        const event = (0, stripe_js_1.constructWebhookEvent)(req.body, sig);
        logger_js_1.logger.info(`Stripe webhook received: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                logger_js_1.logger.info(`Checkout completed for session ${session.id}`);
                // If there's a subscription, update the tenant
                if (session.subscription && session.metadata?.tenant_id) {
                    const tenantId = session.metadata.tenant_id;
                    await index_js_1.db
                        .update(schema_js_1.tenants)
                        .set({
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId));
                    logger_js_1.logger.info(`Updated tenant ${tenantId} with subscription ${session.subscription}`);
                }
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const subData = (0, stripe_js_1.extractSubscriptionData)(subscription);
                logger_js_1.logger.info(`Subscription ${subData.id} status: ${subData.status}`);
                if (subData.tenantId) {
                    // Update tenant's plan based on subscription status
                    const planMap = {
                        essential: 'essential',
                        professional: 'professional',
                        enterprise: 'enterprise',
                    };
                    const newPlan = subData.planId ? planMap[subData.planId] : undefined;
                    if (subData.status === 'active' && newPlan) {
                        await index_js_1.db
                            .update(schema_js_1.tenants)
                            .set({
                            plan: newPlan,
                            stripe_subscription_id: subscription.id,
                            status: 'active',
                        })
                            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, subData.tenantId));
                        logger_js_1.logger.info(`Updated tenant ${subData.tenantId} to plan ${newPlan}`);
                    }
                    else if (['canceled', 'unpaid', 'past_due'].includes(subData.status)) {
                        // Downgrade or suspend
                        await index_js_1.db
                            .update(schema_js_1.tenants)
                            .set({
                            status: subData.status === 'canceled' ? 'cancelled' : 'suspended',
                        })
                            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, subData.tenantId));
                        logger_js_1.logger.info(`Tenant ${subData.tenantId} status changed to ${subData.status}`);
                    }
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const subData = (0, stripe_js_1.extractSubscriptionData)(subscription);
                if (subData.tenantId) {
                    await index_js_1.db
                        .update(schema_js_1.tenants)
                        .set({
                        plan: 'essential', // Downgrade to free tier
                        stripe_subscription_id: null,
                        status: 'active', // Keep active but downgraded
                    })
                        .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, subData.tenantId));
                    logger_js_1.logger.info(`Subscription deleted for tenant ${subData.tenantId}, downgraded to essential`);
                }
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                logger_js_1.logger.info(`Invoice ${invoice.id} paid for customer ${invoice.customer}`);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                logger_js_1.logger.warn(`Invoice ${invoice.id} payment failed for customer ${invoice.customer}`);
                // Could send notification email here
                break;
            }
            default:
                logger_js_1.logger.info(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        logger_js_1.logger.error('Webhook error:', error);
        return res.status(400).json({ error: 'Webhook error' });
    }
});
// =============================================================================
// Protected Routes (auth required)
// =============================================================================
/**
 * GET /api/billing/subscription
 * Get current subscription
 */
exports.billingRoutes.get('/subscription', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.read'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        // Get tenant with Stripe IDs
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        // If no subscription, return basic info
        if (!tenant.stripe_subscription_id) {
            return res.json({
                tenant_id: tenantId,
                plan_id: tenant.plan,
                status: 'no_subscription',
                billing_cycle: null,
                current_period_start: null,
                current_period_end: null,
                cancel_at_period_end: false,
                stripe_subscription_id: null,
                stripe_customer_id: tenant.stripe_customer_id,
            });
        }
        // Get subscription from Stripe
        const subscription = await (0, stripe_js_1.getSubscription)(tenant.stripe_subscription_id);
        if (!subscription) {
            return res.json({
                tenant_id: tenantId,
                plan_id: tenant.plan,
                status: 'subscription_not_found',
                billing_cycle: null,
                current_period_start: null,
                current_period_end: null,
                cancel_at_period_end: false,
                stripe_subscription_id: tenant.stripe_subscription_id,
                stripe_customer_id: tenant.stripe_customer_id,
            });
        }
        const subData = (0, stripe_js_1.extractSubscriptionData)(subscription);
        res.json({
            tenant_id: tenantId,
            plan_id: subData.planId || tenant.plan,
            status: subscription.status,
            billing_cycle: subData.billingCycle,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: subData.currentPeriodEnd.toISOString(),
            cancel_at_period_end: subData.cancelAtPeriodEnd,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: tenant.stripe_customer_id,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/billing/subscription
 * Create or update subscription (checkout)
 */
exports.billingRoutes.post('/subscription', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.manage'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { plan_id, billing_cycle } = zod_1.z
            .object({
            plan_id: zod_1.z.enum(['essential', 'professional', 'enterprise']),
            billing_cycle: zod_1.z.enum(['monthly', 'yearly']),
        })
            .parse(req.body);
        // Get tenant
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const prices = await (0, stripe_js_1.ensureStripeProducts)();
        const priceId = prices[plan_id][billing_cycle];
        // Get or create customer
        const customer = await (0, stripe_js_1.getOrCreateCustomer)(tenantId, req.user.email, tenant.name, tenant.stripe_customer_id);
        // Update tenant with customer ID if new
        if (!tenant.stripe_customer_id) {
            await index_js_1.db
                .update(schema_js_1.tenants)
                .set({ stripe_customer_id: customer.id })
                .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId));
        }
        // If already has subscription, update it
        if (tenant.stripe_subscription_id) {
            const updatedSub = await (0, stripe_js_1.updateSubscription)(tenant.stripe_subscription_id, priceId);
            return res.json({
                message: 'Subscription updated',
                subscription_id: updatedSub.id,
            });
        }
        // Create checkout session
        const baseUrl = config_js_1.config.cors.origins[0] || 'https://nexlify.io';
        const session = await (0, stripe_js_1.createCheckoutSession)(customer.id, priceId, tenantId, `${baseUrl}/app/billing?success=true`, `${baseUrl}/app/billing?canceled=true`);
        res.json({
            checkout_url: session.url,
            session_id: session.id,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/billing/subscription
 * Cancel subscription
 */
exports.billingRoutes.delete('/subscription', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.manage'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant?.stripe_subscription_id) {
            return res.status(400).json({ error: 'No active subscription' });
        }
        const subscription = await (0, stripe_js_1.cancelSubscription)(tenant.stripe_subscription_id);
        res.json({
            message: 'Subscription will be cancelled at end of billing period',
            cancel_at: new Date(subscription.current_period_end * 1000).toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/billing/subscription/reactivate
 * Reactivate a cancelled subscription
 */
exports.billingRoutes.post('/subscription/reactivate', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.manage'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant?.stripe_subscription_id) {
            return res.status(400).json({ error: 'No subscription to reactivate' });
        }
        await (0, stripe_js_1.reactivateSubscription)(tenant.stripe_subscription_id);
        res.json({ message: 'Subscription reactivated' });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/billing/invoices
 * List invoices
 */
exports.billingRoutes.get('/invoices', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.read'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const { limit = '20' } = req.query;
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant?.stripe_customer_id) {
            return res.json({ data: [], meta: { total: 0 } });
        }
        const invoices = await (0, stripe_js_1.listInvoices)(tenant.stripe_customer_id, Number(limit));
        const formattedInvoices = invoices.map((inv) => ({
            id: inv.id,
            number: inv.number,
            amount_eur: (inv.amount_paid || 0) / 100,
            status: inv.status,
            period_start: inv.period_start
                ? new Date(inv.period_start * 1000).toISOString()
                : null,
            period_end: inv.period_end
                ? new Date(inv.period_end * 1000).toISOString()
                : null,
            paid_at: inv.status_transitions?.paid_at
                ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
                : null,
            pdf_url: inv.invoice_pdf,
            hosted_url: inv.hosted_invoice_url,
        }));
        res.json({
            data: formattedInvoices,
            meta: { total: formattedInvoices.length },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/billing/portal
 * Create billing portal session for customer self-service
 */
exports.billingRoutes.post('/portal', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.manage'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        const [tenant] = await index_js_1.db
            .select()
            .from(schema_js_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_js_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant?.stripe_customer_id) {
            return res.status(400).json({ error: 'No billing account found' });
        }
        const baseUrl = config_js_1.config.cors.origins[0] || 'https://nexlify.io';
        const session = await (0, stripe_js_1.createPortalSession)(tenant.stripe_customer_id, `${baseUrl}/app/billing`);
        res.json({ portal_url: session.url });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/billing/usage
 * Get current usage (placeholder for future metering)
 */
exports.billingRoutes.get('/usage', auth_js_1.authMiddleware, (0, auth_js_1.requirePermission)('billing.read'), async (req, res, next) => {
    try {
        const tenantId = req.user.tenant_id;
        // TODO: Implement actual usage tracking
        // For now, return placeholder data
        res.json({
            users: {
                used: 5,
                limit: 10,
                percentage: 50,
            },
            modules: {
                used: 2,
                limit: 3,
                percentage: 67,
            },
            risks: {
                used: 45,
                limit: 1000,
                percentage: 4.5,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=billing.js.map