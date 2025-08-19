import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, Product } from '../services/firebase';
import { useCart } from '../context/CartContext';
import ImageCarousel from '../components/ImageCarousel';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);


  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await getProductById(id);
          setProduct(productData);
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.id) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
    }
  };

  // Get product images - use images array if available, fallback to single image
  const productImages = product ? (product.images && product.images.length > 0 ? product.images : [product.image]) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div 
              className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse relative overflow-hidden border border-gray-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-200 animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-200 animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-200 w-2/3 animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-200 w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div 
            className="bg-white p-12 relative overflow-hidden border border-gray-200 shadow-xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            <h1 className="font-playfair text-4xl font-bold mb-6 text-black">
              Product Not Found
            </h1>
            <p className="font-playfair text-xl text-gray-600 mb-8 leading-relaxed">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/gallery" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white font-playfair font-bold border border-black transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
            >
              <span>BACK TO COLLECTION</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 relative z-10">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-3 mb-12">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 border border-gray-200 shadow-lg">
            <Link to="/" className="font-playfair text-gray-600 hover:text-black transition-colors duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/gallery" className="font-playfair text-gray-600 hover:text-black transition-colors duration-300">
              ByteFit Collection
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-playfair text-black font-semibold">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Enhanced Product Image Gallery */}
          <div className="space-y-6">
            <ImageCarousel 
              images={productImages} 
              productName={product.name}
              className="aspect-square"
            />
            
            {/* Enhanced Shipping Info - Moved to Left */}
            <div 
              className="p-8 relative overflow-hidden bg-white border border-black shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-black"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-playfair text-xl font-bold text-black mb-3">
                    Shipping & Delivery
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="p-4 bg-gray-50 border border-gray-200">
                      <h5 className="font-playfair font-semibold text-black mb-2">Standard Shipping</h5>
                      <p className="font-playfair text-sm">Small items: $6</p>
                      <p className="font-playfair text-sm">Medium framed: $20</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200">
                      <h5 className="font-playfair font-semibold text-black mb-2">Express Delivery</h5>
                      <p className="font-playfair text-sm">FREE shipping on orders over $50</p>
                      <p className="font-playfair text-sm">Local delivery available</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-black animate-pulse"></div>
                      <span className="font-playfair text-gray-700 text-sm">Insured Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-black animate-pulse"></div>
                      <span className="font-playfair text-gray-700 text-sm">Real-time Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Product Info - Combined Section */}
          <div className="space-y-8">
            {/* Unified Product Info Section */}
            <div 
              className="bg-white shadow-xl p-8 relative overflow-hidden space-y-8 border border-gray-200"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
              
              {/* Product Header */}
              <div>
                <div className="mb-6">
                  <span 
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-black border border-gray-300"
                  >
                    ✨ {product.category}
                  </span>
                </div>
                
                <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6 text-black leading-tight">
                  {product.name}
                </h1>
                
                <p className="font-patrick-hand text-xl text-slate-600 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Rating stars */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-slate-500" style={{fontFamily: 'Helvetica, sans-serif'}}>(Original Artwork)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-black" style={{fontFamily: 'Playfair Display, serif'}}>
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">USD</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 border border-green-200">
                    <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                    <span className="text-green-700 text-sm font-medium" style={{fontFamily: 'Helvetica, sans-serif'}}>In Stock</span>
                  </div>
                </div>
                
                {/* Value proposition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-playfair text-sm">Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-playfair text-sm">Handcrafted</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-playfair text-sm">Free Shipping $50+</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-helvetica text-sm">30-Day Returns</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 group font-playfair inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-xl relative overflow-hidden border border-black"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5" />
                    </svg>
                    <span className="relative z-10">Add to Cart - ${product.price.toFixed(2)}</span>
                  </button>
                  
                  <Link 
                    to="/cart"
                    className="flex-1 font-playfair inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all duration-300 text-center font-bold hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Cart
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Product Details */}
            <div 
              className="bg-white shadow-xl p-8 relative overflow-hidden border border-gray-200"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
              
              <h3 className="font-playfair text-2xl font-bold mb-6 text-black">
                Product Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
                  <span className="font-playfair font-medium text-gray-700">Category:</span>
                  <span className="font-playfair font-bold text-black">{product.category}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 border border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
                  <span className="font-playfair font-medium text-gray-700">Medium:</span>
                  <span className="font-playfair font-bold text-black">Premium Cotton Blend</span>
                </div>
                
                <div className="flex justify-between items-center p-4 border border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
                  <span className="font-playfair font-medium text-gray-700">Shipping:</span>
                  <span className="font-playfair font-bold text-black">From $6 (Free over $50)</span>
                </div>
                
                <div className="flex justify-between items-center p-4 border border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
                  <span className="font-playfair font-medium text-gray-700">Processing Time:</span>
                  <span className="font-playfair font-bold text-black">1-2 Business Days</span>
                </div>
              </div>
            </div>


          </div>
        </div>
        
        {/* CSS Animations */}
        <style>
          {`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px) translateX(0px);
              }
              25% {
                transform: translateY(-20px) translateX(10px);
              }
              50% {
                transform: translateY(-10px) translateX(-15px);
              }
              75% {
                transform: translateY(-30px) translateX(5px);
              }
            }
            
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            
            .animate-shimmer {
              animation: shimmer 2s ease-in-out infinite;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ProductDetail;