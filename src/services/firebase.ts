import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Test Firestore by trying to get a collection reference
    const testCollection = collection(db, 'Products');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

// Types
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  createdAt?: Timestamp;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  paymentMethod?: string;
  stripeSessionId?: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: Timestamp;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
}

export interface Customer {
  id?: string;
  email: string;
  name?: string;
  createdAt?: Timestamp;
}

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
  userType?: 'customer' | 'admin';
  createdAt?: Timestamp;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email: string, password: string, name?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'id'> = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      name: name || '',
      role: 'customer', // Default role is customer
      createdAt: Timestamp.now()
    };
    
    await addDoc(collection(db, 'users'), userProfile);
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, 'Users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = { id: doc.id, ...doc.data() } as UserProfile;
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(uid);
    return userProfile?.role === 'admin' || userProfile?.userType === 'admin' || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const updateUserRole = async (uid: string, role: 'customer' | 'admin'): Promise<boolean> => {
  try {
    const q = query(collection(db, 'Users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'Users', querySnapshot.docs[0].id);
      await updateDoc(docRef, { role, userType: role });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Product functions
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Products'));
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'Products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'Products'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'Products'), {
      ...productData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'Products', productId);
    await updateDoc(docRef, productData);
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'Products', productId));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Order functions
export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Create order from Stripe checkout session
export const createOrderFromStripeSession = async (
  sessionId: string,
  userId: string,
  items: CartItem[],
  total: number,
  customerEmail: string,
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }
): Promise<string | null> => {
  try {
    console.log('🚀 Creating order from Stripe session via Firebase Functions:', {
      sessionId,
      userId,
      itemCount: items.length,
      total,
      customerEmail
    });
    
    const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-bytefit-v2.cloudfunctions.net';
    const requestUrl = `${API_BASE_URL}/createOrderFromPaymentId`;
    
    console.log('📡 Making request to:', requestUrl);
    console.log('📦 Request payload:', {
      sessionId,
      userId,
      customerEmail
    });
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userId,
        customerEmail
      }),
    });
    
    console.log('📨 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      console.error('❌ API Error Response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create order`);
    }
    
    const result = await response.json();
    console.log('✅ Order created successfully with ID:', result.orderId);
    return result.orderId;
  } catch (error) {
    console.error('❌ Error creating order from Stripe session:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - check if Firebase Functions emulator is running');
    }
    return null;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-bytefit-v2.cloudfunctions.net';
    
    const response = await fetch(`${API_BASE_URL}/getUserOrdersV2?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user orders');
    }
    
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-bytefit-v2.cloudfunctions.net';
    
    const response = await fetch(`${API_BASE_URL}/getAllOrdersV2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get all orders');
    }
    
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Customer functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() } as Customer);
    });
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Storage functions
export const uploadProductImage = async (file: File, productId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `products/${productId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Upload multiple product images
export const uploadProductImages = async (files: File[], productId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const storageRef = ref(storage, `products/${productId}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs.filter(url => url !== null);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return [];
  }
};

// Delete product image from storage
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Analytics functions
export const getAnalyticsData = async () => {
  try {
    const [products, orders, customers] = await Promise.all([
      getAllProducts(),
      getAllOrders(),
      getAllCustomers()
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      recentOrders: orders.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return null;
  }
};

// Category functions
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    return categories;
  } catch (error) {
    console.error('Error getting active categories:', error);
    return [];
  }
};

export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, 'categories', categoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
};

export const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    return null;
  }
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'categories', categoryId);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const q = query(collection(db, 'categories'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Category;
    }
    return null;
  } catch (error) {
    console.error('Error getting category by slug:', error);
    return null;
  }
};