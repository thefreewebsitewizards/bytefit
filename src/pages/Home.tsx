import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, Product, testFirebaseConnection } from '../services/firebase';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();

  // Scroll reveal effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));

    return () => {
      scrollElements.forEach(el => observer.unobserve(el));
    };
  }, [featuredProducts]);

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
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 
                className="font-playfair text-5xl sm:text-7xl font-bold leading-tight text-jet-black animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                BYTEFIT
                <span className="block text-gray-500 text-2xl sm:text-4xl">
                    STYLE IN MOTION
                </span>
              </h1>
            </div>
            
            {/* Image */}
            <div className="w-full mb-8 animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-full">
                <div className="relative w-full h-[400px] sm:h-[500px]">
                  <img 
                    src={carouselImages[currentImageIndex].src}
                    alt={carouselImages[currentImageIndex].alt}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                  />
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
          
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
            {/* Left Side - Enhanced Text Content */}
            <div className="space-y-8 text-left">
              <div className="space-y-6">
                <h1 
                  className="font-playfair text-9xl font-bold leading-tight text-jet-black animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  BYTEFIT
                  <span className="block text-gray-500 text-6xl">
                      STYLE IN MOTION
                  </span>
                </h1>
              
              </div>
              
              <div className="flex flex-row gap-4 justify-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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

      {/* Enhanced CSS for animations and effects */}
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
         
         @keyframes shimmer {
           0% {
             transform: translateX(-100%);
           }
           100% {
             transform: translateX(100%);
           }
         }
         
         @keyframes float {
           0%, 100% {
             transform: translateY(0px);
           }
           50% {
             transform: translateY(-10px);
           }
         }
         
         @keyframes pulse-glow {
           0%, 100% {
             box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
           }
           50% {
             box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
           }
         }
         
         @keyframes gradient-shift {
           0% {
             background-position: 0% 50%;
           }
           50% {
             background-position: 100% 50%;
           }
           100% {
             background-position: 0% 50%;
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
         
         .animate-shimmer {
           animation: shimmer 2s infinite;
         }
         
         .animate-float {
           animation: float 3s ease-in-out infinite;
         }
         
         .animate-pulse-glow {
           animation: pulse-glow 2s ease-in-out infinite;
         }
         
         .animate-gradient {
           background-size: 200% 200%;
           animation: gradient-shift 4s ease infinite;
         }
         
         .scroll-reveal {
           opacity: 0;
           transform: translateY(50px);
           transition: all 0.8s ease-out;
         }
         
         .scroll-reveal.revealed {
           opacity: 1;
           transform: translateY(0);
         }
         
         .hover-lift {
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .hover-lift:hover {
           transform: translateY(-8px) scale(1.02);
           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
         }
       `}</style>

      {/* Featured Products */}
      <section className="py-24 relative overflow-hidden animate-gradient" style={{ background: 'linear-gradient(135deg, #FEFEFE 0%, #F5F5F5 50%, #FAFAFA 100%)' }}>
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-charcoal-200/30 to-ash-gray-200/30 blur-xl animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-sand-200/30 to-charcoal-200/30 blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-sand-200/30 to-ash-gray-200/30 blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-gradient-to-br from-neutral-200/20 to-gray-300/20 blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-gradient-to-br from-slate-200/20 to-neutral-300/20 blur-xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 scroll-reveal">
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
            <div className="w-24 h-1 bg-neutral-900 mx-auto mt-8 animate-pulse-glow"></div>
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
              {featuredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-bone-50 overflow-hidden hover-lift relative scroll-reveal"
                  style={{ 
                     boxShadow: '0 10px 30px rgba(10, 10, 10, 0.08)',
                     border: '1px solid rgba(58, 58, 58, 0.1)',
                     animationDelay: `${index * 0.1}s`
                   }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-500/5 to-ash-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image}
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

      {/* Price Range Section */}
      <section className="bg-white text-black py-8 sm:py-12 lg:py-16 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-gray-100/50 to-gray-200/50 blur-lg animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-neutral-100/40 to-gray-200/40 blur-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left side - Model Image */}
             <div className="relative scroll-reveal hover-lift">
               <img 
                 src="/hero2.jpeg" 
                 alt="ByteFit Streetwear Model" 
                 className="w-full h-auto object-cover transition-all duration-500"
                 style={{ 
                   boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                 }}
               />
               {/* Image overlay effect */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Right side - Price Range */}
            <div className="space-y-8 scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="text-center sm:text-right">
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-4 leading-none">
                  PRICE
                </h2>
                <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-8 leading-none">
                  RANGE
                </h3>
              </div>
              
              <div className="text-center sm:text-right space-y-6 sm:space-y-8">
                {/* Tops */}
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-black mb-2">Tops</h4>
                  <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                    <li>• Premium Tees: 100-200med</li>
                    <li>• Long Sleeves: 200-300med</li>
                    <li>• Sweatshirts / Oversized: 300-500med</li>
                    <li>• Hoodies (Heavyweight): 500-700med</li>
                    <li>• Jackets (Structured): 800-1000med</li>
                  </ul>
                </div>
                
                {/* Bottoms */}
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-black mb-2">Bottoms</h4>
                  <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                    <li>• Casual Sweatpants: 200-350med</li>
                    <li>• Tailored Sweatpants / Joggers: 400-600med</li>
                    <li>• Jeans (Premium Denim): 500-800med</li>
                    <li>• Cargo (Structured): 600-900med</li>
                    <li>• Shorts (Summer): 150-300med</li>
                  </ul>
                </div>
                
                {/* Outerwear */}
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-black mb-2">Outerwear</h4>
                  <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                    <li>• Light Jackets / Coach Jackets: 500-800med</li>
                    <li>• Technical Windbreakers / Bombers: 800-1200med</li>
                    <li>• Heavy Coats / Structured Outerwear: 1200-2000med</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center sm:text-right mt-6 sm:mt-8">
                <p className="text-sm text-gray-600">www.byte-fit.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-0 relative overflow-hidden" style={{ background: '#FEFEFE' }}>
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-neutral-200/30 to-gray-300/30 blur-lg animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-gray-200/20 to-neutral-300/20 blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-slate-200/25 to-gray-200/25 blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <div className="px-4 sm:px-6 lg:px-8 scroll-reveal">
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
                <div className="text-center scroll-reveal hover-lift" style={{ animationDelay: '0.1s' }}>
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50 animate-pulse-glow"
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
                
                <div className="text-center scroll-reveal hover-lift" style={{ animationDelay: '0.2s' }}>
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50 animate-pulse-glow"
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
                
                <div className="text-center scroll-reveal hover-lift" style={{ animationDelay: '0.3s' }}>
                  <div 
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-neutral-900 text-neutral-50 animate-pulse-glow"
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
            
            <div className="relative scroll-reveal hover-lift" style={{ animationDelay: '0.4s' }}>
              <img 
                src="/aboutpage.jpeg" 

                alt="BYTEFIT - Urban Fashion" 
                className="w-full h-auto object-cover transition-all duration-500"
                style={{ 
                  boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/1.jpeg';
                }}
              />
              {/* Image overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
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