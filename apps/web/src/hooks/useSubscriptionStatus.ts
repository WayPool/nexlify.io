import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/services/api';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'suspended'
  | 'cancelled'
  | 'no_subscription'
  | 'subscription_not_found';

interface SubscriptionData {
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export function useSubscriptionStatus() {
  const query = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const response = await billingApi.getSubscription();
      return response.data as SubscriptionData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const isBlocked = query.data?.status
    ? ['suspended', 'past_due', 'unpaid', 'cancelled'].includes(query.data.status)
    : false;

  const blockReason = isBlocked ? query.data?.status as 'suspended' | 'past_due' | 'unpaid' | 'cancelled' : null;

  return {
    ...query,
    subscription: query.data,
    isBlocked,
    blockReason,
    isActive: query.data?.status === 'active' || query.data?.status === 'trialing',
  };
}
