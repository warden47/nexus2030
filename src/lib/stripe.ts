// lib/stripe.ts
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import type { PremiumTier } from '@/types/nexus';

// ─── Stripe public key from environment ─────────────────
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// ─── Plan details constant ─────────────────────────────
export interface PlanDetails {
  price: number;    // in USD
  label: string;
  features: string[];
}

export const PLAN_DETAILS: Record<PremiumTier, PlanDetails> = {
  free: {
    price: 0,
    label: 'Free',
    features: ['720p quality', 'Ad-supported', 'Limited watch parties'],
  },
  plus: {
    price: 9.99,
    label: 'Plus',
    features: ['1080p quality', 'No ads', 'Watch parties', 'Offline downloads'],
  },
  ultimate: {
    price: 19.99,
    label: 'Ultimate',
    features: ['4K HDR', 'No ads', 'Watch parties', 'Offline downloads', 'Early access', 'Exclusive content'],
  },
};

// ─── Stripe instance (lazy loaded) ──────────────────────
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// ─── 1. Redirect to checkout ────────────────────────────
export async function redirectToCheckout(
  plan: PremiumTier,
  userId: string
): Promise<void> {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session.');

    const { sessionId, url } = await response.json();

    if (url) {
      // Direct link (fallback)
      window.location.href = url;
      return;
    }

    if (sessionId) {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe failed to load.');
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    }
  } catch (error) {
    console.error('redirectToCheckout failed:', error);
    throw error;
  }
}

// ─── 2. Get subscription status ─────────────────────────
export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
  plan: PremiumTier;
  renewsAt: string | null;  // ISO date
}

export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus | null> {
  try {
    const response = await fetch(
      `/api/subscription?userId=${encodeURIComponent(userId)}`
    );
    if (!response.ok) throw new Error('Failed to fetch subscription.');
    return await response.json();
  } catch (error) {
    console.error('getSubscriptionStatus failed:', error);
    return null;
  }
}

// ─── 3. Cancel subscription ─────────────────────────────
export async function cancelSubscription(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to cancel subscription.');
  } catch (error) {
    console.error('cancelSubscription failed:', error);
    throw error;
  }
}