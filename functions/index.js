const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const {FieldValue} = require('firebase-admin/firestore');

// Define the Stripe secret key as a secret parameter
const stripeSecretKey = defineSecret('BYTEFIT_STRIPE_SECRET');

// Stripe will be initialized inside functions to access runtime config
let stripe = null;

// Function to initialize Stripe with secret parameter (Firebase v2 compatible)
function initializeStripe(secretValue) {
  if (stripe) return stripe;
  
  try {
    let stripeKey = secretValue;
    
    // Clean the key of any potential invalid characters
    if (stripeKey) {
      stripeKey = stripeKey.toString().trim().replace(/[\r\n\t]/g, '');
    }
    
    logger.info('Initializing Stripe...');
    logger.info('Secret key available:', !!stripeKey);
    logger.info('Secret key length:', stripeKey ? stripeKey.length : 0);
    logger.info('Secret key starts with sk_:', stripeKey ? stripeKey.startsWith('sk_') : false);
    
    if (!stripeKey) {
      logger.warn('No Stripe secret key found');
      return null;
    }
    
    stripe = require('stripe')(stripeKey);
    logger.info('Stripe initialized successfully');
    return stripe;
  } catch (error) {
    logger.error('Failed to initialize Stripe:', error);
    return null;
  }
}

// Initialize Firebase Admin using Application Default Credentials (ADC)
admin.initializeApp();
const db = admin.firestore();

// BASIC FIREBASE FUNCTIONS FOR BYTEFIT

// Test function to verify Firebase connection
exports.testConnection = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    logger.info('Testing Firebase connection');
    res.json({
      success: true,
      message: 'Firebase Functions is working!',
      timestamp: new Date().toISOString(),
      projectId: 'bytefit-v2'
    });
  } catch (error) {
    logger.error('Error testing Firebase connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get shipping rates for a connected account
exports.getShippingRates = onRequest(
  { secrets: [stripeSecretKey] },
  async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    try {
      const stripeInstance = initializeStripe(stripeSecretKey.value());
      if (!stripeInstance) {
        throw new Error('Stripe not initialized');
      }

      const { connectedAccountId, orderTotal = 0 } = req.body;
      
      if (!connectedAccountId) {
        return res.status(400).json({
          error: { message: 'Connected account ID is required' }
        });
      }

      logger.info('Fetching shipping rates for connected account:', connectedAccountId);

      // Fetch shipping rates from the connected account
      const shippingRates = await stripeInstance.shippingRates.list(
        {
          active: true,
          limit: 10
        },
        {
          stripeAccount: connectedAccountId
        }
      );

      logger.info('Found shipping rates:', shippingRates.data.length);

      // Transform the rates for frontend consumption
      const transformedRates = shippingRates.data.map(rate => ({
        id: rate.id,
        display_name: rate.display_name,
        type: rate.type,
        fixed_amount: rate.fixed_amount,
        tax_behavior: rate.tax_behavior,
        delivery_estimate: rate.delivery_estimate
      }));

      // Add a basic free shipping option if order total is over AED 200
      if (orderTotal >= 20000) { // AED 200.00 in cents
        transformedRates.unshift({
          id: 'free_shipping',
          display_name: 'Free Shipping',
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'aed' },
          tax_behavior: 'exclusive'
        });
      }

      res.json({
        success: true,
        rates: transformedRates
      });

    } catch (error) {
      logger.error('Error fetching shipping rates:', error);
      res.status(500).json({
        error: {
          message: error.message,
          type: error.type || 'api_error'
        }
      });
    }
  }
);

// Get products from Firestore
exports.getProducts = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    logger.info('Fetching products from Firestore');
    const products = [];
    const snapshot = await db.collection('products')
      .get();
    
    snapshot.forEach((doc) => {
      products.push({id: doc.id, ...doc.data()});
    });
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({error: error.message});
  }
});

// Get user profile
exports.getUserProfile = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }
    
    logger.info('Fetching user profile for:', userId);
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({error: 'User not found'});
    }
    
    res.json({
      success: true,
      user: userDoc.data()
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({error: error.message});
  }
});

// Update user profile
exports.updateUserProfile = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { userId, ...updateData } = req.body;
    
    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }
    
    logger.info('Updating user profile for:', userId);
    
    // Add timestamp
    updateData.updatedAt = FieldValue.serverTimestamp();
    
    await db.collection('users').doc(userId).set(updateData, {merge: true});
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({error: error.message});
  }
});

// Create Stripe checkout session (v2)
exports.createCheckoutSessionV2 = onRequest(
  { secrets: [stripeSecretKey] },
  async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const stripeInstance = initializeStripe(stripeSecretKey.value());
    if (!stripeInstance) {
      logger.error('Stripe is not initialized');
      return res.status(500).json({error: 'Stripe configuration error'});
    }
    
    const { 
      items, 
      connectedAccountId, 
      selectedShippingRateId,
      customerEmail,
      successUrl = 'http://localhost:3000/success',
      cancelUrl = 'http://localhost:3000/cancel'
    } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({error: 'Items are required'});
    }
    
    logger.info('Creating Stripe checkout session with items:', items.length);
    logger.info('Connected Account ID:', connectedAccountId);
    logger.info('Selected Shipping Rate ID:', selectedShippingRateId);
    
    // Create line items for Stripe
    const lineItems = items.map(item => {
      const productData = {
        name: item.name,
        images: item.images || []
      };
      
      // Only add description if it's a non-empty string
      if (item.description && item.description.trim() !== '') {
        productData.description = item.description;
      }
      
      return {
        price_data: {
          currency: 'aed',
          product_data: productData,
          unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: item.quantity || 1
      };
    });
    
    // Handle shipping cost as a line item for Stripe checkout
    // Note: Shipping is added as a line item here for Stripe processing,
    // but will be separated from products during order creation in createOrderFromPaymentId
    // This avoids the issue of using connected account shipping rates in platform checkout
    if (req.body.shippingCost && req.body.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: {
            name: req.body.shippingName || 'Shipping & Handling'
          },
          unit_amount: Math.round(req.body.shippingCost * 100) // Convert to cents
        },
        quantity: 1
      });
      
      logger.info('Added shipping as line item for Stripe:', req.body.shippingCost, 'AED');
    }

    // Base session configuration
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail
    };
    
    // Calculate total amount for transfer calculation (including shipping)
    let totalAmount = items.reduce((sum, item) => {
      return sum + (Math.round(item.price * 100) * (item.quantity || 1));
    }, 0);
    
    // Add shipping cost to total if provided
    if (req.body.shippingCost && req.body.shippingCost > 0) {
      totalAmount += Math.round(req.body.shippingCost * 100);
    }
    
    // Always use platform model with transfer_data for connected accounts
    // Platform takes 10% fee, transfers 90% to connected account
    if (connectedAccountId) {
      const transferAmount = Math.round(totalAmount * 0.9);
      
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: connectedAccountId,
          amount: transferAmount
        }
      };
      
      logger.info('Transfer amount to connected account:', transferAmount / 100, 'AED');
      logger.info('Platform fee:', (totalAmount - transferAmount) / 100, 'AED');
    }

    // Always create the checkout session on platform account using platform API keys
    // This ensures platform maintains control over payments and can take fees
    const session = await stripeInstance.checkout.sessions.create(sessionConfig);

    logger.info('Checkout session created:', session.id);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      clientSecret: session.client_secret
    });

  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      error: {
        message: error.message,
        type: error.type || 'api_error'
      }
    });
  }
});

// Create order from Stripe payment session
exports.createOrderFromPaymentId = onRequest(
  { secrets: [stripeSecretKey] },
  async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const stripeInstance = initializeStripe(stripeSecretKey.value());
    if (!stripeInstance) {
      logger.error('Stripe is not initialized');
      return res.status(500).json({error: 'Stripe configuration error'});
    }
    
    const { sessionId, userId, customerEmail } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({error: 'Session ID is required'});
    }
    
    logger.info('Creating order from Stripe session:', sessionId);
    
    // Check if order already exists to prevent duplicates
    const existingOrderQuery = await db.collection('orders')
      .where('stripeSessionId', '==', sessionId)
      .limit(1)
      .get();
    
    if (!existingOrderQuery.empty) {
      const existingOrder = existingOrderQuery.docs[0];
      logger.info('Order already exists for session:', sessionId);
      return res.json({
        success: true,
        orderId: existingOrder.id,
        message: 'Order already exists'
      });
    }
    
    // Retrieve session from Stripe with expanded data
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });
    
    logger.info('Retrieved Stripe session:', {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total
    });
    
    // Validate payment status
    const isPaymentComplete = session.payment_status === 'paid' ||
      (session.payment_intent && session.payment_intent.status === 'succeeded');
    
    if (!isPaymentComplete) {
      logger.error('Payment not completed:', {
        payment_status: session.payment_status,
        payment_intent_status: session.payment_intent?.status
      });
      return res.status(400).json({
        error: `Payment not completed. Payment status: ${session.payment_status}`
      });
    }
    
    // Extract line items and separate shipping from products
    const lineItems = session.line_items?.data || [];
    const items = [];
    let shippingCost = 0;
    let shippingName = '';
    
    // Process line items to separate products from shipping
    lineItems.forEach(item => {
      const itemName = item.description || 'Product';
      
      // Check if this is a shipping item (common shipping keywords)
      const isShipping = itemName.toLowerCase().includes('shipping') || 
                        itemName.toLowerCase().includes('delivery') ||
                        itemName.toLowerCase().includes('handling');
      
      if (isShipping) {
        shippingCost = item.amount_total / 100; // Convert from cents
        shippingName = itemName;
      } else {
        // This is a product item
        items.push({
          name: itemName,
          price: item.amount_total / 100, // Convert from cents
          quantity: item.quantity,
          description: item.description
        });
      }
    });

    // Calculate subtotal (total minus shipping)
    const subtotal = (session.amount_total / 100) - shippingCost;

    // Build order data with separated shipping
    const orderData = {
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent?.id || null,
      userId: userId || null,
      customerEmail: customerEmail || session.customer_details?.email || null,
      items: items,
      subtotal: subtotal,
      shippingCost: shippingCost,
      shippingName: shippingName || 'Shipping & Handling',
      total: session.amount_total / 100, // Convert from cents
      currency: session.currency || 'aed',
      status: 'paid',
      paymentMethod: 'stripe',
      shippingAddress: session.shipping_details ? {
        name: session.shipping_details.name,
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country
      } : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    // Create order in Firestore
    const orderRef = await db.collection('orders').add(orderData);
    
    logger.info('Order created successfully:', orderRef.id);
    
    res.json({
      success: true,
      orderId: orderRef.id,
      order: {
        id: orderRef.id,
        ...orderData
      }
    });
    
  } catch (error) {
     logger.error('Error creating order from payment:', error);
     res.status(500).json({
       error: error.message || 'Failed to create order'
     });
   }
 });

// Get checkout session details
exports.getCheckoutSessionV2 = onRequest(
  { secrets: [stripeSecretKey] },
  async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    try {
      const stripeInstance = initializeStripe(stripeSecretKey.value());
      if (!stripeInstance) {
        logger.error('Stripe is not initialized');
        return res.status(500).json({error: 'Stripe configuration error'});
      }
      
      const sessionId = req.query.sessionId;
      
      if (!sessionId) {
        return res.status(400).json({error: 'Session ID is required'});
      }
      
      logger.info('Retrieving checkout session:', sessionId);
      
      // Retrieve session from Stripe
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'line_items']
      });
      
      logger.info('Retrieved session data:', {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        amount_total: session.amount_total
      });
      
      res.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email,
          customer_details: session.customer_details,
          shipping_details: session.shipping_details,
          line_items: session.line_items?.data || []
        }
      });
      
    } catch (error) {
      logger.error('Error retrieving checkout session:', error);
      res.status(500).json({
        error: error.message || 'Failed to retrieve checkout session'
      });
    }
  }
);

// Get user orders
exports.getUserOrdersV2 = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }
    
    logger.info('Fetching orders for user:', userId);
    
    const ordersQuery = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    ordersQuery.forEach(doc => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData,
        createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
        updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt
      });
    });
    
    logger.info(`Found ${orders.length} orders for user ${userId}`);
    
    res.json(orders);
    
  } catch (error) {
    logger.error('Error fetching user orders:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch orders'
    });
  }
});

// Get all orders (admin)
exports.getAllOrdersV2 = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    logger.info('Fetching all orders');
    
    const ordersQuery = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    ordersQuery.forEach(doc => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData,
        createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt,
        updatedAt: orderData.updatedAt?.toDate?.() || orderData.updatedAt
      });
    });
    
    logger.info(`Found ${orders.length} total orders`);
    
    res.json(orders);
    
  } catch (error) {
    logger.error('Error fetching all orders:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch orders'
    });
  }
});
