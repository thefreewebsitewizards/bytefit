import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 sm:py-12 lg:py-16">
            {/* Left side - Image */}
            <div className="relative pt-8 sm:pt-0">
              <img 
                src="/aboutpage.jpeg" 
                alt="ByteFit Streetwear" 
                className="w-full h-auto object-cover"
                style={{ 
                  boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                }}
              />
            </div>
            
            {/* Right side - Brand Text */}
            <div className="space-y-8">
              <div className="text-right">
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-black tracking-tight leading-none">
                  ABOUT
                </h1>
                <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-black tracking-tight leading-none">
                  BYTEFIT
                </h2>
              </div>
              
              <div className="text-center lg:text-right space-y-6">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-lg mx-auto lg:ml-auto">
                  Our collections are made for the urban youth, the creatives, the 
                  trendsetters—those who live loud, move fast, and refuse to 
                  settle for boring. With a commitment to low-waste production 
                  and long-life quality, we champion sustainability without 
                  sacrificing edge. This isn't fast fashion. This is fashion for 
                  your life, your style, and your story.
                </p>
                
                <div className="text-center lg:text-right">
                  <p className="text-sm text-gray-600">www.byte-fit.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Range Section */}
      <div className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-4">PRODUCT RANGE</h2>
          </div>
          
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {/* Oversized Tee */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="/oversize1.jpeg" 
                  alt="Oversized Tee" 
                  className="w-full h-64 sm:h-80 lg:h-[400px] object-cover"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Oversized Tee</h3>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Heavyweight cotton, clean-cut, zero compromise</p>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Crafted from heavyweight 240-GSM cotton, this oversized tee delivers 
                    structured hand feel. Designed with a relaxed drop-shoulder fit, 
                    reinforced seams, and a timeless silhouette that works for any 
                    occasion. Easy, effortless, for a clean, 
                    elevated streetwear look.
                  </p>
                  <p className="text-gray-700">
                    The heavyweight construction and reinforced stitching throughout 
                    ensure this tee will maintain its shape and quality wash after wash. 
                    Built to last.
                  </p>
                </div>
              </div>
            </div>

            {/* Heavyweight Hoodie */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="order-1">
                <img 
                  src="/hoodie1.jpeg" 
                  alt="Heavyweight Hoodie" 
                  className="w-full h-64 sm:h-80 lg:h-[400px] object-cover"
                />
              </div>
              <div className="order-2 space-y-6">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Heavyweight Hoodie</h3>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Oversized, soft-built, and made to move</p>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Our from ultra-dense 350-gram cotton, this hoodie features a 
                    double-lined hood, compact ribbed cuffs, and a kangaroo pocket 
                    designed for daily wear. The oversized fit allows for layering 
                    while maintaining a clean silhouette. Your go-to layer, from street to 
                    studio.
                  </p>
                </div>
              </div>
            </div>

            {/* Modular Cargo Pants */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="/cargo1.jpeg" 
                  alt="Modular Cargo Pants" 
                  className="w-full h-64 sm:h-80 lg:h-[400px] object-cover"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Modular Cargo Pants</h3>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Utility in motion</p>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Made with durable ripstop fabric, these cargo feature 10 
                    functional pockets, adjustable leg openings, and reinforced stitching that fits 
                    utility perfect for the street.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left side - Mission Text */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-4 leading-none">
                  MISSION
                </h2>
                <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black text-black mb-8 leading-none">
                  & VISION
                </h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  To empower expression and self-identity through 
                  streetwear that merges art, culture, and 
                  functionality.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  To be a global symbol of street-level luxury, 
                  redefining streetwear as a form of lifestyle, 
                  statement, and resistance.
                </p>
              </div>
              
              {/* Color Palette */}
              <div className="flex justify-center lg:justify-start space-x-3 sm:space-x-4 mt-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-300"></div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-300"></div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-300"></div>
              </div>
            </div>
            
            {/* Right side - Model Image */}
            <div className="relative">
              <img 
                src="/aboutpage.jpeg" 
                alt="ByteFit Model" 
                className="w-full h-auto object-cover"
                style={{ 
                  boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price Range Section */}
      <div className="bg-white text-black py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left side - Model Image */}
             <div className="relative">
               <img 
                 src="/hero2.jpeg" 
                 alt="ByteFit Streetwear Model" 
                 className="w-full h-auto object-cover"
                 style={{ 
                   boxShadow: '0 10px 30px rgba(10, 10, 10, 0.1)'
                 }}
               />
            </div>
            
            {/* Right side - Price Range */}
            <div className="space-y-8">
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
      </div>
    </div>
  );
};

export default About;