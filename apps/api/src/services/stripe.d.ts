/**
 * Stripe Service
 *
 * Handles all Stripe operations including products, prices,
 * checkout sessions, and subscription management.
 */
import Stripe from 'stripe';
declare const stripe: Stripe;
export interface PlanPrices {
    essential: {
        monthly: string;
        yearly: string;
    };
    professional: {
        monthly: string;
        yearly: string;
    };
    enterprise: {
        monthly: string;
        yearly: string;
    };
}
declare const NEXLIFY_PLANS: {
    readonly essential: {
        readonly name: "Nexlify Starter";
        readonly description: "Ideal para pequeñas empresas y autónomos";
        readonly monthlyPrice: 39500;
        readonly yearlyPrice: 394800;
        readonly features: readonly ["Hasta 2 usuarios", "3 Módulos activos", "50 detectores de riesgo", "Expediente inspección", "Auditorías IA", "Soporte email"];
    };
    readonly professional: {
        readonly name: "Nexlify Business";
        readonly description: "Para empresas en crecimiento";
        readonly monthlyPrice: 235000;
        readonly yearlyPrice: 2349600;
        readonly features: readonly ["Hasta 25 usuarios", "15 Módulos activos", "150 detectores de riesgo", "Todo lo de Starter", "Multi-Empresas (3)", "Soporte prioritario"];
    };
    readonly enterprise: {
        readonly name: "Nexlify Enterprise";
        readonly description: "Solución completa para grandes corporaciones";
        readonly monthlyPrice: 795000;
        readonly yearlyPrice: 7950000;
        readonly features: readonly ["Usuarios ilimitados", "Todos los Módulos", "395+ detectores de riesgo", "Todo lo de Business", "Multi-Empresas ilimitado", "Asistente IA avanzado", "API completa", "Account Manager dedicado"];
    };
};
export type PlanId = keyof typeof NEXLIFY_PLANS;
export declare const PLAN_LIMITS: {
    readonly essential: {
        readonly users: 2;
        readonly modules: 3;
        readonly detectors: 50;
        readonly companies: 1;
        readonly apiAccess: false;
        readonly aiAssistant: "basic";
        readonly support: "email";
    };
    readonly professional: {
        readonly users: 25;
        readonly modules: 15;
        readonly detectors: 150;
        readonly companies: 3;
        readonly apiAccess: false;
        readonly aiAssistant: "advanced";
        readonly support: "priority";
    };
    readonly enterprise: {
        readonly users: -1;
        readonly modules: -1;
        readonly detectors: 395;
        readonly companies: -1;
        readonly apiAccess: true;
        readonly aiAssistant: "full";
        readonly support: "dedicated";
    };
};
export type PlanLimits = typeof PLAN_LIMITS[PlanId];
/**
 * Gets the limits for a specific plan.
 */
export declare function getPlanLimits(planId: PlanId): PlanLimits;
/**
 * Checks if a value exceeds the plan limit.
 * Returns true if within limit, false if exceeded.
 * -1 means unlimited.
 */
export declare function isWithinLimit(current: number, limit: number): boolean;
/**
 * Gets usage percentage (capped at 100 for unlimited).
 */
export declare function getUsagePercentage(used: number, limit: number): number;
/**
 * Ensures all Nexlify products and prices exist in Stripe.
 * Creates them if they don't exist, returns cached IDs if they do.
 */
export declare function ensureStripeProducts(): Promise<PlanPrices>;
/**
 * Gets or creates a Stripe customer for a tenant.
 */
export declare function getOrCreateCustomer(tenantId: string, email: string, name: string, existingCustomerId?: string | null): Promise<Stripe.Customer>;
/**
 * Creates a checkout session for a subscription.
 */
export declare function createCheckoutSession(customerId: string, priceId: string, tenantId: string, successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session>;
/**
 * Creates a billing portal session for customer self-service.
 */
export declare function createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>;
/**
 * Gets subscription details.
 */
export declare function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null>;
/**
 * Cancels a subscription at period end.
 */
export declare function cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<Stripe.Subscription>;
/**
 * Reactivates a cancelled subscription.
 */
export declare function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
/**
 * Updates a subscription to a new plan/price.
 */
export declare function updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription>;
/**
 * Constructs and verifies a webhook event.
 */
export declare function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
/**
 * Extracts subscription data from a Stripe event.
 */
export declare function extractSubscriptionData(subscription: Stripe.Subscription): {
    id: string;
    status: string;
    planId: string | null;
    billingCycle: string | null;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    tenantId: string | null;
};
/**
 * Lists invoices for a customer.
 */
export declare function listInvoices(customerId: string, limit?: number): Promise<Stripe.Invoice[]>;
export { stripe, NEXLIFY_PLANS };
//# sourceMappingURL=stripe.d.ts.map