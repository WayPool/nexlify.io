/**
 * Billing and subscription routes.
 *
 * Handles Stripe checkout, subscriptions, and webhooks.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import express from 'express';
import { requirePermission, authMiddleware } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { tenants, users, tenantModules, risks } from '../db/schema.js';
import { eq, count, and, isNull } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import {
  ensureStripeProducts,
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  reactivateSubscription,
  updateSubscription,
  listInvoices,
  constructWebhookEvent,
  extractSubscriptionData,
  NEXLIFY_PLANS,
  PLAN_LIMITS,
  PlanId,
  getPlanLimits,
  getUsagePercentage,
  isWithinLimit,
} from '../services/stripe.js';
import { config } from '../config.js';

export const billingRoutes = Router();

// =============================================================================
// Public Routes (no auth required)
// =============================================================================

/**
 * GET /api/billing/plans
 * List available plans with prices
 */
billingRoutes.get('/plans', async (_req, res, next) => {
  try {
    const prices = await ensureStripeProducts();

    const plans = Object.entries(NEXLIFY_PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      description: plan.description,
      price_monthly_eur: plan.monthlyPrice / 100,
      price_yearly_eur: plan.yearlyPrice / 100,
      price_id_monthly: prices[id as PlanId].monthly,
      price_id_yearly: prices[id as PlanId].yearly,
      features: plan.features,
      savings_yearly_eur: (plan.monthlyPrice * 12 - plan.yearlyPrice) / 100,
    }));

    res.json({ data: plans });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing/create-checkout
 * Create a checkout session (public - for landing page)
 */
billingRoutes.post('/create-checkout', async (req, res, next) => {
  try {
    const { plan_id, billing_cycle, email, tenant_name } = z
      .object({
        plan_id: z.enum(['essential', 'professional', 'enterprise']),
        billing_cycle: z.enum(['monthly', 'yearly']),
        email: z.string().email(),
        tenant_name: z.string().min(2),
      })
      .parse(req.body);

    const prices = await ensureStripeProducts();
    const priceId = prices[plan_id][billing_cycle];

    // Create or get customer
    const customer = await getOrCreateCustomer(
      'pending_' + Date.now(), // Temporary tenant ID, will be updated after checkout
      email,
      tenant_name
    );

    const baseUrl = config.cors.origins[0] || 'https://nexlify.io';
    const session = await createCheckoutSession(
      customer.id,
      priceId,
      customer.metadata.tenant_id || '',
      `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan_id}&billing=${billing_cycle}`,
      `${baseUrl}/#precios`
    );

    res.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
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
billingRoutes.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      const event = constructWebhookEvent(req.body, sig);

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          logger.info(`Checkout completed for session ${session.id}`);

          // If there's a subscription, update the tenant
          if (session.subscription && session.metadata?.tenant_id) {
            const tenantId = session.metadata.tenant_id;
            await db
              .update(tenants)
              .set({
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
              })
              .where(eq(tenants.id, tenantId));

            logger.info(`Updated tenant ${tenantId} with subscription ${session.subscription}`);
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const subData = extractSubscriptionData(subscription);

          logger.info(`Subscription ${subData.id} status: ${subData.status}`);

          if (subData.tenantId) {
            // Update tenant's plan based on subscription status
            const planMap: Record<string, 'essential' | 'professional' | 'enterprise'> = {
              essential: 'essential',
              professional: 'professional',
              enterprise: 'enterprise',
            };

            const newPlan = subData.planId ? planMap[subData.planId] : undefined;

            if (subData.status === 'active' && newPlan) {
              await db
                .update(tenants)
                .set({
                  plan: newPlan,
                  stripe_subscription_id: subscription.id,
                  status: 'active',
                })
                .where(eq(tenants.id, subData.tenantId));

              logger.info(`Updated tenant ${subData.tenantId} to plan ${newPlan}`);
            } else if (['canceled', 'unpaid', 'past_due'].includes(subData.status)) {
              // Downgrade or suspend
              await db
                .update(tenants)
                .set({
                  status: subData.status === 'canceled' ? 'cancelled' : 'suspended',
                })
                .where(eq(tenants.id, subData.tenantId));

              logger.info(`Tenant ${subData.tenantId} status changed to ${subData.status}`);
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const subData = extractSubscriptionData(subscription);

          if (subData.tenantId) {
            await db
              .update(tenants)
              .set({
                plan: 'essential', // Downgrade to free tier
                stripe_subscription_id: null,
                status: 'active', // Keep active but downgraded
              })
              .where(eq(tenants.id, subData.tenantId));

            logger.info(`Subscription deleted for tenant ${subData.tenantId}, downgraded to essential`);
          }
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as any;
          logger.info(`Invoice ${invoice.id} paid for customer ${invoice.customer}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          logger.warn(`Invoice ${invoice.id} payment failed for customer ${invoice.customer}`);
          // Could send notification email here
          break;
        }

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      return res.status(400).json({ error: 'Webhook error' });
    }
  }
);

// =============================================================================
// Protected Routes (auth required)
// =============================================================================

/**
 * GET /api/billing/subscription
 * Get current subscription
 */
billingRoutes.get(
  '/subscription',
  authMiddleware,
  requirePermission('billing.read'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      // Get tenant with Stripe IDs
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
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
      const subscription = await getSubscription(tenant.stripe_subscription_id);

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

      const subData = extractSubscriptionData(subscription);

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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/billing/subscription
 * Create or update subscription (checkout)
 */
billingRoutes.post(
  '/subscription',
  authMiddleware,
  requirePermission('billing.manage'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;
      const { plan_id, billing_cycle } = z
        .object({
          plan_id: z.enum(['essential', 'professional', 'enterprise']),
          billing_cycle: z.enum(['monthly', 'yearly']),
        })
        .parse(req.body);

      // Get tenant
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const prices = await ensureStripeProducts();
      const priceId = prices[plan_id][billing_cycle];

      // Get or create customer
      const customer = await getOrCreateCustomer(
        tenantId,
        req.user!.email,
        tenant.name,
        tenant.stripe_customer_id
      );

      // Update tenant with customer ID if new
      if (!tenant.stripe_customer_id) {
        await db
          .update(tenants)
          .set({ stripe_customer_id: customer.id })
          .where(eq(tenants.id, tenantId));
      }

      // If already has subscription, update it
      if (tenant.stripe_subscription_id) {
        const updatedSub = await updateSubscription(tenant.stripe_subscription_id, priceId);

        return res.json({
          message: 'Subscription updated',
          subscription_id: updatedSub.id,
        });
      }

      // Create checkout session
      const baseUrl = config.cors.origins[0] || 'https://nexlify.io';
      const session = await createCheckoutSession(
        customer.id,
        priceId,
        tenantId,
        `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/billing?canceled=true`
      );

      res.json({
        checkout_url: session.url,
        session_id: session.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/billing/subscription
 * Cancel subscription
 */
billingRoutes.delete(
  '/subscription',
  authMiddleware,
  requirePermission('billing.manage'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No active subscription' });
      }

      const subscription = await cancelSubscription(tenant.stripe_subscription_id);

      res.json({
        message: 'Subscription will be cancelled at end of billing period',
        cancel_at: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/billing/subscription/reactivate
 * Reactivate a cancelled subscription
 */
billingRoutes.post(
  '/subscription/reactivate',
  authMiddleware,
  requirePermission('billing.manage'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No subscription to reactivate' });
      }

      await reactivateSubscription(tenant.stripe_subscription_id);

      res.json({ message: 'Subscription reactivated' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/billing/invoices
 * List invoices
 */
billingRoutes.get(
  '/invoices',
  authMiddleware,
  requirePermission('billing.read'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;
      const { limit = '20' } = req.query;

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant?.stripe_customer_id) {
        return res.json({ data: [], meta: { total: 0 } });
      }

      const invoices = await listInvoices(tenant.stripe_customer_id, Number(limit));

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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/billing/portal
 * Create billing portal session for customer self-service
 */
billingRoutes.post(
  '/portal',
  authMiddleware,
  requirePermission('billing.manage'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant?.stripe_customer_id) {
        return res.status(400).json({ error: 'No billing account found' });
      }

      const baseUrl = config.cors.origins[0] || 'https://nexlify.io';
      const session = await createPortalSession(
        tenant.stripe_customer_id,
        `${baseUrl}/app/billing`
      );

      res.json({ portal_url: session.url });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/billing/usage
 * Get current usage based on actual data and plan limits
 */
billingRoutes.get(
  '/usage',
  authMiddleware,
  requirePermission('billing.read'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      // Get tenant to know their plan
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const planId = (tenant.plan || 'essential') as PlanId;
      const limits = getPlanLimits(planId);

      // Count active users for this tenant
      const [userCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.tenant_id, tenantId),
            isNull(users.deleted_at),
            eq(users.status, 'active')
          )
        );

      // Count active modules for this tenant
      const [moduleCount] = await db
        .select({ count: count() })
        .from(tenantModules)
        .where(
          and(
            eq(tenantModules.tenant_id, tenantId),
            eq(tenantModules.status, 'active')
          )
        );

      // Count total risks detected for this tenant
      const [riskCount] = await db
        .select({ count: count() })
        .from(risks)
        .where(
          and(
            eq(risks.tenant_id, tenantId),
            isNull(risks.deleted_at)
          )
        );

      const usersUsed = userCount?.count || 0;
      const modulesUsed = moduleCount?.count || 0;
      const risksUsed = riskCount?.count || 0;

      res.json({
        plan: {
          id: planId,
          name: NEXLIFY_PLANS[planId]?.name || 'Starter',
        },
        users: {
          used: usersUsed,
          limit: limits.users,
          percentage: getUsagePercentage(usersUsed, limits.users),
          unlimited: limits.users === -1,
        },
        modules: {
          used: modulesUsed,
          limit: limits.modules,
          percentage: getUsagePercentage(modulesUsed, limits.modules),
          unlimited: limits.modules === -1,
        },
        risks: {
          used: risksUsed,
          limit: limits.detectors,
          percentage: getUsagePercentage(risksUsed, limits.detectors),
          unlimited: false, // detectors are never unlimited
        },
        companies: {
          used: 1, // For now, always 1 (main tenant)
          limit: limits.companies,
          percentage: getUsagePercentage(1, limits.companies),
          unlimited: limits.companies === -1,
        },
        features: {
          apiAccess: limits.apiAccess,
          aiAssistant: limits.aiAssistant,
          support: limits.support,
        },
        canAddUser: isWithinLimit(usersUsed, limits.users),
        canAddModule: isWithinLimit(modulesUsed, limits.modules),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/billing/can-install-module
 * Check if the tenant can install a new module based on their plan
 */
billingRoutes.get(
  '/can-install-module',
  authMiddleware,
  requirePermission('modules.read'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      // Get tenant to know their plan
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const planId = (tenant.plan || 'essential') as PlanId;
      const limits = getPlanLimits(planId);

      // Count active modules for this tenant
      const [moduleCount] = await db
        .select({ count: count() })
        .from(tenantModules)
        .where(
          and(
            eq(tenantModules.tenant_id, tenantId),
            eq(tenantModules.status, 'active')
          )
        );

      const modulesUsed = moduleCount?.count || 0;
      const canInstall = isWithinLimit(modulesUsed, limits.modules);

      res.json({
        can_install: canInstall,
        modules_used: modulesUsed,
        modules_limit: limits.modules,
        unlimited: limits.modules === -1,
        upgrade_needed: !canInstall,
        suggested_plan: !canInstall
          ? planId === 'essential'
            ? 'professional'
            : planId === 'professional'
            ? 'enterprise'
            : null
          : null,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/billing/limits
 * Get the limits for the current plan
 */
billingRoutes.get(
  '/limits',
  authMiddleware,
  requirePermission('billing.read'),
  async (req, res, next) => {
    try {
      const tenantId = req.user!.tenant_id;

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const planId = (tenant.plan || 'essential') as PlanId;
      const limits = getPlanLimits(planId);
      const plan = NEXLIFY_PLANS[planId];

      res.json({
        plan_id: planId,
        plan_name: plan?.name || 'Starter',
        limits: {
          users: limits.users === -1 ? 'unlimited' : limits.users,
          modules: limits.modules === -1 ? 'unlimited' : limits.modules,
          detectors: limits.detectors, // detectors are never unlimited
          companies: limits.companies === -1 ? 'unlimited' : limits.companies,
        },
        features: {
          api_access: limits.apiAccess,
          ai_assistant: limits.aiAssistant,
          support: limits.support,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
