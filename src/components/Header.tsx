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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-md'
        }`}
        style={{
          border: 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Business Name - Left */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105"
            >
              <span 
                className="font-patrick-hand text-xl font-bold transition-colors duration-300 group-hover:text-purple-600"
                style={{ color: '#2c3e50' }}
              >
                BYTEFIT
              </span>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { to: '/', label: 'Home' },
                { to: '/gallery', label: 'Shop' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-base font-medium transition-all duration-200 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-full"
                  style={{ 
                    color: '#6b7280',
                    fontFamily: 'Helvetica, sans-serif'
                  }}

                >
                  {item.label}
                </Link>
              ))}

            </nav>

            {/* Right Section - Cart & Account */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="group relative p-2 rounded-full transition-all duration-300 hover:bg-gray-50"
                style={{ color: '#2c3e50' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.color = '#2c3e50';
                }}
              >
                <i className="fas fa-shopping-cart text-lg"></i>
                {itemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                    style={{ 
                      background: '#6b7280'
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
                    className="group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg,rgb(7, 7, 7) 0%,rgb(32, 32, 32) 100%)'
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
                        className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                        style={{ 
                          borderColor: '#e9ecef',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        {/* User Info Header */}
                        <div 
                          className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b"
                          style={{ borderBottomColor: '#e9ecef' }}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
                            >
                              <i className="fas fa-user text-white"></i>
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}>Welcome back!</p>
                              <p className="text-xs truncate" style={{ color: '#7f8c8d', fontFamily: 'Helvetica, sans-serif' }}>{currentUser.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center px-6 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                              style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                              onClick={() => setIsAccountDropdownOpen(false)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.paddingLeft = '1.75rem';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#2c3e50';
                                e.currentTarget.style.paddingLeft = '1.5rem';
                              }}
                            >
                              <i className="fas fa-cog mr-3 text-gray-500"></i>
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/orders"
                            className="flex items-center px-6 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                            style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                            onClick={() => setIsAccountDropdownOpen(false)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#6b7280';
                              e.currentTarget.style.paddingLeft = '1.75rem';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2c3e50';
                              e.currentTarget.style.paddingLeft = '1.5rem';
                            }}
                          >
                            <i className="fas fa-box mr-3 text-gray-500"></i>
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-6 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50"
                            style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#e74c3c';
                              e.currentTarget.style.paddingLeft = '1.75rem';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#2c3e50';
                              e.currentTarget.style.paddingLeft = '1.5rem';
                            }}
                          >
                            <i className="fas fa-sign-out-alt mr-3 text-red-500"></i>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 font-inter text-base font-medium rounded-lg transition-all duration-300 hover:bg-gray-50"
                    style={{ color: '#2c3e50' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#2c3e50';
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 font-inter text-base font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
                style={{ color: '#2c3e50' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2c3e50';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute top-0 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2.5' : ''}`}></span>
                  <span className={`absolute top-2.5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`absolute top-5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-2 border-t overflow-y-auto" style={{ borderTopColor: '#e9ecef', maxHeight: 'calc(100vh - 200px)' }}>
              {/* Navigation Links */}
              {[
                { to: '/', label: 'Home' },
                { to: '/gallery', label: 'Shop' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-4 py-3 text-base font-medium transition-colors duration-200 hover:text-purple-600 hover:bg-gray-50 rounded-lg mx-2"
                  style={{ color: '#6b7280', fontFamily: 'Helvetica, sans-serif' }}

                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Account Section for Mobile */}
              <div className="border-t pt-2 mt-2" style={{ borderTopColor: '#e9ecef' }}>
                {currentUser ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 mx-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        >
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}>Welcome back!</p>
                          <p className="text-xs truncate" style={{ color: '#7f8c8d', fontFamily: 'Helvetica, sans-serif' }}>{currentUser.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Dashboard Link */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:bg-gray-100"
                        style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#667eea';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2c3e50';
                          e.currentTarget.style.paddingLeft = '1rem';
                        }}
                      >
                        <i className="fas fa-cog mr-3 text-purple-500"></i>
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {/* Order History Link */}
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                      style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2c3e50';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-box mr-3 text-blue-500"></i>
                      My Orders
                    </Link>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50"
                      style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#e74c3c';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2c3e50';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-red-500"></i>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Sign In Link */}
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:bg-gray-100"
                      style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}

                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2c3e50';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-sign-in-alt mr-3 text-gray-500"></i>
                      Sign In
                    </Link>
                    
                    {/* Sign Up Link */}
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
                      style={{ color: '#2c3e50', fontFamily: 'Helvetica, sans-serif' }}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2c3e50';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <i className="fas fa-user-plus mr-3 text-purple-500"></i>
                      Sign Up
                    </Link>
                  </>
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