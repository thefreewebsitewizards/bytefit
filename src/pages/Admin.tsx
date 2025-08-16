import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllProducts, addProduct, updateProduct, deleteProduct, Product, updateOrderStatus, uploadProductImage } from '../services/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

interface Order {
  id: string;
  userId: string;
  customerEmail?: string;
  items: any[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  createdAt?: any;
  paymentMethod?: string;
  shippingAddress?: any;
}

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddProduct = async () => {
    try {
      let imageUrl = productForm.image;
      
      // If a file is selected, upload it first
      if (selectedImageFile) {
        const tempProductId = Date.now().toString(); // Temporary ID for upload
        const uploadedImageUrl = await uploadProductImage(selectedImageFile, tempProductId);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          toast.error('❌ Failed to upload image. Please try again.');
          return;
        }
      }
      
      const productData = {
        ...productForm,
        image: imageUrl,
        price: parseFloat(productForm.price),
        createdAt: Timestamp.now()
      };
      
      await addProduct(productData);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
      setSelectedImageFile(null);
      setImagePreview('');
      loadDashboardData(); // Refresh data
      toast.success(`✅ Product "${productForm.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('❌ Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image: product.image || ''
    });
    setSelectedImageFile(null);
    setImagePreview(product.image || '');
    setShowAddProduct(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('❌ Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('❌ Image file size must be less than 5MB.');
        return;
      }
      
      setSelectedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id) return;
    try {
      let imageUrl = productForm.image;
      
      // If a new file is selected, upload it
      if (selectedImageFile) {
        const uploadedImageUrl = await uploadProductImage(selectedImageFile, editingProduct.id);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          toast.error('❌ Failed to upload image. Please try again.');
          return;
        }
      }
      
      const productData = {
        ...productForm,
        image: imageUrl,
        price: parseFloat(productForm.price)
      };
      
      await updateProduct(editingProduct.id, productData);
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
      setSelectedImageFile(null);
      setImagePreview('');
      loadDashboardData(); // Refresh data
      toast.success(`✏️ Product "${productForm.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('❌ Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        loadDashboardData(); // Refresh data
        toast.success(`🗑️ Product "${product?.name || 'Unknown'}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('❌ Failed to delete product. Please try again.');
      }
    }
  };

  const handleProductSubmit = () => {
    if (editingProduct) {
      handleUpdateProduct();
    } else {
      handleAddProduct();
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadDashboardData(); // Refresh data
      toast.success(`✅ Order status updated to "${newStatus}"`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('❌ Failed to update order status. Please try again.');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsData = await getAllProducts();
      setProducts(productsData);
      
      // Load customers
      const customersQuery = query(collection(db, 'Users'));
      const customersSnapshot = await getDocs(customersQuery);
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
      
      // Load orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      
      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalCustomers: customersData.length,
        totalRevenue: totalRevenue
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'products', label: 'Products', icon: 'fas fa-box' },
    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { id: 'customers', label: 'Customers', icon: 'fas fa-users' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white mr-4">
                <i className="fas fa-box text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalProducts}</h3>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white mr-4">
                <i className="fas fa-shopping-cart text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Playfair Display, serif'}}>{loading ? '...' : stats.totalOrders}</h3>
                <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica, sans-serif'}}>Total Orders</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white mr-4">
                <i className="fas fa-users text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Playfair Display, serif'}}>{loading ? '...' : stats.totalCustomers}</h3>
                <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica, sans-serif'}}>Total Customers</p>
              </div>
            </div>
        </div>
        
        <div className="bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white mr-4">
                <i className="fas fa-dollar-sign text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}</h3>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">Loading recent activity...</p>
            </div>
          ) : (
            <>
              {/* Recent Orders */}
              {orders.slice(0, 2).map((order, index) => (
                <div key={`order-${index}`} className="flex items-center p-3 bg-gray-50">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">New order received</p>
                    <p className="text-gray-600 text-sm">Order #{order.id?.slice(-8) || 'N/A'} - ${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <span className="ml-auto text-gray-500 text-sm">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {/* Recent Products */}
              {products.slice(0, 2).map((product, index) => (
                <div key={`product-${index}`} className="flex items-center p-3 bg-gray-50">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-box"></i>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Product available</p>
                    <p className="text-gray-600 text-sm">{product.name} - ${product.price}</p>
                  </div>
                  <span className="ml-auto text-gray-500 text-sm">
                    ${product.price}
                  </span>
                </div>
              ))}
              
              {/* Recent Customers */}
              {customers.slice(0, 1).map((customer, index) => (
                <div key={`customer-${index}`} className="flex items-center p-3 bg-gray-50">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-sm mr-3">
                    <i className="fas fa-user"></i>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Customer registered</p>
                    <p className="text-gray-600 text-sm">{customer.email}</p>
                  </div>
                  <span className="ml-auto text-gray-500 text-sm">
                    {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              ))}
              
              {orders.length === 0 && products.length === 0 && customers.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-clock text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-all duration-200 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Product
        </button>
      </div>
      
      <div className="bg-white shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first artwork to the gallery.</p>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-all duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {/* Mobile Card View */}
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 p-4 border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={product.image || '/images/placeholder.jpg'} 
                        alt={product.name}
                        className="w-16 h-16 object-cover shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-black truncate">{product.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        </div>
                        <div className="flex space-x-3 mt-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="flex items-center px-3 py-1 bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id!)}
                            className="flex items-center px-3 py-1 bg-black text-white hover:bg-gray-800 transition-colors text-sm">
                          
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Product</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Price</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={product.image || '/images/placeholder.jpg'} 
                              alt={product.name}
                              className="w-14 h-14 object-cover shadow-sm border border-gray-200"
                            />
                          
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-500">ID: {product.id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-black text-white">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex justify-center space-x-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 text-sm font-medium"
                            title="Edit Product"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id!)}
                            className="inline-flex items-center px-3 py-2 bg-black text-white hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
                            title="Delete Product"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      
      <div className="bg-white shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500">No orders have been placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Items</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-black flex items-center justify-center mr-3">
                          <i className="fas fa-receipt text-white text-sm"></i>
                        </div>
                        <span className="font-medium text-gray-900">#{order.id?.slice(-8) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-black flex items-center justify-center mr-3">
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <span className="text-gray-900">{order.customerEmail || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-black text-white">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-lg font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-2 text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                          order.status === 'shipped' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                          order.status === 'processing' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          order.status === 'paid' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          order.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                          'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Preparing</option>
                        <option value="shipped">Shipped Out</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'customers':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <div className="bg-white shadow-lg p-6">
              {loading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Customers Found</h3>
                  <p className="text-gray-500">No customers have registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Customer</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Role</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Joined</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-black flex items-center justify-center mr-4">
                                <span className="text-white font-semibold text-sm">
                                  {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                <p className="text-sm text-gray-500">ID: {customer.id?.slice(-8) || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900">{customer.email}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${
                              customer.role === 'admin' 
                                ? 'bg-black text-white border-black' 
                                : 'bg-black text-white border-black'
                            }`}>
                              <span className={`w-2 h-2 mr-2 ${
                                customer.role === 'admin' ? 'bg-white' : 'bg-white'
                              }`}></span>
                              {customer.role || 'Customer'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 text-xs font-medium bg-black text-white">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <div className="bg-white shadow-lg p-6">
              <p className="text-gray-600 text-center py-12">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 w-72 bg-black text-white transform transition-all duration-300 ease-in-out ${
         sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
       } lg:translate-x-0 lg:opacity-100`} style={{height: '100vh'}}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700 px-6">
          <h2 className="text-xl font-bold text-white">ByteFit Admin</h2>
        </div>
        
        <nav className="mt-6 px-6">
          <ul className="space-y-3">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-5 py-4 text-left transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <i className={`${item.icon} mr-4 w-5 text-center text-lg ${
                    activeSection === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}></i>
                  <span className={`font-medium ${
                     activeSection === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                   }`} style={{fontFamily: 'Helvetica, sans-serif'}}>{item.label}</span>

                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full flex items-center justify-center px-5 py-4 bg-gray-800 hover:bg-gray-700 transition-all duration-300 group"
          >
            <i className="fas fa-sign-out-alt mr-3 text-gray-300 group-hover:text-white"></i>
            <span className="font-medium text-gray-300 group-hover:text-white">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 transition-all duration-200"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-3xl font-bold text-gray-900 capitalize" style={{fontFamily: 'Playfair Display, serif'}}>
                {activeSection}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-800 flex items-center justify-center">
                <i className="fas fa-user text-white text-lg"></i>
              </div>
              <span className="text-gray-700 font-semibold" style={{fontFamily: 'Helvetica, sans-serif'}}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="bg-white shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-12rem)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', category: '', image: '' });
                    setSelectedImageFile(null);
                    setImagePreview('');
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 transition-all duration-200"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-black focus:border-black"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="oversized-tee">Oversized Tee</option>
                    <option value="heavyweight-hoodie">Heavyweight Hoodie</option>
                    <option value="cargo-pants">Modular Cargo Pants</option>

                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-32 h-32 object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    
                    {/* Alternative: Image URL input */}
                    <div className="border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Or enter Image URL</label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) => {
                          setProductForm({ ...productForm, image: e.target.value });
                          setImagePreview(e.target.value);
                          setSelectedImageFile(null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
                

                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
                      setSelectedImageFile(null);
                      setImagePreview('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-medium"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Admin;