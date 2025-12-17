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
        readonly name: "Nexlify Essential";
        readonly description: "Para equipos pequeños que comienzan con la gestión de riesgos";
        readonly monthlyPrice: 37500;
        readonly yearlyPrice: 375000;
        readonly features: readonly ["Hasta 10 usuarios", "3 módulos incluidos", "Motor de riesgos", "Dashboard completo", "Anclaje blockchain estándar", "Soporte por email"];
    };
    readonly professional: {
        readonly name: "Nexlify Professional";
        readonly description: "Para organizaciones en crecimiento con necesidades avanzadas";
        readonly monthlyPrice: 235000;
        readonly yearlyPrice: 2350000;
        readonly features: readonly ["Hasta 50 usuarios", "10 módulos incluidos", "Motor de riesgos", "Dashboard completo", "Anclaje blockchain avanzado", "Asistente IA", "API completa", "SSO / SAML", "Soporte prioritario"];
    };
    readonly enterprise: {
        readonly name: "Nexlify Enterprise";
        readonly description: "Para grandes empresas con requisitos de seguridad máxima";
        readonly monthlyPrice: 750000;
        readonly yearlyPrice: 7500000;
        readonly features: readonly ["Usuarios ilimitados", "Todos los módulos", "Motor de riesgos", "Dashboard completo", "Anclaje blockchain dedicado", "Asistente IA avanzado", "Integraciones personalizadas", "SLA personalizado", "Account manager dedicado", "Soporte 24/7", "On-premise disponible"];
    };
};
export type PlanId = keyof typeof NEXLIFY_PLANS;
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