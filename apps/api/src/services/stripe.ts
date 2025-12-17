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
  apiVersion: '2024-04-10',
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
    name: 'Nexlify Essential',
    description: 'Para equipos pequeños que comienzan con la gestión de riesgos',
    monthlyPrice: 37500, // 375€ in cents
    yearlyPrice: 375000, // 3750€ in cents (10 months = 2 months free)
    features: [
      'Hasta 10 usuarios',
      '3 módulos incluidos',
      'Motor de riesgos',
      'Dashboard completo',
      'Anclaje blockchain estándar',
      'Soporte por email',
    ],
  },
  professional: {
    name: 'Nexlify Professional',
    description: 'Para organizaciones en crecimiento con necesidades avanzadas',
    monthlyPrice: 235000, // 2350€ in cents
    yearlyPrice: 2350000, // 23500€ in cents (10 months = 2 months free)
    features: [
      'Hasta 50 usuarios',
      '10 módulos incluidos',
      'Motor de riesgos',
      'Dashboard completo',
      'Anclaje blockchain avanzado',
      'Asistente IA',
      'API completa',
      'SSO / SAML',
      'Soporte prioritario',
    ],
  },
  enterprise: {
    name: 'Nexlify Enterprise',
    description: 'Para grandes empresas con requisitos de seguridad máxima',
    monthlyPrice: 750000, // 7500€ in cents
    yearlyPrice: 7500000, // 75000€ in cents (10 months = 2 months free)
    features: [
      'Usuarios ilimitados',
      'Todos los módulos',
      'Motor de riesgos',
      'Dashboard completo',
      'Anclaje blockchain dedicado',
      'Asistente IA avanzado',
      'Integraciones personalizadas',
      'SLA personalizado',
      'Account manager dedicado',
      'Soporte 24/7',
      'On-premise disponible',
    ],
  },
} as const;

export type PlanId = keyof typeof NEXLIFY_PLANS;

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

  return {
    id: subscription.id,
    status: subscription.status,
    planId: (price?.metadata?.plan_id as string) || null,
    billingCycle: (price?.metadata?.billing_cycle as string) || null,
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
