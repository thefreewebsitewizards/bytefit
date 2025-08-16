import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, Product, testFirebaseConnection } from '../services/firebase';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  // Available images for the carousel
  const carouselImages = [
    {
      src: "/hero1.jpeg",
      alt: "Fashion Style 1"
    },
    {
      src: "/hero2.jpeg",
      alt: "Fashion Style 2"
    },
    {
      src: "/hero3.jpeg",
      alt: "Fashion Style 3"
    },
    {
      src: "/hero4.jpeg",
      alt: "Fashion Style 4"
    },
    {
      src: "/hero5.jpeg",
      alt: "Fashion Style 5"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      // Test Firebase connection first
      const connectionTest = await testFirebaseConnection();
      
      try {
        const products = await getAllProducts();
        // Get first 6 products as featured
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.id) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden" 
        style={{
          background: 'white',
          paddingTop: '5rem'
        }}
      >

        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side - Enhanced Text Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <h1 
                  className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-jet-black animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  BYTEFIT
                  <span className="block text-gray-500 text-xl sm:text-2xl lg:text-4xl">
                      STYLE IN MOTION
                  </span>
                </h1>
              
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-charcoal-800 to-jet-black text-bone-50 font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl group border-2 border-charcoal-600 hover:from-jet-black hover:to-charcoal-900"
                >
                  <span>DOMINATE STYLE</span>
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-ash-gray-300 text-jet-black font-semibold transition-all duration-300 hover:bg-ash-gray-100"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Side - Simple Picture Carousel */}
            <div className="w-full h-full animate-fade-in-right" style={{ animationDelay: '0.8s' }}>
              <div className="relative w-full h-full">
                {/* Simple artwork display */}
                <div className="relative w-full h-full min-h-[250px]">
                  <img 
                    src={carouselImages[currentImageIndex].src}
                    alt={carouselImages[currentImageIndex].alt}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
       <style>{`
         @keyframes fade-in-up {
           from {
             opacity: 0;
             transform: translateY(30px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         
         @keyframes fade-in-right {
           from {
             opacity: 0;
             transform: translateX(50px);
           }
           to {
             opacity: 1;
             transform: translateX(0);
           }
         }
         
         .animate-fade-in-up {
           animation: fade-in-up 0.8s ease-out forwards;
           opacity: 0;
         }
         
         .animate-fade-in-right {
           animation: fade-in-right 0.8s ease-out forwards;
           opacity: 0;
         }
       `}</style>

      {/* Featured Products */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FEFEFE 0%, #F5F5F5 100%)' }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-charcoal-200/30 to-ash-gray-200/30 blur-xl"></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-sand-200/30 to-charcoal-200/30 blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-sand-200/30 to-ash-gray-200/30 blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 
              className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-neutral-900 leading-tight tracking-tight"
            >
              MEN'S COLLECTION
            </h2>
            <p 
              className="font-helvetica text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-neutral-600 font-medium"
            >
              Discover bold, sophisticated clothing designed for the modern man. Each piece embodies strength, elegance, and timeless masculine appeal.
            </p>
            <div className="w-24 h-1 bg-neutral-900 mx-auto mt-8"></div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse h-96 relative overflow-hidden"
                  style={{
                    boxShadow: '0 20px 40px rgba(10, 10, 10, 0.1)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-50/20 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group bg-bone-50 overflow-hidden transition-all duration-500 hover:scale-105 relative"
                  style={{ 
                     boxShadow: '0 10px 30px rgba(10, 10, 10, 0.08)',
                     border: '1px solid rgba(58, 58, 58, 0.1)'
                   }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(10, 10, 10, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(10, 10, 10, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-500/5 to-ash-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                    {/* Image overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Quick view badge */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <span className="bg-bone-50/90 backdrop-blur-sm text-ash-gray-700 px-3 py-1 text-xs font-medium shadow-lg">
                        Quick View
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 relative">
                    <div className="mb-4">
                      <h3 
                        className="font-playfair text-xl font-bold mb-3 text-jet-black group-hover:text-charcoal-700 transition-colors duration-300"
                      >
                        {product.name}
                      </h3>
                      <p 
                        className="font-helvetica text-sm leading-relaxed line-clamp-2 text-ash-gray-600"
                      >
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-playfair text-3xl font-bold text-neutral-900"
                        >
                          ${product.price}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">USD</span>
                      </div>
                      
                      {/* Rating stars placeholder */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 font-helvetica px-6 py-3 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-all duration-300 text-center font-bold uppercase tracking-wide border border-neutral-300"
                      >
                        VIEW PRODUCT
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 font-helvetica px-6 py-3 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 transition-all duration-300 font-bold uppercase tracking-wide shadow-lg transform hover:scale-105 hover:shadow-xl"
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <div className="inline-flex flex-col items-center gap-4">
              <p className="font-helvetica text-neutral-600 text-lg">
                Explore our complete collection of unique clothing items
              </p>
              <Link
                to="/gallery"
                className="group inline-flex items-center gap-3 px-12 py-5 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 font-black uppercase tracking-widest transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden border-2 border-neutral-700 font-playfair"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/0 via-neutral-50/20 to-neutral-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className="relative z-10">EXPLORE SHOPS</span>
                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              {/* Stats */}
              <div className="flex items-center gap-8 mt-6 text-sm text-neutral-600 font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-700 rotate-45"></div>
                  <span>PREMIUM QUALITY</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-900 rotate-45"></div>
                  <span>MASCULINE DESIGN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-800 rotate-45"></div>
                  <span>FAST DELIVERY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-0" style={{ background: '#FEFEFE' }}>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 
                className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-neutral-900 leading-tight"
              >
                ABOUT BYTEFIT
              </h2>
              <p 
                className="font-helvetica text-xl lg:text-2xl mb-6 leading-relaxed text-neutral-600"
              >
                Welcome to BYTEFIT, where urban fashion meets digital innovation! We're passionate about creating unique streetwear that speaks to the modern generation. Each piece is carefully designed with attention to quality, comfort, and style.
              </p>
              <p 
                className="font-helvetica text-xl lg:text-2xl mb-6 leading-relaxed text-neutral-600"
              >
                Based on the pulse of street culture, we draw inspiration from urban landscapes, digital aesthetics, and contemporary youth movements. Every design reflects our commitment to sustainable fashion and authentic self-expression.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50"
                  >
                    <i className="fas fa-tshirt text-xl"></i>
                  </div>
                  <h3 
                    className="font-helvetica text-lg font-semibold mb-2 text-neutral-900"
                  >
                    Original Designs
                  </h3>
                  <p className="font-helvetica text-neutral-600">
                    Every piece features unique streetwear graphics
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50"
                  >
                    <i className="fas fa-city text-xl"></i>
                  </div>
                  <h3 
                    className="font-playfair text-lg font-semibold mb-2 text-neutral-900"
                  >
                    Urban Inspired
                  </h3>
                  <p className="font-helvetica text-neutral-600">
                    Drawing from street culture and digital aesthetics
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50"
                  >
                    <i className="fas fa-recycle text-xl"></i>
                  </div>
                  <h3 
                    className="font-playfair text-lg font-semibold mb-2 text-neutral-900"
                  >
                    Sustainable Fashion
                  </h3>
                  <p className="font-helvetica text-neutral-600">
                    Crafted with eco-friendly materials and processes
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/aboutpage.jpeg" 

                alt="BYTEFIT - Urban Fashion" 
                className="w-full h-auto object-cover"
                style={{ 
                  boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/1.jpeg';
                }}
              />
            </div>
          </div>
        </div>
      </section>


      
      <style>
        {`
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
  );
};

export default Home;