// Client shipping management service for Stripe Connect

// Firebase Functions URLs (v2 functions use individual Cloud Run URLs)
const FUNCTION_URLS = {
  getShippingRates: process.env.REACT_APP_GET_SHIPPING_RATES_URL || 'https://getshippingrates-dri6av73tq-uc.a.run.app',
  // Add other function URLs as needed
};

export interface ShippingRate {
  id: string;
  display_name: string;
  amount: number;
  currency: string;
  delivery_estimate?: {
    minimum: { unit: string; value: number };
    maximum: { unit: string; value: number };
  };
  metadata?: Record<string, string>;
  active?: boolean;
}



export interface CheckoutRatesResponse {
  rates: ShippingRate[];
  qualifies_for_free_shipping: boolean;
  free_shipping_threshold: number;
  order_total: number;
  connected_account_id: string;
}



// List shipping rates for connected account
export const listShippingRates = async (
  connectedAccountId: string,
  options: { limit?: number; active?: boolean } = {}
): Promise<{ data: ShippingRate[] }> => {
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
  
  if (!response.ok) {
    throw new Error('Failed to list shipping rates');
  }
  
  const result = await response.json();
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
  freeShippingThreshold: number = 50
): Promise<CheckoutRatesResponse> => {
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
  
  if (!response.ok) {
    throw new Error('Failed to get checkout rates');
  }
  
  const result = await response.json();
  return result;
};

// Helper function to format amount for display
export const formatShippingAmount = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
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