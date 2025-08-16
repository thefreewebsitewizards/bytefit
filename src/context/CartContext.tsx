import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { CartItem } from '../services/firebase';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // For artworks, don't add duplicates - just show a message
        return state;
      } else {
        const newItems = [...state.items, action.payload];
        const total = newItems.reduce((sum, item) => sum + item.price, 0);
        const itemCount = newItems.length;
        
        return { items: newItems, total, itemCount };
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + item.price, 0);
      const itemCount = newItems.length;
      
      return { items: newItems, total, itemCount };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };
    
    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + item.price, 0);
      const itemCount = action.payload.length;
      return { items: action.payload, total, itemCount };
    }
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => {
    const existingItem = state.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      toast.info(`🎨 ${item.name} is already in your cart!`);
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`🛒 ${item.name} added to cart!`);
  };

  const removeItem = (id: string) => {
    const item = state.items.find(cartItem => cartItem.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      toast.info(`🗑️ ${item.name} removed from cart`);
    }
  };



  const clearCart = () => {
    console.log('🧹 Clearing cart - items before clear:', state.items.length);
    dispatch({ type: 'CLEAR_CART' });
    console.log('🧹 Cart cleared successfully');
    toast.success('🧹 Cart cleared!');
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};