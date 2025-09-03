// Stripe Connect integration with backend API calls
// This file handles all Stripe-related operations through our backend API

import { CartItem } from './firebase';
import { STRIPE_CONFIG } from '../config/stripe';

// Firebase Functions API base URL - using local emulator for testing
const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-bytefit-v2.cloudfunctions.net';

// Types for Stripe integration
export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  connectedAccountId?: string; // Made optional to support direct payments
  successUrl: string;
  cancelUrl: string;
  selectedShippingRateId?: string; // Deprecated - use shippingCost instead
  shippingCost?: number;
  shippingName?: string;
}

export interface StripeCheckoutSession {
  id: string;
  url?: string;
  client_secret?: string;
}

// Create a Stripe Checkout Session through our backend API
export const createCheckoutSession = async (data: CheckoutSessionData): Promise<StripeCheckoutSession> => {

  
  try {
    const response = await fetch(`${API_BASE_URL}/createCheckoutSessionV2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: data.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || 'Original watercolor artwork',
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl
        })),
        customerEmail: data.customerEmail,
        connectedAccountId: data.connectedAccountId || STRIPE_CONFIG.connectedAccountId,
        ...(data.shippingCost && { shippingCost: data.shippingCost }),
        ...(data.shippingName && { shippingName: data.shippingName }),
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: {
          source: 'bytefit-frontend',
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create checkout session');
    }

    const result = await response.json();
    
    return {
      id: result.sessionId,
      client_secret: result.clientSecret,
      url: result.url
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create order from Stripe session after successful payment
export const createOrderFromStripeSession = async (data: {
  sessionId: string;
  userId?: string;
  customerEmail?: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/createOrderFromPaymentId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: data.sessionId,
        userId: data.userId,
        customerEmail: data.customerEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order from payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order from Stripe session:', error);
    throw error;
  }
};

// Function to retrieve checkout session status
export const getCheckoutSession = async (sessionId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getCheckoutSessionV2?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve checkout session');
    }

    const result = await response.json();
    return result.session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

// Helper function to create a payment intent for custom payment flows
export const createPaymentIntent = async (data: CheckoutSessionData): Promise<any> => {
  try {
    const totalAmount = data.items.reduce((sum, item) => sum + item.price, 0);
    
    const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'aed',
        customerEmail: data.customerEmail,
        connectedAccountId: data.connectedAccountId,
        metadata: {
          orderItems: JSON.stringify(data.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
          }))),
          customerEmail: data.customerEmail,
          source: 'bytefit-frontend'
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create payment intent');
    }

    const result = await response.json();
    return {
      id: result.paymentIntentId,
      client_secret: result.clientSecret,
      amount: result.amount,
      application_fee_amount: result.applicationFee
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Function to get payment intent status
export const getPaymentIntent = async (paymentIntentId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/payment-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve payment intent');
    }

    const result = await response.json();
    return result.paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Function to create a refund
export const createRefund = async (paymentIntentId: string, amount?: number, reason?: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
        reason: reason || 'requested_by_customer'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create refund');
    }

    const result = await response.json();
    return result.refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};