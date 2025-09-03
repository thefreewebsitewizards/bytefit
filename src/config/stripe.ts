import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration for ByteFit marketplace
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RrxjBJHHLWU5Kg3VHOXKE8jF8NGrjpIsQ8xxXtjVS0vs4yuRgSLO5m1QsGFwivAPqhJ7i7rO50QmK880XDUzqk100Rptn1upQ',
  connectedAccountId: process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID || 'acct_1Ru6p0Qo1HuV6Ppu', // Connected account for marketplace
  applicationFeePercent: 0.079, // 7.9% platform fee (reaches ~10% with Stripe fees)
};

// Initialize Stripe with publishable key
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Utility functions for Stripe calculations
export const calculateApplicationFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.applicationFeePercent);
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100); // Convert to cents
};

export default stripePromise;