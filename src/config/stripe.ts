import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export default stripePromise;

// Stripe Connect configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!,
  // Application fee percentage (7.9% platform fee to reach ~10% total with Stripe fees)
  applicationFeePercent: 0.079,
  // Connected account ID - provided for testing
  // In production, this should be dynamic based on the artist/seller
  connectedAccountId: 'acct_1Ru6p0Qo1HuV6Ppu', // Test connected account
};

// Helper function to calculate application fee
export const calculateApplicationFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.applicationFeePercent);
};

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};