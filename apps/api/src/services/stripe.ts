/**
 * Stripe Service
 *
 * Handles all Stripe operations including products, prices,
 * checkout sessions, and subscription management.
 */

import Stripe from 'stripe';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// Initialize Stripe with the secret key
const stripe = new Stripe(config.stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// =============================================================================
// Price IDs (will be created on first run or retrieved)
// =============================================================================

export interface PlanPrices {
  essential: { monthly: string; yearly: string };
  professional: { monthly: string; yearly: string };
  enterprise: { monthly: string; yearly: string };
}

// Cache for price IDs
let cachedPrices: PlanPrices | null = null;

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
} as const;

export type PlanId = keyof typeof NEXLIFY_PLANS;

// =============================================================================
// Plan Limits Configuration
// =============================================================================

export const PLAN_LIMITS = {
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
} as const;

export type PlanLimits = typeof PLAN_LIMITS[PlanId];

/**
 * Gets the limits for a specific plan.
 */
export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.essential;
}

/**
 * Checks if a value exceeds the plan limit.
 * Returns true if within limit, false if exceeded.
 * -1 means unlimited.
 */
export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true; // Unlimited
  return current < limit;
}

/**
 * Gets usage percentage (capped at 100 for unlimited).
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === -1) return 0; // Show 0% for unlimited
  if (limit === 0) return 100;
  return Math.round((used / limit) * 100);
}

// =============================================================================
// Product & Price Management
// =============================================================================

/**
 * Ensures all Nexlify products and prices exist in Stripe.
 * Creates them if they don't exist, returns cached IDs if they do.
 */
export async function ensureStripeProducts(): Promise<PlanPrices> {
  if (cachedPrices) {
    return cachedPrices;
  }

  logger.info('Checking/creating Stripe products and prices for Nexlify...');

  const prices: PlanPrices = {
    essential: { monthly: '', yearly: '' },
    professional: { monthly: '', yearly: '' },
    enterprise: { monthly: '', yearly: '' },
  };

  for (const [planId, planConfig] of Object.entries(NEXLIFY_PLANS)) {
    const productName = planConfig.name;

    // Find existing product or create new one
    let product: Stripe.Product;
    const existingProducts = await stripe.products.list({
      limit: 100,
    });

    const existingProduct = existingProducts.data.find(
      (p) => p.name === productName && p.active
    );

    if (existingProduct) {
      product = existingProduct;
      logger.info(`Found existing product: ${productName}`);
    } else {
      product = await stripe.products.create({
        name: productName,
        description: planConfig.description,
        metadata: {
          plan_id: planId,
          platform: 'nexlify',
        },
      });
      logger.info(`Created new product: ${productName}`);
    }

    // Find or create monthly price
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    const existingMonthly = existingPrices.data.find(
      (p) => p.recurring?.interval === 'month' && p.unit_amount === planConfig.monthlyPrice
    );
    const existingYearly = existingPrices.data.find(
      (p) => p.recurring?.interval === 'year' && p.unit_amount === planConfig.yearlyPrice
    );

    // Monthly price
    if (existingMonthly) {
      prices[planId as PlanId].monthly = existingMonthly.id;
      logger.info(`Found existing monthly price for ${planId}: ${existingMonthly.id}`);
    } else {
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
      prices[planId as PlanId].monthly = monthlyPrice.id;
      logger.info(`Created monthly price for ${planId}: ${monthlyPrice.id}`);
    }

    // Yearly price (with 2 months discount)
    if (existingYearly) {
      prices[planId as PlanId].yearly = existingYearly.id;
      logger.info(`Found existing yearly price for ${planId}: ${existingYearly.id}`);
    } else {
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
      prices[planId as PlanId].yearly = yearlyPrice.id;
      logger.info(`Created yearly price for ${planId}: ${yearlyPrice.id}`);
    }
  }

  cachedPrices = prices;
  logger.info('Stripe products and prices ready:', prices);

  return prices;
}

// =============================================================================
// Customer Management
// =============================================================================

/**
 * Gets or creates a Stripe customer for a tenant.
 */
export async function getOrCreateCustomer(
  tenantId: string,
  email: string,
  name: string,
  existingCustomerId?: string | null
): Promise<Stripe.Customer> {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      logger.warn(`Could not retrieve customer ${existingCustomerId}, creating new one`);
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

  logger.info(`Created Stripe customer ${customer.id} for tenant ${tenantId}`);
  return customer;
}

// =============================================================================
// Checkout Sessions
// =============================================================================

/**
 * Creates a checkout session for a subscription.
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  tenantId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
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

  logger.info(`Created checkout session ${session.id} for tenant ${tenantId}`);
  return session;
}

// =============================================================================
// Portal Sessions
// =============================================================================

/**
 * Creates a billing portal session for customer self-service.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
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
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });
  } catch (error) {
    logger.warn(`Could not retrieve subscription ${subscriptionId}`);
    return null;
  }
}

/**
 * Cancels a subscription at period end.
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
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
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Updates a subscription to a new plan/price.
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
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
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!config.stripe.webhook_secret) {
    throw new Error('Stripe webhook secret not configured');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhook_secret
  );
}

/**
 * Extracts subscription data from a Stripe event.
 * Attempts multiple methods to detect the plan ID.
 */
export function extractSubscriptionData(subscription: Stripe.Subscription): {
  id: string;
  status: string;
  planId: string | null;
  billingCycle: string | null;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  tenantId: string | null;
} {
  const item = subscription.items.data[0];
  const price = item?.price;
  const product = price?.product;

  // Try to get planId from multiple sources
  let planId: string | null = null;
  let billingCycle: string | null = null;

  // 1. Try price metadata (check both plan_id and plan_type)
  if (price?.metadata?.plan_id || price?.metadata?.plan_type) {
    planId = price.metadata.plan_id || price.metadata.plan_type;
    billingCycle = price.metadata.billing_cycle || null;
    logger.info(`Plan detected from price metadata: ${planId}`);
  }

  // 2. Try product metadata if price didn't have it (check both plan_id and plan_type)
  if (!planId && product && typeof product === 'object' && 'metadata' in product) {
    const productMeta = (product as Stripe.Product).metadata;
    planId = productMeta?.plan_id || productMeta?.plan_type || null;
    if (planId) {
      logger.info(`Plan detected from product metadata: ${planId}`);
    }
  }

  // 3. Try to infer from product name
  if (!planId && product && typeof product === 'object' && 'name' in product) {
    const productName = (product as Stripe.Product).name?.toLowerCase() || '';
    if (productName.includes('starter') || productName.includes('essential')) {
      planId = 'essential';
    } else if (productName.includes('business') || productName.includes('professional')) {
      planId = 'professional';
    } else if (productName.includes('enterprise')) {
      planId = 'enterprise';
    }
    if (planId) {
      logger.info(`Plan inferred from product name "${productName}": ${planId}`);
    }
  }

  // 4. Try to detect billing cycle from price interval
  if (!billingCycle && price?.recurring?.interval) {
    billingCycle = price.recurring.interval === 'year' ? 'yearly' : 'monthly';
  }

  logger.info(`Extracted subscription data - ID: ${subscription.id}, Plan: ${planId}, Cycle: ${billingCycle}, Tenant: ${subscription.metadata?.tenant_id}`);

  return {
    id: subscription.id,
    status: subscription.status,
    planId,
    billingCycle,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    tenantId: (subscription.metadata?.tenant_id as string) || null,
  };
}

// =============================================================================
// Invoices
// =============================================================================

/**
 * Lists invoices for a customer.
 */
export async function listInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

// =============================================================================
// Exports
// =============================================================================

export { stripe, NEXLIFY_PLANS };
