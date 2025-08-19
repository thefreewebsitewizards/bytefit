import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsAccountDropdownOpen(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-100' : 'bg-white/90 backdrop-blur-sm shadow-lg'
        }`}
        style={{
          border: 'none',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Business Name - Left */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group transition-all duration-500 hover:scale-105"
            >
              <span 
                className="font-playfair text-3xl font-bold transition-all duration-500 group-hover:text-gray-700 relative"
                style={{ 
                  color: '#1a1a1a',
                  letterSpacing: '0.05em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                BYTEFIT
                <div 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-600 to-gray-800 transition-all duration-500 group-hover:w-full"
                ></div>
              </span>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { to: '/', label: 'Home' },
                { to: '/gallery', label: 'Shop' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative text-base font-medium transition-all duration-300 hover:text-gray-900 px-4 py-2 rounded-lg group"
                  style={{ 
                    color: '#4a5568',
                    fontFamily: 'Helvetica, sans-serif',
                    letterSpacing: '0.025em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-gray-600 to-gray-800 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2"></div>
                </Link>
              ))}
            </nav>

            {/* Right Section - Cart & Account */}
            <div className="flex items-center space-x-6">
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="group relative p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100"
                style={{ color: '#2c3e50' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.color = '#2c3e50';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-shopping-cart text-lg"></i>
                {itemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse"
                    style={{ 
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account Section - Hidden on Mobile */}
              {currentUser ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                    }}
                  >
                    <i className="fas fa-user text-white text-sm"></i>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isAccountDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      ></div>
                      <div 
                        className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300"
                        style={{ 
                          borderColor: 'rgba(26, 26, 26, 0.1)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)'
                        }}
                      >
                        {/* User Info Header */}
                        <div 
                          className="px-6 py-5 border-b relative overflow-hidden"
                          style={{ 
                            borderBottomColor: 'rgba(26, 26, 26, 0.1)',
                            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.03) 0%, rgba(45, 45, 45, 0.05) 100%)'
                          }}
                        >
                          <div className="flex items-center space-x-4 relative z-10">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-white/20 shadow-lg"
                              style={{ 
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                                boxShadow: '0 8px 32px rgba(26, 26, 26, 0.3)'
                              }}
                            >
                              <i className="fas fa-user text-white text-sm"></i>
                            </div>
                            <div>
                              <p 
                                className="text-sm font-semibold mb-1" 
                                style={{ 
                                  color: '#1a1a1a', 
                                  fontFamily: 'Playfair Display, serif',
                                  letterSpacing: '0.025em'
                                }}
                              >
                                Welcome back!
                              </p>
                              <p 
                                className="text-xs truncate opacity-75" 
                                style={{ 
                                  color: '#4a5568', 
                                  fontFamily: 'Helvetica, sans-serif',
                                  maxWidth: '180px'
                                }}
                              >
                                {currentUser.email}
                              </p>
                            </div>
                          </div>
                          {/* Decorative gradient overlay */}
                          <div 
                            className="absolute top-0 right-0 w-20 h-full opacity-10"
                            style={{
                              background: 'linear-gradient(135deg, transparent 0%, #1a1a1a 100%)'
                            }}
                          ></div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-3">
                          {(() => {
                            console.log('🔍 Header - isAdmin:', isAdmin, 'currentUser:', currentUser?.email);
                            return null;
                          })()}
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="group flex items-center px-6 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/80 relative overflow-hidden"
                              style={{ 
                                color: '#2c3e50', 
                                fontFamily: 'Helvetica, sans-serif',
                                fontWeight: '500'
                              }}
                              onClick={() => setIsAccountDropdownOpen(false)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#1a1a1a';
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#2c3e50';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.1) 0%, rgba(45, 45, 45, 0.15) 100%)'
                                }}
                              >
                                <i className="fas fa-cog text-gray-600 text-xs"></i>
                              </div>
                              <span className="relative z-10">Admin Dashboard</span>
                              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gray-400 to-gray-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                            </Link>
                          )}
                          <Link
                            to="/orders"
                            className="group flex items-center px-6 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 relative overflow-hidden"
                            style={{ 
                              color: '#2c3e50', 
                              fontFamily: 'Helvetica, sans-serif',
                              fontWeight: '500'
                            }}
                            onClick={() => setIsAccountDropdownOpen(false)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#1a1a1a';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2c3e50';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                              style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%)'
                              }}
                            >
                              <i className="fas fa-box text-blue-600 text-xs"></i>
                            </div>
                            <span className="relative z-10">My Orders</span>
                            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                          </Link>
                          
                          {/* Divider */}
                          <div className="mx-6 my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="group w-full flex items-center px-6 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 relative overflow-hidden"
                            style={{ 
                              color: '#2c3e50', 
                              fontFamily: 'Helvetica, sans-serif',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2c3e50';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                              style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%)'
                              }}
                            >
                              <i className="fas fa-sign-out-alt text-red-500 text-xs"></i>
                            </div>
                            <span className="relative z-10">Sign Out</span>
                            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-400 to-red-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-base font-medium rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100"
                    style={{ 
                      color: '#2c3e50',
                      fontFamily: 'Helvetica, sans-serif',
                      letterSpacing: '0.025em'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#2c3e50';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 text-base font-medium text-white rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                      fontFamily: 'Helvetica, sans-serif',
                      letterSpacing: '0.025em',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100"
                style={{ color: '#2c3e50' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2c3e50';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute top-0 left-0 w-full h-0.5 bg-current transition-all duration-300 rounded-full ${isMenuOpen ? 'rotate-45 top-2.5' : ''}`}></span>
                  <span className={`absolute top-2.5 left-0 w-full h-0.5 bg-current transition-all duration-300 rounded-full ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`absolute top-5 left-0 w-full h-0.5 bg-current transition-all duration-300 rounded-full ${isMenuOpen ? '-rotate-45 top-2.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div 
              className="py-6 space-y-4 border-t overflow-y-auto backdrop-blur-md" 
              style={{ 
                borderTopColor: 'rgba(26, 26, 26, 0.1)', 
                maxHeight: 'calc(100vh - 200px)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              {/* Navigation Links */}
              <div className="space-y-1 px-4">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/gallery', label: 'Shop' },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' }
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-center px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/80 relative overflow-hidden"
                    style={{ 
                      color: '#4a5568', 
                      fontFamily: 'Helvetica, sans-serif',
                      fontWeight: '500',
                      letterSpacing: '0.025em'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a5568';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mr-4 group-hover:scale-125 transition-transform duration-300"></div>
                    {item.label}
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gray-400 to-gray-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                  </Link>
                ))}
              </div>
              
              {/* Account Section for Mobile */}
              <div 
                className="border-t pt-4 mt-4 px-4" 
                style={{ borderTopColor: 'rgba(26, 26, 26, 0.1)' }}
              >
                {currentUser ? (
                  <>
                    {/* User Info */}
                    <div 
                      className="px-4 py-4 mb-4 rounded-2xl relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.03) 0%, rgba(45, 45, 45, 0.05) 100%)'
                      }}
                    >
                      <div className="flex items-center space-x-4 relative z-10">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-white/20 shadow-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                            boxShadow: '0 8px 32px rgba(26, 26, 26, 0.3)'
                          }}
                        >
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div>
                          <p 
                            className="text-sm font-semibold mb-1" 
                            style={{ 
                              color: '#1a1a1a', 
                              fontFamily: 'Playfair Display, serif',
                              letterSpacing: '0.025em'
                            }}
                          >
                            Welcome back!
                          </p>
                          <p 
                            className="text-xs truncate opacity-75" 
                            style={{ 
                              color: '#4a5568', 
                              fontFamily: 'Helvetica, sans-serif',
                              maxWidth: '200px'
                            }}
                          >
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                      {/* Decorative gradient overlay */}
                      <div 
                        className="absolute top-0 right-0 w-16 h-full opacity-10"
                        style={{
                          background: 'linear-gradient(135deg, transparent 0%, #1a1a1a 100%)'
                        }}
                      ></div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Admin Dashboard Link */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="group flex items-center px-4 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/80 rounded-xl relative overflow-hidden"
                          style={{ 
                            color: '#2c3e50', 
                            fontFamily: 'Helvetica, sans-serif',
                            fontWeight: '500'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#1a1a1a';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#2c3e50';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.1) 0%, rgba(45, 45, 45, 0.15) 100%)'
                            }}
                          >
                            <i className="fas fa-cog text-gray-600 text-xs"></i>
                          </div>
                          <span className="relative z-10">Admin Dashboard</span>
                          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gray-400 to-gray-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                        </Link>
                      )}
                      
                      {/* Order History Link */}
                      <Link
                        to="/orders"
                        className="group flex items-center px-4 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 rounded-xl relative overflow-hidden"
                        style={{ 
                          color: '#2c3e50', 
                          fontFamily: 'Helvetica, sans-serif',
                          fontWeight: '500'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1a1a1a';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2c3e50';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%)'
                          }}
                        >
                          <i className="fas fa-box text-blue-600 text-xs"></i>
                        </div>
                        <span className="relative z-10">My Orders</span>
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                      </Link>
                      
                      {/* Divider */}
                      <div className="mx-4 my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                      
                      {/* Sign Out Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="group w-full flex items-center px-4 py-4 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 rounded-xl relative overflow-hidden"
                        style={{ 
                          color: '#2c3e50', 
                          fontFamily: 'Helvetica, sans-serif',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2c3e50';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%)'
                          }}
                        >
                          <i className="fas fa-sign-out-alt text-red-500 text-xs"></i>
                        </div>
                        <span className="relative z-10">Sign Out</span>
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-400 to-red-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {/* Sign In Link */}
                    <Link
                      to="/login"
                      className="group block w-full text-center px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl relative overflow-hidden"
                      style={{
                        color: '#2c3e50',
                        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.05) 0%, rgba(45, 45, 45, 0.08) 100%)',
                        fontFamily: 'Helvetica, sans-serif',
                        fontWeight: '500'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(26, 26, 26, 0.1) 0%, rgba(45, 45, 45, 0.15) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(26, 26, 26, 0.05) 0%, rgba(45, 45, 45, 0.08) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Sign In
                    </Link>
                    
                    {/* Sign Up Link */}
                    <Link
                      to="/register"
                      className="group block w-full text-center px-6 py-4 text-sm font-medium text-white transition-all duration-300 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                        fontFamily: 'Helvetica, sans-serif',
                        fontWeight: '500',
                        boxShadow: '0 4px 15px rgba(26, 26, 26, 0.3)'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 26, 26, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 26, 26, 0.3)';
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;