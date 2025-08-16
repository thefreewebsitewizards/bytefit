import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StripeCheckout from '../components/StripeCheckout';
import ShippingSelector from '../components/ShippingSelector';
import { STRIPE_CONFIG } from '../config/stripe';
import { ShippingRate } from '../services/clientShipping';

const Cart: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  
  // Calculate total including shipping
  const shippingCost = selectedShippingRate ? selectedShippingRate.amount / 100 : 0;
  const finalTotal = total + shippingCost;

  const handleStripeSuccess = async () => {
    // Order creation is now handled in OrderConfirmation component
    // after successful Stripe payment verification
    toast.success('🎉 Payment successful! Redirecting to confirmation...');
  };

  const handleStripeCancel = () => {
    toast.info('Payment cancelled. Your items are still in your cart.');
  };

  if (items.length === 0) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden pt-20"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Clean Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div 
              className="bg-white border-2 border-slate-200 p-16 relative overflow-hidden text-center"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
            
            <div 
              className="w-32 h-32 mx-auto mb-8 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
            </div>
            
            <h2 className="font-patrick-hand-sc text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-black to-slate-800 bg-clip-text text-transparent">
              Your Cart is Empty
            </h2>
            <Link
              to="/gallery"
              className="group font-patrick-hand-sc inline-flex items-center justify-center gap-3 px-10 py-4 text-white font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="relative z-10">Explore Shop</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="w-full">
        {/* Enhanced Breadcrumb */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Link to="/" className="font-patrick-hand text-slate-600 hover:text-black transition-colors duration-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <span className="text-slate-400">/</span>
              <Link to="/gallery" className="font-patrick-hand text-slate-600 hover:text-black transition-colors duration-300">
                Gallery
              </Link>
              <span className="text-slate-400">/</span>
              <span className="font-patrick-hand text-slate-900 font-semibold">Your Cart</span>
            </div>
          </div>
        </nav>
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="font-patrick-hand-sc text-4xl lg:text-5xl font-bold mb-2 text-gray-900">
                  Your Cart
                </h1>
                <p className="font-patrick-hand text-xl text-slate-600">
                  {items.length} {items.length === 1 ? 'artwork' : 'artworks'} ready for checkout
                </p>
                
                {/* Rating stars for cart experience */}
                <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-patrick-hand text-slate-500 text-sm">(Secure Shopping Experience)</span>
                </div>
              </div>
              
              <button
                onClick={clearCart}
                className="font-patrick-hand-sc px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 font-bold rounded-md"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items Header */}
              <div className="mb-6">
                <h2 className="font-patrick-hand-sc text-3xl font-bold mb-2 text-gray-900">
                  Selected Artworks ({items.length})
                </h2>
                <p className="font-patrick-hand text-lg text-slate-600">
                  Handpicked watercolor masterpieces ready for your collection
                </p>
              </div>
            
              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="w-full sm:w-24 h-32 sm:h-24 overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    
                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-patrick-hand-sc text-xl font-bold mb-1 text-gray-900">
                            {item.name}
                          </h3>
                          <p className="font-patrick-hand text-slate-600 mb-3 text-sm">
                            Original Watercolor on Premium Paper
                          </p>
                          
                          {/* Value proposition */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-gray-100 px-2 py-1 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Original
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-gray-100 px-2 py-1 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Handcrafted
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-slate-500">USD</span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-patrick-hand text-green-700 text-xs font-medium">In Stock</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              
                {/* Order Header */}
                <div>
                  <h2 className="font-patrick-hand-sc text-2xl font-bold mb-2 text-gray-900">
                    Order Summary
                  </h2>
                  <p className="font-patrick-hand text-slate-600">
                    Ready to complete your purchase?
                  </p>
                </div>

                {/* Shipping Selector */}
                <div className="border-t border-gray-200 pt-6">
                  <ShippingSelector
                    orderTotal={total}
                    connectedAccountId={STRIPE_CONFIG.connectedAccountId}
                    onShippingSelect={setSelectedShippingRate}
                    selectedShippingRate={selectedShippingRate}
                  />
                </div>

                 {/* Price Breakdown */}
                 <div className="border-t border-gray-200 pt-6">
                   <div className="space-y-3 mb-6">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                       <span className="font-patrick-hand font-medium text-slate-700">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                       <span className="font-patrick-hand-sc font-bold text-slate-900">${total.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                       <div className="flex flex-col">
                         <span className="font-patrick-hand font-medium text-slate-700">Shipping & Handling</span>
                         {selectedShippingRate && (
                           <span className="font-patrick-hand text-sm text-slate-600">
                             {selectedShippingRate.display_name}
                           </span>
                         )}
                       </div>
                       <div className="flex items-center space-x-2">
                         {selectedShippingRate ? (
                           <span className={`font-patrick-hand-sc font-bold ${
                             selectedShippingRate.amount === 0 ? 'text-green-600' : 'text-slate-900'
                           }`}>
                             {selectedShippingRate.amount === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                           </span>
                         ) : (
                           <span className="font-patrick-hand-sc font-bold text-slate-900">Select shipping option</span>
                         )}
                       </div>
                     </div>
                     <div className="border-t border-gray-200 pt-3">
                       <div className="flex justify-between items-center">
                         <span className="font-patrick-hand-sc text-xl font-bold text-slate-900">Total</span>
                         <span className="font-patrick-hand-sc text-2xl font-bold text-gray-900">
                           ${finalTotal.toFixed(2)}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="border-t border-gray-200 pt-6">
                   <div className="space-y-4">
                     {!currentUser ? (
                       <div className="space-y-4">
                         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                           <div className="flex items-center gap-3 mb-3">
                             <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                             </svg>
                             <h3 className="font-patrick-hand-sc text-lg font-bold text-blue-900">
                               Sign In Required
                             </h3>
                           </div>
                           <p className="font-patrick-hand text-blue-700 mb-4 text-sm">
                             Please sign in to your account to complete your purchase and track your orders.
                           </p>
                           <Link
                             to="/login"
                             state={{ from: '/cart', message: 'Please sign in to complete your purchase' }}
                             className="w-full font-patrick-hand-sc inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold transition-all duration-300 hover:bg-slate-800 rounded-md"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h18" />
                             </svg>
                             Sign In to Checkout
                           </Link>
                         </div>
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {!selectedShippingRate && (
                           <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                             <div className="flex items-center gap-2">
                               <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                               </svg>
                               <span className="font-patrick-hand text-yellow-700 font-medium text-sm">
                                 Please select a shipping option to continue
                               </span>
                             </div>
                           </div>
                         )}
                         <StripeCheckout 
                           onSuccess={handleStripeSuccess}
                           onCancel={handleStripeCancel}
                           disabled={!selectedShippingRate}
                           selectedShippingRate={selectedShippingRate}
                         />
                       </div>
                     )}
                     <Link
                       to="/gallery"
                       className="w-full font-patrick-hand-sc inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 text-center font-bold rounded-md"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       Continue Shopping
                     </Link>
                   </div>
                 </div>

                 {/* Enhanced Security Section */}
                 <div className="border-t border-gray-200 pt-6">
                   <div className="p-4 bg-slate-900 rounded-lg">
                     <div className="flex items-start space-x-4">
                       <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white/20 rounded">
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                         </svg>
                       </div>
                       <div>
                         <h4 className="font-patrick-hand-sc text-lg font-bold text-white mb-2">
                           Secure Checkout
                         </h4>
                         <p className="font-patrick-hand text-white/90 text-sm leading-relaxed mb-3">
                           Your payment information is encrypted and secure. All transactions are protected.
                         </p>
                         
                         <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                             <span className="font-patrick-hand text-white/90 text-xs">SSL Encrypted</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                             <span className="font-patrick-hand text-white/90 text-xs">PCI Compliant</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>

  );
};

export default Cart;