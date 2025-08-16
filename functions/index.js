const {onRequest} = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe");

// Initialize Firebase Admin with explicit project ID
admin.initializeApp({
  projectId: 'ksenia-munoz'
});
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;



// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for now, can be restricted later
  credentials: true,
  optionsSuccessStatus: 200,
};

// Helper function to calculate application fee
const calculateApplicationFee = (amount) => {
  const feePercent = 10; // 10% platform fee
  return Math.round(amount * (feePercent / 100));
};

// Helper function to format amount for Stripe
const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100); // Convert to cents
};

// Firebase Function: Get Shipping Rates for Connected Account
exports.getShippingRates = onRequest(
    {cors: corsOptions, invoker: 'public'},
    async (req, res) => {
      try {
        const stripeClient = stripe(functions.config().stripe.secret_key);
        const {connectedAccountId, orderTotal = 0} = req.body;

        if (!connectedAccountId || connectedAccountId === "acct_placeholder") {
          return res.status(400).json({
            error: "Connected account ID is required",
            message: "Please configure a valid Stripe connected account",
          });
        }

        // List shipping rates for the connected account only
        logger.info("Fetching shipping rates for account:", connectedAccountId);
        const shippingRates = await stripeClient.shippingRates.list(
            {
              active: true,
              limit: 10,
            },
            {
              stripeAccount: connectedAccountId,
            },
        );
        logger.info("Found shipping rates on connected account:", shippingRates.data.length, shippingRates.data.map((r) => ({id: r.id, name: r.display_name})));

        // Return error if no shipping rates found
        if (shippingRates.data.length === 0) {
          return res.status(404).json({
            error: "No shipping rates found",
            message: "Please configure shipping rates in your Stripe connected account dashboard",
            connected_account_id: connectedAccountId,
          });
        }

        // Check if qualifies for free shipping
        const qualifiesForFreeShipping = orderTotal >= 50;

        // Format rates for frontend with developer fee
        const developerShippingFee = 100; // $1 in cents
        const formattedRates = shippingRates.data.map((rate) => {
          const originalAmount = rate.fixed_amount?.amount || 0;
          const totalAmount = originalAmount + developerShippingFee;
          return {
            id: rate.id,
            display_name: rate.display_name + " (incl. processing fee)",
            amount: totalAmount,
            currency: rate.fixed_amount?.currency || "usd",
            delivery_estimate: rate.delivery_estimate,
            metadata: {
              ...rate.metadata,
              originalAmount: originalAmount,
              developerFee: developerShippingFee,
              totalAmount: totalAmount,
            },
            active: rate.active,
          };
        });

        logger.info("Applied developer shipping fee to rates for frontend", {
          ratesCount: formattedRates.length,
          developerFee: developerShippingFee / 100,
        });

        // Add free shipping option if qualified
        if (qualifiesForFreeShipping) {
          formattedRates.unshift({
            id: "free_shipping",
            display_name: "Free Shipping",
            amount: 0,
            currency: "usd",
            delivery_estimate: {
              minimum: {unit: "business_day", value: 5},
              maximum: {unit: "business_day", value: 10},
            },
            metadata: {type: "free"},
            active: true,
          });
        }

        res.json({
          rates: formattedRates,
          qualifies_for_free_shipping: qualifiesForFreeShipping,
          free_shipping_threshold: 50,
          order_total: orderTotal,
          connected_account_id: connectedAccountId,
        });
      } catch (error) {
        logger.error("Error fetching shipping rates:", error);
        res.status(500).json({
          error: "Failed to fetch shipping rates",
          details: error.message,
        });
      }
    },
);


// Firebase Function: Create Checkout Session (V2)
exports.createCheckoutSessionV2 = onRequest(
    {
      cors: corsOptions,
      invoker: 'public',
    },
    async (req, res) => {
      try {
        const stripeClient = stripe(functions.config().stripe.secret_key);
        const {
          items,
          customerEmail,
          userId,
          connectedAccountId,
          successUrl,
          cancelUrl,
          useStripeShipping,
          selectedShippingRateId,
        } = req.body;

        logger.info("Creating checkout session", {
          items,
          customerEmail,
          userId,
        });

        // Calculate totals
        const subtotal = items.reduce(
            (sum, item) => sum + (item.price * (item.quantity || 1)),
            0,
        );
        const qualifiesForFreeShipping = subtotal >= 50;

        // Validate connected account is required
        if (!connectedAccountId || connectedAccountId === "acct_placeholder") {
          return res.status(400).json({
            error: "Connected account ID is required for checkout",
          });
        }

        // Handle shipping options
        let shippingOptions = [];
        let selectedShippingCost = 0;
        let originalShippingCost = 0;
        let developerShippingFee = 0;

        // If a specific shipping rate is selected, use it directly
        if (selectedShippingRateId) {
          try {
            // Get the selected shipping rate details from connected account
            const selectedRate = await stripeClient.shippingRates.retrieve(
                selectedShippingRateId,
                {
                  stripeAccount: connectedAccountId,
                },
            );

            originalShippingCost = selectedRate.fixed_amount.amount / 100;
            developerShippingFee = 1.00; // $1 developer fee for shipping
            selectedShippingCost = originalShippingCost + developerShippingFee;

            // Create shipping rate data for platform account checkout session
            // We can't use shipping rates from connected account in platform account checkout
            // Add the developer fee to the shipping amount
            shippingOptions = [{
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: {
                  amount: formatAmountForStripe(selectedShippingCost),
                  currency: selectedRate.fixed_amount.currency,
                },
                display_name: selectedRate.display_name + " (incl. processing fee)",
                delivery_estimate: selectedRate.delivery_estimate || {
                  minimum: {unit: "business_day", value: 3},
                  maximum: {unit: "business_day", value: 7},
                },
              },
            }];

            logger.info("Applied developer shipping fee", {
              originalCost: originalShippingCost,
              developerFee: developerShippingFee,
              totalCost: selectedShippingCost,
          });

            logger.info("Using pre-selected shipping rate from connected account", {
              rateId: selectedShippingRateId,
              cost: selectedShippingCost,
              displayName: selectedRate.display_name,
            });
          } catch (error) {
            logger.error("Failed to retrieve selected shipping rate:", error);
            return res.status(400).json({
              error: "Invalid shipping rate selected",
            });
          }
        }

        // Get shipping rates from connected account only (when useStripeShipping is true)
        if (shippingOptions.length === 0 && useStripeShipping) {
          try {
            const shippingRates = await stripeClient.shippingRates.list(
                {
                  active: true,
                  limit: 10,
                },
                {
                  stripeAccount: connectedAccountId,
                },
            );

            // Return error if no shipping rates found
            if (shippingRates.data.length === 0) {
              return res.status(400).json({
                error: "No shipping rates configured",
                message: "Please configure shipping rates in your Stripe connected account dashboard before enabling shipping.",
                connected_account_id: connectedAccountId,
              });
            }

            // Convert connected account shipping rates to shipping_rate_data for platform checkout
            // We can't use shipping rates from connected account in platform account checkout
            // Add $1 developer fee to each shipping rate
            const developerShippingFeeAmount = 100; // $1 in cents
            shippingOptions = shippingRates.data.map((rate) => ({
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: {
                  amount: rate.fixed_amount.amount + developerShippingFeeAmount,
                  currency: rate.fixed_amount.currency,
                },
                display_name: rate.display_name + " (incl. processing fee)",
                delivery_estimate: rate.delivery_estimate || {
                  minimum: {unit: "business_day", value: 3},
                  maximum: {unit: "business_day", value: 7},
                },
              },
            }));

            logger.info("Applied developer shipping fee to all shipping rates", {
              originalRatesCount: shippingRates.data.length,
              developerFeeAmount: developerShippingFeeAmount / 100,
            });

            // Add free shipping option if qualified
            if (qualifiesForFreeShipping) {
              shippingOptions.unshift({
                shipping_rate_data: {
                  display_name: "Free Shipping (Orders $50+)",
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: 0,
                    currency: "usd",
                  },
                  delivery_estimate: {
                    minimum: {unit: "business_day", value: 5},
                    maximum: {unit: "business_day", value: 10},
                  },
                },
              });
            }
          } catch (error) {
            logger.error(
                "Failed to fetch shipping rates from connected account:",
                error,
            );
            return res.status(500).json({
              error: "Unable to fetch shipping rates from connected account. Please ensure shipping rates are configured in your Stripe connected account dashboard.",
              connected_account_id: connectedAccountId,
            });
          }
        }

        // Create line items
        const lineItems = items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: item.description || "Original watercolor artwork",
              images: item.imageUrl ? [item.imageUrl] : [],
            },
            unit_amount: formatAmountForStripe(item.price),
          },
          quantity: item.quantity || 1,
        }));

        // Ensure we have shipping options for checkout (only if shipping is enabled)
        if (useStripeShipping && shippingOptions.length === 0) {
          return res.status(400).json({
            error: "No shipping options available. Please configure shipping rates in your Stripe dashboard.",
          });
        }

        // Create checkout session
        const sessionParams = {
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: customerEmail,
        };

        // Add shipping-related parameters if shipping is enabled OR if a specific shipping rate is selected
        if (useStripeShipping || selectedShippingRateId) {
          sessionParams.shipping_address_collection = {
            allowed_countries: ["US", "CA"],
          };
          sessionParams.shipping_options = shippingOptions;
        }

        // Add metadata
        sessionParams.metadata = {
          userId: userId || "",
          customerEmail: customerEmail || "",
          orderItems: JSON.stringify(items),
        };

        // Add transfer and application fee for connected account (only if different from platform account)
        // Create session on platform account and transfer to connected account
        const platformAccountId = process.env.STRIPE_ACCOUNT_ID;
        if (connectedAccountId !== platformAccountId && connectedAccountId !== "acct_1RrxjBJHHLWU5Kg3") {
          const applicationFee = calculateApplicationFee(
              formatAmountForStripe(subtotal),
          );
          // Set both transfer and application fee when session is on platform account
          sessionParams.payment_intent_data = {
            transfer_data: {
              destination: connectedAccountId,
            },
            application_fee_amount: applicationFee,
          };
        }

        // Create session on platform account (not connected account)
        const session = await stripeClient.checkout.sessions.create(
            sessionParams,
        );

        const finalOrderTotal = subtotal + selectedShippingCost;

        res.json({
          id: session.id,
          url: session.url,
          subtotal,
          shippingCost: selectedShippingCost,
          orderTotal: finalOrderTotal,
          applicationFee: calculateApplicationFee(formatAmountForStripe(subtotal)) / 100,
          platformFeePercent: 10,
          freeShipping: qualifiesForFreeShipping && selectedShippingCost === 0,
          useStripeShipping: useStripeShipping && !selectedShippingRateId,
          selectedShippingRateId: selectedShippingRateId || null,
          shippingBreakdown: {
            actualCost: originalShippingCost,
            developerFee: developerShippingFee,
            total: selectedShippingCost,
          },
        });
      } catch (error) {
        logger.error("Error creating checkout session:", error);
        res.status(500).json({error: error.message});
      }
    });

// Firebase Function: Get Checkout Session
exports.getCheckoutSessionV2 = onRequest(
    {
      cors: corsOptions,
      invoker: 'public',
    },
    async (req, res) => {
      try {
        const stripeClient = stripe(functions.config().stripe.secret_key);
        const {sessionId} = req.query;

        if (!sessionId) {
          return res.status(400).json({error: "Session ID is required"});
        }



        const session = await stripeClient.checkout.sessions.retrieve(
            sessionId,
        );
        res.json({session: session});
      } catch (error) {
        logger.error("Error retrieving checkout session:", error);
        res.status(500).json({error: error.message});
      }
    });

// Webhook functionality removed - using direct order creation approach instead

// Firebase Function: Create Order from Stripe Session (for frontend)
exports.createOrderFromStripeSessionV2 = onRequest(
    {
      cors: corsOptions,
      invoker: 'public',
    },
    async (req, res) => {
      try {
        const {
          sessionId,
          userId,
          items,
          total,
          customerEmail,
          shippingAddress,
        } = req.body;

        logger.info("Creating order from session:", {
          sessionId,
          userId,
          total,
        });

        // Create order in Firestore
        const orderData = {
          stripeSessionId: sessionId,
          customerEmail,
          userId,
          items,
          total,
          currency: "usd",
          status: "paid",
          paymentMethod: "stripe",
          shippingAddress: shippingAddress || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const orderRef = await db.collection("orders").add(orderData);
        logger.info("Order created:", orderRef.id);

        res.json({orderId: orderRef.id, success: true});
      } catch (error) {
        logger.error("Error creating order:", error);
        res.status(500).json({error: error.message});
      }
    });

// Firebase Function: Get User Orders
exports.getUserOrdersV2 = onRequest({cors: corsOptions, invoker: 'public'}, async (req, res) => {
  try {
    const {userId} = req.query;

    if (!userId) {
      return res.status(400).json({error: "User ID is required"});
    }

    const ordersSnapshot = await db.collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    const orders = [];
    ordersSnapshot.forEach((doc) => {
      orders.push({id: doc.id, ...doc.data()});
    });

    res.json(orders);
  } catch (error) {
    logger.error("Error getting user orders:", error);
    res.status(500).json({error: error.message});
  }
});

// Firebase Function: Create Order from Payment ID (for manual/testing purposes)
// Clean, simplified order creation function
exports.createOrderFromPaymentId = onRequest({cors: corsOptions, invoker: 'public'}, async (req, res) => {
  try {
    const {sessionId, userId, customerEmail} = req.body;

    // Validate required parameters
    if (!sessionId) {
      return res.status(400).json({error: "Session ID is required"});
    }



    // Check if order already exists
    const existingOrder = await checkExistingOrder(sessionId);
    if (existingOrder) {
      return res.json({
        success: true,
        orderId: existingOrder.id,
        message: "Order already exists",
      });
    }

    // Get payment data
    const paymentData = await getPaymentData(sessionId);
    if (!paymentData.isValid) {
      return res.status(400).json({error: paymentData.error});
    }

    // Create order in Firestore
    const orderData = buildOrderData(paymentData, userId, customerEmail);
    const orderId = await createOrder(orderData);

    return res.json({
      success: true,
      orderId,
      message: "Order created successfully",
      order: orderData,
    });
  } catch (error) {
    logger.error("Error creating order:", error);
    return res.status(500).json({error: error.message});
  }
});

// Helper function to check if order already exists
async function checkExistingOrder(sessionId) {
  try {
    const snapshot = await db.collection("orders")
        .where("stripeSessionId", "==", sessionId)
        .limit(1)
        .get();

    return snapshot.empty ? null : {id: snapshot.docs[0].id, ...snapshot.docs[0].data()};
  } catch (error) {
    logger.warn("Could not check existing order due to permissions, proceeding with order creation:", error.message);
    // Return null to proceed with order creation
    return null;
  }
}

// Helper function to get payment data from Stripe
async function getPaymentData(sessionId) {
  try {


    // Handle real Stripe sessions
    const stripeClient = stripe(functions.config().stripe.secret_key);
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });



    // Validate payment status according to Stripe best practices
    // Check both payment_status and payment_intent status
    const isPaymentComplete = session.payment_status === "paid" ||
                             (session.payment_intent && session.payment_intent.status === "succeeded");



    if (!isPaymentComplete) {
      return {
        isValid: false,
        error: `Payment not completed. Payment status: ${session.payment_status}, Intent status: ${session.payment_intent?.status || "unknown"}`,
      };
    }

    // Extract items from line items
    const items = session.line_items?.data?.map((item) => ({
      name: item.description || "Unknown Item",
      price: (item.amount_total || 0) / 100,
      quantity: item.quantity || 1,
    })) || [];

    return {
      isValid: true,
      sessionId: session.id,
      paymentIntentId: session.payment_intent.id,
      amount: session.payment_intent.amount,
      currency: session.payment_intent.currency,
      status: session.payment_intent.status,
      customerEmail: session.customer_details?.email || session.customer_email,
      items,
      shippingAddress: session.shipping_details?.address || null,
    };
  } catch (error) {
    logger.error("Error retrieving payment data:", error);
    return {
      isValid: false,
      error: `Failed to retrieve payment data: ${error.message}`,
    };
  }
}

// Helper function to build order data object
function buildOrderData(paymentData, userId, customerEmail) {
  const now = new Date();

  return {
    stripeSessionId: paymentData.sessionId,
    stripePaymentIntentId: paymentData.paymentIntentId,
    userId: userId || null,
    customerEmail: customerEmail || paymentData.customerEmail,
    items: paymentData.items,
    total: paymentData.amount / 100, // Convert cents to dollars
    currency: paymentData.currency,
    status: "paid",
    paymentMethod: "stripe",
    shippingAddress: paymentData.shippingAddress,
    createdAt: now,
    updatedAt: now,
  };
}

// Helper function to create order in Firestore
async function createOrder(orderData) {
  try {
    const orderRef = await db.collection("orders").add(orderData);
    return orderRef.id;
  } catch (error) {
    logger.error("Error creating order in Firestore:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
}

// Legacy function for backward compatibility
exports.createOrderFromPaymentIdLegacy = onRequest({cors: corsOptions, invoker: 'public'}, async (req, res) => {
  try {
    const {paymentIntentId, sessionId} = req.body;

    if (!paymentIntentId && !sessionId) {
      return res.status(400).json({error: "Payment Intent ID or Session ID is required"});
    }



    // Initialize Stripe client
    const stripeClient = stripe(functions.config().stripe.secret_key);

    let session;
    let paymentIntent;

    {
      // If we have a session ID, retrieve the session and payment intent
      if (sessionId) {
        session = await stripeClient.checkout.sessions.retrieve(sessionId, {
          expand: ["payment_intent", "line_items"],
        });
        paymentIntent = session.payment_intent;
      } else {
        // If we only have payment intent ID, retrieve it directly
        paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
      }
    }



    // Check if we have valid payment information
    if (!paymentIntent) {
      return res.status(400).json({error: "No payment intent found for this session. Orders are only created after successful payment."});
    }

    // Check if payment is successful
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }

    // Check if order already exists for this session/payment
    const existingOrderQuery = await db.collection("orders")
        .where("stripeSessionId", "==", sessionId)
        .limit(1)
        .get();

    if (!existingOrderQuery.empty) {
      const existingOrder = existingOrderQuery.docs[0];
      logger.info("Order already exists:", existingOrder.id);
      return res.json({orderId: existingOrder.id, success: true, status: "already_exists"});
    }

    // Extract order details from session metadata or payment intent metadata
    const metadata = session?.metadata || paymentIntent.metadata || {};
    const customerEmail = session?.customer_details?.email || metadata.customerEmail;
    const userId = metadata.userId;

    let items = [];
    if (metadata.orderItems) {
      try {
        items = JSON.parse(metadata.orderItems);
      } catch (error) {
        logger.error("Error parsing order items from metadata:", error);
      }
    }

    // If we have session with line items, use those
    if (session?.line_items?.data) {
      items = session.line_items.data.map((item) => ({
        name: item.description,
        price: item.amount_total / 100, // Convert from cents
        quantity: item.quantity,
      }));
    }

    // Create order data
    const orderData = {
      stripeSessionId: session?.id || null,
      stripePaymentIntentId: paymentIntent.id,
      customerEmail: customerEmail,
      userId: userId || null,
      items: items,
      total: paymentIntent.amount / 100, // Convert from cents to dollars
      currency: paymentIntent.currency,
      status: "paid",
      paymentMethod: "stripe",
      shippingAddress: session?.shipping_details?.address || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };



    // Check if order already exists by payment intent ID (secondary check)
    const existingPaymentOrderQuery = await db.collection("orders")
        .where("stripePaymentIntentId", "==", paymentIntent.id)
        .get();

    if (!existingPaymentOrderQuery.empty) {
      const existingOrder = existingPaymentOrderQuery.docs[0];
      return res.json({
        orderId: existingOrder.id,
        success: true,
        message: "Order already exists",
        order: existingOrder.data(),
      });
    }

    // Create new order
    const orderRef = await db.collection("orders").add(orderData);
    logger.info("Order created successfully:", orderRef.id);

    res.json({
      orderId: orderRef.id,
      success: true,
      message: "Order created successfully",
      order: orderData,
    });
  } catch (error) {
    logger.error("Error creating order from payment ID:", error);
    res.status(500).json({error: error.message});
  }
});

// Firebase Function: Get All Orders (Admin)
exports.getAllOrdersV2 = onRequest({cors: corsOptions, invoker: 'public'}, async (req, res) => {
  try {
    const ordersSnapshot = await db.collection("orders")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

    const orders = [];
    ordersSnapshot.forEach((doc) => {
      orders.push({id: doc.id, ...doc.data()});
    });

    res.json(orders);
  } catch (error) {
    logger.error("Error getting all orders:", error);
    res.status(500).json({error: error.message});
  }
});
