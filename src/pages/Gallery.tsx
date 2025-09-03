import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, Product, getActiveCategories, Category } from '../services/firebase';
import { useCart } from '../context/CartContext';

const Gallery: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🎨 Gallery: Starting to fetch data...');
        const [allProducts, activeCategories] = await Promise.all([
          getAllProducts(),
          getActiveCategories()
        ]);
        console.log('📦 Gallery: Products fetched:', allProducts.length);
        console.log('🏷️ Gallery: Active categories fetched:', activeCategories.length, activeCategories);
        setProducts(allProducts);
        setFilteredProducts(allProducts);
        setCategories(activeCategories);
      } catch (error) {
        console.error('❌ Gallery: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        // Handle both old string categories and new slug-based categories
        const productCategory = product.category.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        
        // Direct match with category slug or name
        return productCategory === selectedCat || 
               productCategory === selectedCat.replace(/-/g, ' ') ||
               productCategory.replace(/\s+/g, '-') === selectedCat;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, categories]);

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
    <>
      {/* CSS Animations */}
      <style>{`
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
        
        @keyframes bubble {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-100px) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bubble {
          animation: bubble 8s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section 
        className="relative py-16 lg:py-20 overflow-hidden min-h-[50vh] mt-20" 
        style={{
          paddingTop: '8rem'
        }}
      >
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
              BYTEFIT SHOP
            </h1>
            <p className="text-base lg:text-lg text-gray-700 max-w-2xl mx-auto px-4 mb-8" style={{fontFamily: 'Helvetica, sans-serif'}}>
              Discover our premium men's clothing collection. Each piece is crafted with 
              precision and designed for the modern gentleman.
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col items-center gap-6 mt-8">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full max-w-4xl mx-auto">
                <div className="category-container category-scroll flex flex-wrap gap-2 sm:gap-3 justify-center items-center bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100">
                  {/* All Categories Button */}
                   <button
                     onClick={() => setSelectedCategory('all')}
                     className={`category-button px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                       selectedCategory === 'all'
                         ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg hover:shadow-xl'
                         : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md'
                     }`}
                   >
                     All
                   </button>
                   
                   {/* Dynamic Category Buttons */}
                   {categories.map((category) => (
                     <button
                       key={category.id}
                       onClick={() => setSelectedCategory(category.slug)}
                       className={`category-button px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                         selectedCategory === category.slug
                           ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg hover:shadow-xl'
                           : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md'
                       }`}
                     >
                       {category.name}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-200 aspect-square mb-4"></div>
                  <div className="h-4 bg-neutral-200 mb-2"></div>
                  <div className="h-4 bg-neutral-200 w-2/3 mb-2"></div>
                  <div className="h-6 bg-neutral-200 w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-neutral-200 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-playfair text-xl font-bold text-neutral-900 mb-2">
                No products found
              </h3>
              <p className="text-neutral-600 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-600">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => (
                  <Link 
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 sm:duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform sm:hover:-translate-y-2 sm:hover:scale-[1.02] block"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                    }}
                  >
                    {/* Premium badge - only show on desktop */}
                    <div className="absolute top-4 left-4 z-10 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hidden sm:block">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        PREMIUM
                      </span>
                    </div>

                    {/* Heart icon - top right corner */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add to wishlist functionality here
                        console.log('Added to wishlist:', product.name);
                      }}
                      className="absolute top-4 right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group/heart"
                      title="Add to Wishlist"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover/heart:text-red-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                        alt={product.name}
                        className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-500 sm:duration-700 ease-out"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                      {/* Subtle gradient overlay - desktop only */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"></div>
                    </div>
                    
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="font-playfair text-sm sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300 mobile-card-title">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mobile-card-description">
                          {product.description}
                        </p>
                      </div>
                      

                      
                      {/* Price */}
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mobile-card-price">
                          AED {product.price}
                        </span>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          AED
                        </span>
                      </div>
                      
                      {/* Action button */}
                      <div className="pt-1 sm:pt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2"
                          title="Add to Cart"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                          </svg>
                          <span className="hidden sm:inline">Add to Cart</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Gallery;