import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      <div className="bg-black text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gray-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-400 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div>
                <span className="font-playfair text-2xl font-bold text-white">
                  BYTEFIT
                </span>
                <p className="text-sm text-neutral-300 font-helvetica">Urban Fashion</p>
              </div>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md leading-relaxed font-helvetica">
              Discover unique streetwear that brings style and confidence to your wardrobe. Each piece is carefully designed with attention to quality, comfort, and urban aesthetics.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-lg mb-6 text-white relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gray-400 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-neutral-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                  style={{fontFamily: 'Helvetica, sans-serif'}}
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-neutral-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                  style={{fontFamily: 'Helvetica, sans-serif'}}
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-neutral-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                  style={{fontFamily: 'Helvetica, sans-serif'}}
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-neutral-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                  style={{fontFamily: 'Helvetica, sans-serif'}}
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-lg mb-6 text-white relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gray-400 rounded-full"></div>
            </h3>
            <ul className="space-y-4 text-neutral-300">
              <li className="flex items-center space-x-3 group hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="text-sm font-helvetica">contact@bytefit.com</span>
              </li>
              <li className="flex items-center space-x-3 group hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-helvetica">Global Shipping</span>
                </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700/50 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-neutral-400 text-sm font-helvetica">
              &copy; {new Date().getFullYear()} BYTEFIT. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-neutral-400 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors font-helvetica">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-white transition-colors font-helvetica">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;