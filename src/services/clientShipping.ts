// Client shipping management service for Stripe Connect

// Firebase Functions URLs - using local emulator for development
const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'http://127.0.0.1:5003/bytefit-v2/us-central1';

const FUNCTION_URLS = {
  getShippingRates: `${API_BASE_URL}/getShippingRates`,
  // Add other function URLs as needed
};

export interface ShippingRate {
  id: string;
  display_name: string;
  type: string;
  fixed_amount?: {
    amount: number;
    currency: string;
  };
  amount?: number; // For backward compatibility
  currency?: string; // For backward compatibility
  tax_behavior?: string;
  delivery_estimate?: {
    minimum: { unit: string; value: number };
    maximum: { unit: string; value: number };
  };
  metadata?: Record<string, string>;
  active?: boolean;
}



export interface CheckoutRatesResponse {
  success: boolean;
  rates: ShippingRate[];
}



// List shipping rates for connected account
export const listShippingRates = async (
  connectedAccountId: string,
  options: { limit?: number; active?: boolean } = {}
): Promise<{ data: ShippingRate[] }> => {
  console.log('🚚 Fetching shipping rates from:', FUNCTION_URLS.getShippingRates);
  console.log('📦 Connected Account ID:', connectedAccountId);
  
  const response = await fetch(FUNCTION_URLS.getShippingRates, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connectedAccountId,
      orderTotal: 0 // Just for listing, not calculating free shipping
    })
  });
  
  console.log('📡 Shipping rates response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Shipping rates error response:', errorText);
    throw new Error('Failed to list shipping rates');
  }
  
  const result = await response.json();
  console.log('✅ Shipping rates data received:', result);
  return { data: result.rates };
};

// Update shipping rate (archive/unarchive)
export const updateShippingRate = async (
  connectedAccountId: string,
  rateId: string,
  updates: { active?: boolean; metadata?: Record<string, string> }
): Promise<ShippingRate> => {
  const response = await fetch(`${FUNCTION_URLS.getShippingRates}/shipping/stripe-rates/${rateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...updates,
      connected_account_id: connectedAccountId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update shipping rate');
  }
  
  const result = await response.json();
  return result.data;
};



// Get shipping rates for checkout
export const getCheckoutRates = async (
  connectedAccountId: string,
  orderTotal: number,
  freeShippingThreshold: number = 200
): Promise<CheckoutRatesResponse> => {
  console.log('🛒 Fetching checkout shipping rates from:', FUNCTION_URLS.getShippingRates);
  console.log('💰 Order total:', orderTotal, 'Connected Account ID:', connectedAccountId);
  
  const response = await fetch(FUNCTION_URLS.getShippingRates, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connectedAccountId,
      orderTotal
    })
  });
  
  console.log('📡 Checkout rates response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Checkout rates error response:', errorText);
    throw new Error('Failed to get checkout rates');
  }
  
  const result = await response.json();
  console.log('✅ Checkout rates data received:', result);
  return result;
};

// Helper function to format amount for display
export const formatShippingAmount = (rate: ShippingRate): string => {
  const amount = rate.fixed_amount?.amount ?? rate.amount ?? 0;
  const currency = rate.fixed_amount?.currency ?? rate.currency ?? 'aed';
  
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
};

// Helper function to format delivery estimate
export const formatDeliveryEstimate = (estimate?: {
  minimum: { unit: string; value: number };
  maximum: { unit: string; value: number };
}): string => {
  if (!estimate) return 'Standard delivery';
  
  const { minimum, maximum } = estimate;
  const unit = minimum.unit === 'business_day' ? 'business day' : minimum.unit;
  const unitPlural = minimum.unit === 'business_day' ? 'business days' : `${minimum.unit}s`;
  
  if (minimum.value === maximum.value) {
    return `${minimum.value} ${minimum.value === 1 ? unit : unitPlural}`;
  }
  
  return `${minimum.value}-${maximum.value} ${unitPlural}`;
};