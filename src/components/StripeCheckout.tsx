import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ShippingRate } from '../services/clientShipping';
import { createCheckoutSession } from '../services/stripe';
import { STRIPE_CONFIG } from '../config/stripe';

interface StripeCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  selectedShippingRate?: ShippingRate | null;
}


const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onSuccess, onCancel, disabled = false, selectedShippingRate }) => {
  const { items, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  const handleCheckout = async () => {
    console.log('🔥 Checkout button clicked!');
    console.log('📦 Items in cart:', items);
    console.log('👤 Current user:', currentUser);
    
    if (items.length === 0) {
      console.log('❌ No items in cart, aborting checkout');
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    
    try {
      // Create checkout session with Stripe Connect
      const session = await createCheckoutSession({
        items,
        customerEmail: currentUser?.email || 'guest@example.com',
        connectedAccountId: STRIPE_CONFIG.connectedAccountId,
        successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart`,
        shippingCost: selectedShippingRate ? (selectedShippingRate.fixed_amount?.amount || selectedShippingRate.amount || 0) / 100 : undefined,
        shippingName: selectedShippingRate?.display_name,
      });

      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initialize checkout. Please try again.');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // handleCheckout now manages loading state internally
    await handleCheckout();
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No items in cart</p>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-black hover:to-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Proceed to Checkout</span>
        </>
      )}
    </button>
  );
};

export default StripeCheckout;