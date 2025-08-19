const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const {FieldValue} = require('firebase-admin/firestore');

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
    logger.error('Error testing connection:', error);
    res.status(500).json({error: error.message});
  }
});

// Get all products from Firestore
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
    const productsSnapshot = await db.collection('products')
        .where('active', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

    const products = [];
    productsSnapshot.forEach((doc) => {
      products.push({id: doc.id, ...doc.data()});
    });

    res.json({
      success: true,
      products: products,
      count: products.length
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
    const {userId} = req.body;
    
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
      user: {id: userDoc.id, ...userDoc.data()}
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({error: error.message});
  }
});

// Create or update user profile
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
    const {userId, userData} = req.body;
    
    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }

    logger.info('Updating user profile for:', userId);
    
    const updateData = {
      ...userData,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).set(updateData, {merge: true});

    res.json({
       success: true,
       message: 'User profile updated successfully'
     });
   } catch (error) {
     logger.error('Error updating user profile:', error);
     res.status(500).json({error: error.message});
   }
 });
