# Stripe Checkout & Payment Implementation Guide

This document provides a comprehensive guide for implementing Stripe checkout and payment handling in an e-commerce marketplace using React, Firebase Functions, and Stripe Connect.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Stripe Connect Integration](#stripe-connect-integration)
5. [Payment Flow](#payment-flow)
6. [Shipping Integration](#shipping-integration)
7. [Security & Validation](#security--validation)
8. [Environment Setup](#environment-setup)
9. [Dependencies](#dependencies)
10. [Code Examples](#code-examples)

## Architecture Overview

### System Components
- **Frontend**: React TypeScript application with Stripe.js
- **Backend**: Firebase Cloud Functions for Stripe API integration
- **Database**: Firestore for order and user management
- **Payment Processing**: Stripe Connect marketplace model
- **Hosting**: Firebase Hosting for static assets

### Payment Model
- **Marketplace Architecture**: Platform connects multiple sellers (artists)
- **Stripe Connect**: Express accounts for sellers
- **Platform Fees**: 10% application fee on all transactions
- **Automatic Transfers**: Funds automatically distributed to sellers
- **Hosted Checkout**: Stripe's secure checkout pages

## Frontend Implementation

### Key Files Structure
```
src/
├── components/
│   ├── StripeCheckout.tsx      # Main checkout component
│   ├── ShippingSelector.tsx    # Shipping rate selection
│   └── ArtistDashboard.tsx     # Seller dashboard
├── services/
│   ├── stripe.ts               # Stripe API calls
│   ├── stripeConnect.ts        # Connect account management
│   └── clientShipping.ts       # Shipping rate management
├── config/
│   └── stripe.ts               # Stripe configuration
└── context/
    ├── CartContext.tsx         # Shopping cart state
    └── AuthContext.tsx         # User authentication
```

### Core Components

#### 1. Stripe Checkout Component
```typescript
// StripeCheckout.tsx - Main checkout button and flow
const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  onSuccess, 
  onCancel, 
  disabled, 
  selectedShippingRate 
}) => {
  const { items, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const handleCheckout = async () => {
    const session = await createCheckoutSession({
      items,
      customerEmail: currentUser?.email,
      connectedAccountId: process.env.REACT_APP_STRIPE_CONNECTED_ACCOUNT_ID,
      successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cart`,
      selectedShippingRateId: selectedShippingRate?.id,
    });
    
    if (session.url) {
      window.location.href = session.url;
    }
  };
};
```

#### 2. Stripe Service Layer
```typescript
// services/stripe.ts - API communication
export const createCheckoutSession = async (data: CheckoutSessionData): Promise<StripeCheckoutSession> => {
  const response = await fetch(`${API_BASE_URL}/createCheckoutSessionV2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      connectedAccountId: data.connectedAccountId,
      selectedShippingRateId: data.selectedShippingRateId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      metadata: {
        source: 'frontend-app',
        timestamp: new Date().toISOString()
      }
    }),
  });
  
  return await response.json();
};
```

#### 3. Configuration
```typescript
// config/stripe.ts - Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!,
  applicationFeePercent: 0.079, // 7.9% platform fee (reaches ~10% with Stripe fees)
  connectedAccountId: 'acct_1Ru6p0Qo1HuV6Ppu', // Test connected account
};

export const calculateApplicationFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.applicationFeePercent);
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100); // Convert to cents
};
```

## Backend Implementation

### Firebase Functions Structure
```
functions/
├── index.js                    # Main functions file
├── package.json               # Dependencies
└── .eslintrc.js               # Linting configuration
```

### Key Cloud Functions

#### 1. Create Checkout Session
```javascript
// functions/index.js - createCheckoutSessionV2
exports.createCheckoutSessionV2 = onRequest({
  cors: corsOptions,
  invoker: 'public',
}, async (req, res) => {
  const stripeClient = stripe(functions.config().stripe.secret_key);
  const {
    items,
    customerEmail,
    connectedAccountId,
    successUrl,
    cancelUrl,
    selectedShippingRateId,
  } = req.body;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Create line items
  const lineItems = items.map((item) => ({
    price_data: {
      currency: "aed",
      product_data: {
        name: item.name,
        description: item.description || "Original watercolor artwork",
        images: item.imageUrl ? [item.imageUrl] : [],
      },
      unit_amount: formatAmountForStripe(item.price),
    },
    quantity: item.quantity || 1,
  }));

  // Create checkout session with Connect transfer
  const sessionParams = {
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    payment_intent_data: {
      transfer_data: {
        destination: connectedAccountId,
      },
      application_fee_amount: calculateApplicationFee(formatAmountForStripe(subtotal)),
    },
  };

  const session = await stripeClient.checkout.sessions.create(sessionParams);
  res.json({ id: session.id, url: session.url });
});
```

#### 2. Order Creation from Payment
```javascript
// functions/index.js - createOrderFromPaymentId
exports.createOrderFromPaymentId = onRequest({
  cors: corsOptions, 
  invoker: 'public'
}, async (req, res) => {
  const { sessionId, userId, customerEmail } = req.body;
  
  // Check if order already exists
  const existingOrder = await checkExistingOrder(sessionId);
  if (existingOrder) {
    return res.json({ success: true, orderId: existingOrder.id });
  }

  // Get payment data from Stripe
  const paymentData = await getPaymentData(sessionId);
  if (!paymentData.isValid) {
    return res.status(400).json({ error: paymentData.error });
  }

  // Create order in Firestore
  const orderData = buildOrderData(paymentData, userId, customerEmail);
  const orderId = await createOrder(orderData);

  res.json({ success: true, orderId, order: orderData });
});
```

#### 3. Payment Validation
```javascript
// functions/index.js - getPaymentData helper
async function getPaymentData(sessionId) {
  const stripeClient = stripe(functions.config().stripe.secret_key);
  const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items"],
  });

  // Validate payment status
  const isPaymentComplete = session.payment_status === "paid" ||
    (session.payment_intent && session.payment_intent.status === "succeeded");

  if (!isPaymentComplete) {
    return {
      isValid: false,
      error: `Payment not completed. Status: ${session.payment_status}`,
    };
  }

  return {
    isValid: true,
    sessionId: session.id,
    paymentIntentId: session.payment_intent.id,
    amount: session.payment_intent.amount,
    currency: session.payment_intent.currency,
    customerEmail: session.customer_details?.email,
    items: session.line_items?.data?.map((item) => ({
      name: item.description,
      price: item.amount_total / 100,
      quantity: item.quantity,
    })),
    shippingAddress: session.shipping_details?.address,
  };
}
```

## Stripe Connect Integration

### Artist Account Management

#### 1. Create Connected Account
```typescript
// services/stripeConnect.ts - createConnectedAccount
export const createConnectedAccount = async (email: string, country: string = 'US'): Promise<ConnectedAccount> => {
  const response = await fetch(`${API_BASE_URL}/connect/create-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      country,
      type: 'express',
      businessType: 'individual',
      metadata: {
        platform: 'moroz-art',
        userType: 'artist',
        registrationDate: new Date().toISOString()
      }
    }),
  });
  
  return await response.json();
};
```

#### 2. Account Onboarding
```typescript
// services/stripeConnect.ts - createAccountLink
export const createAccountLink = async (accountId: string, type: string = 'account_onboarding'): Promise<AccountLink> => {
  const response = await fetch(`${API_BASE_URL}/connect/create-account-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, type }),
  });
  
  return await response.json();
};
```

#### 3. Dashboard Access
```typescript
// services/stripeConnect.ts - createLoginLink
export const createLoginLink = async (accountId: string): Promise<{ url: string }> => {
  const response = await fetch(`${API_BASE_URL}/connect/create-login-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId }),
  });
  
  return await response.json();
};
```

## Payment Flow

### Complete Payment Sequence

1. **Cart Management**
   - User adds items to cart via CartContext
   - Cart state managed in React Context

2. **Checkout Initiation**
   - User clicks "Proceed to Checkout" button
   - StripeCheckout component handles click event

3. **Session Creation**
   - Frontend calls createCheckoutSession service
   - Service makes POST request to Firebase Function
   - Function creates Stripe checkout session with Connect transfer

4. **Payment Processing**
   - User redirected to Stripe's hosted checkout page
   - User enters payment information
   - Stripe processes payment and transfers funds

5. **Success Handling**
   - User redirected to success URL with session_id
   - OrderConfirmation page loads
   - Page calls createOrderFromPaymentId to create order

6. **Order Creation**
   - Backend validates payment with Stripe
   - Order created in Firestore with all details
   - User sees order confirmation

### Error Handling
```typescript
// Error handling in checkout flow
try {
  const session = await createCheckoutSession(checkoutData);
  if (session.url) {
    window.location.href = session.url;
  }
} catch (error) {
  console.error('Checkout error:', error);
  toast.error('Failed to initialize checkout. Please try again.');
}
```

## Shipping Integration

### Dynamic Shipping Rates
```javascript
// functions/index.js - getShippingRates
exports.getShippingRates = onRequest({
  cors: corsOptions,
  invoker: 'public'
}, async (req, res) => {
  const stripeClient = stripe(functions.config().stripe.secret_key);
  const { connectedAccountId, orderTotal = 0 } = req.body;

  // Fetch shipping rates from connected account
  const shippingRates = await stripeClient.shippingRates.list(
    { active: true, limit: 10 },
    { stripeAccount: connectedAccountId }
  );

  // Add developer fee to shipping rates
  const developerShippingFee = 367; // AED 3.67 in cents
  const formattedRates = shippingRates.data.map((rate) => ({
    id: rate.id,
    display_name: rate.display_name + " (incl. processing fee)",
    amount: rate.fixed_amount.amount + developerShippingFee,
    currency: rate.fixed_amount.currency,
    delivery_estimate: rate.delivery_estimate,
  }));

  // Add free shipping for orders AED 200+
  const qualifiesForFreeShipping = orderTotal >= 200;
  if (qualifiesForFreeShipping) {
    formattedRates.unshift({
      id: "free_shipping",
      display_name: "Free Shipping",
      amount: 0,
      currency: "usd",
    });
  }

  res.json({
    rates: formattedRates,
    qualifies_for_free_shipping: qualifiesForFreeShipping,
    free_shipping_threshold: 50,
  });
});
```

### Shipping Rate Selection
```typescript
// components/ShippingSelector.tsx
const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  orderTotal,
  connectedAccountId,
  onShippingSelect,
  selectedShippingRate
}) => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await getCheckoutRates({
          orderTotal,
          connectedAccountId
        });
        setRates(response.rates);
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
      } finally {
        setLoading(false);
      }
    };

    if (connectedAccountId) {
      fetchRates();
    }
  }, [orderTotal, connectedAccountId]);

  return (
    <div className="shipping-selector">
      {rates.map((rate) => (
        <div key={rate.id} className="shipping-option">
          <input
            type="radio"
            id={rate.id}
            name="shipping"
            value={rate.id}
            checked={selectedShippingRate?.id === rate.id}
            onChange={() => onShippingSelect(rate)}
          />
          <label htmlFor={rate.id}>
            {rate.display_name} - {formatShippingAmount(rate.amount, rate.currency)}
          </label>
        </div>
      ))}
    </div>
  );
};
```

## Security & Validation

### Payment Verification
```javascript
// Strict payment validation before order creation
const isPaymentComplete = session.payment_status === 'paid' ||
  (session.payment_intent && session.payment_intent.status === 'succeeded');

if (!isPaymentComplete) {
  return {
    isValid: false,
    error: `Payment not completed. Payment status: ${session.payment_status}`
  };
}
```

### CORS Configuration
```javascript
// functions/index.js - CORS setup
const corsOptions = {
  origin: true, // Configure for production
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Duplicate Order Prevention
```javascript
// Check for existing orders before creation
async function checkExistingOrder(sessionId) {
  const snapshot = await db.collection("orders")
    .where("stripeSessionId", "==", sessionId)
    .limit(1)
    .get();

  return snapshot.empty ? null : {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };
}
```

## Environment Setup

### Frontend Environment Variables
```bash
# .env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net
REACT_APP_STRIPE_CONNECTED_ACCOUNT_ID=acct_your_connected_account_id
```

### Backend Configuration
```bash
# Firebase Functions config
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
```

### Firebase Configuration
```javascript
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs22"
  },
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

## Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^7.8.0",
    "firebase": "^12.0.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.7.1",
    "react-toastify": "^11.0.5",
    "typescript": "^4.9.5"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "firebase-admin": "^12.7.0",
    "firebase-functions": "^6.0.1",
    "stripe": "^18.4.0"
  }
}
```

## Code Examples

### Complete Checkout Flow Example
```typescript
// Complete checkout implementation
const CheckoutPage: React.FC = () => {
  const { items, total } = useCart();
  const { currentUser } = useAuth();
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedShipping) {
      toast.error('Please select a shipping option');
      return;
    }

    setLoading(true);
    try {
      const session = await createCheckoutSession({
        items,
        customerEmail: currentUser?.email || 'guest@example.com',
        connectedAccountId: process.env.REACT_APP_STRIPE_CONNECTED_ACCOUNT_ID!,
        successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart`,
        selectedShippingRateId: selectedShipping.id,
      });

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="order-summary">
        {items.map(item => (
          <div key={item.id} className="order-item">
            <span>{item.name}</span>
            <span>AED {item.price}</span>
          </div>
        ))}
        <div className="total">Total: AED {total}</div>
      </div>

      <ShippingSelector
        orderTotal={total}
        connectedAccountId={process.env.REACT_APP_STRIPE_CONNECTED_ACCOUNT_ID}
        onShippingSelect={setSelectedShipping}
        selectedShippingRate={selectedShipping}
      />

      <button
        onClick={handleCheckout}
        disabled={loading || !selectedShipping}
        className="checkout-button"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
};
```

### Order Confirmation Implementation
```typescript
// Order confirmation page
const OrderConfirmation: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { clearCart } = useCart();

  useEffect(() => {
    const createOrder = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        toast.error('Invalid order session');
        return;
      }

      try {
        const result = await createOrderFromStripeSession({
          sessionId,
          userId: currentUser?.uid,
          customerEmail: currentUser?.email
        });

        if (result.success) {
          setOrder(result.order);
          clearCart();
          toast.success('Order created successfully!');
        }
      } catch (error) {
        console.error('Order creation error:', error);
        toast.error('Failed to create order');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [currentUser, clearCart]);

  if (loading) {
    return <div className="loading">Creating your order...</div>;
  }

  if (!order) {
    return <div className="error">Failed to create order</div>;
  }

  return (
    <div className="order-confirmation">
      <h1>Order Confirmed!</h1>
      <div className="order-details">
        <p>Order ID: {order.id}</p>
        <p>Total: AED {order.total}</p>
        <p>Status: {order.status}</p>
      </div>
      <div className="order-items">
        {order.items.map((item, index) => (
          <div key={index} className="order-item">
            <span>{item.name}</span>
            <span>AED {item.price} x {item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Error Handling
- Always wrap Stripe API calls in try-catch blocks
- Provide user-friendly error messages
- Log detailed errors for debugging
- Implement retry logic for transient failures

### 2. Security
- Never expose secret keys in frontend code
- Validate all payments server-side
- Use HTTPS for all communications
- Implement proper CORS policies

### 3. User Experience
- Show loading states during payment processing
- Provide clear feedback for all actions
- Handle edge cases gracefully
- Implement proper navigation flows

### 4. Testing
- Use Stripe test keys for development
- Test all payment scenarios
- Verify webhook handling
- Test error conditions

### 5. Monitoring
- Log all payment events
- Monitor for failed payments
- Track conversion rates
- Set up alerts for critical issues

This implementation provides a robust, secure, and scalable payment system suitable for marketplace e-commerce platforms with multiple sellers.