import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllProducts, addProduct, updateProduct, deleteProduct, Product, updateOrderStatus, uploadProductImage, uploadProductImages, getAllCategories, addCategory, updateCategory, deleteCategory, Category } from '../services/firebase';
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
  userType?: string;
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
  const [productLoading, setProductLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddProduct = async () => {
    try {
      setProductLoading(true);
      let imageUrl = '';
      let imageUrls: string[] = [];
      
      // Handle multiple images if selected
      if (selectedImageFiles.length > 0) {
        const tempProductId = Date.now().toString(); // Temporary ID for upload
        const uploadedImageUrls = await uploadProductImages(selectedImageFiles, tempProductId);
        if (uploadedImageUrls.length > 0) {
          imageUrls = uploadedImageUrls;
          imageUrl = uploadedImageUrls[0]; // Set first image as main image for backward compatibility
        } else {
          toast.error('❌ Failed to upload images. Please try again.');
          return;
        }
      } else {
        toast.error('❌ Please select at least one product image.');
        return;
      }
      
      const productData = {
        ...productForm,
        image: imageUrl,
        images: imageUrls,
        price: parseFloat(productForm.price),
        createdAt: Timestamp.now()
      };
      
      await addProduct(productData);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
      setSelectedImageFiles([]);
      setImagePreviews([]);
      loadDashboardData(); // Refresh data
      toast.success(`✅ Product "${productForm.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('❌ Failed to add product. Please try again.');
    } finally {
      setProductLoading(false);
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
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images || []);
    setImagesToDelete([]);
    setShowAddProduct(true);
  };

  const handleMultipleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 10; // Maximum 10 images per product

    if (files.length > maxFiles) {
      toast.error(`❌ Maximum ${maxFiles} images allowed per product`);
      return;
    }

    const validFiles: File[] = [];
    const previews: string[] = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`❌ ${file.name} is not a valid image file`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`❌ ${file.name} is too large (max 5MB)`);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        processedCount++;
        if (processedCount === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImageFiles(validFiles);
  };

  const removeImagePreview = (index: number) => {
    const newFiles = selectedImageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageUrl: string) => {
    setImagesToDelete([...imagesToDelete, imageUrl]);
    setExistingImages(existingImages.filter(img => img !== imageUrl));
  };

  const restoreExistingImage = (imageUrl: string) => {
    setImagesToDelete(imagesToDelete.filter(img => img !== imageUrl));
    setExistingImages([...existingImages, imageUrl]);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id) return;
    try {
      setProductLoading(true);
      let imageUrl = productForm.image;
      let imageUrls: string[] = [...existingImages]; // Start with existing images
      
      // Handle multiple new images if selected
      if (selectedImageFiles.length > 0) {
        const uploadedImageUrls = await uploadProductImages(selectedImageFiles, editingProduct.id);
        if (uploadedImageUrls.length > 0) {
          imageUrls = [...imageUrls, ...uploadedImageUrls]; // Add new images to existing ones
          if (!imageUrl || imagesToDelete.includes(imageUrl)) {
            imageUrl = uploadedImageUrls[0]; // Set first new image as main if current main is deleted
          }
        } else {
          toast.error('❌ Failed to upload new images. Please try again.');
          return;
        }
      }
      
      // Ensure main image is still valid after deletions
      if (imagesToDelete.includes(imageUrl) && imageUrls.length > 0) {
        imageUrl = imageUrls[0];
      }
      
      const productData = {
        ...productForm,
        image: imageUrl,
        images: imageUrls,
        price: parseFloat(productForm.price)
      };
      
      await updateProduct(editingProduct.id, productData);
      setShowAddProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      loadDashboardData(); // Refresh data
      toast.success(`✏️ Product "${productForm.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('❌ Failed to update product. Please try again.');
    } finally {
      setProductLoading(false);
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

  // Category management functions
  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleAddCategory = async () => {
    try {
      const slug = generateSlug(categoryForm.name);
      const categoryData = {
        ...categoryForm,
        slug
      };
      
      await addCategory(categoryData);
      setShowAddCategory(false);
      setCategoryForm({ name: '', description: '', slug: '', isActive: true });
      loadDashboardData(); // Refresh data
      toast.success(`✅ Category "${categoryForm.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('❌ Failed to add category. Please try again.');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      isActive: category.isActive
    });
    setShowAddCategory(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const slug = generateSlug(categoryForm.name);
      const categoryData = {
        ...categoryForm,
        slug
      };
      
      await updateCategory(editingCategory.id!, categoryData);
      setShowAddCategory(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', slug: '', isActive: true });
      loadDashboardData(); // Refresh data
      toast.success(`✅ Category "${categoryForm.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('❌ Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(categoryId);
        loadDashboardData(); // Refresh data
        toast.success(`🗑️ Category "${category?.name || 'Unknown'}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('❌ Failed to delete category. Please try again.');
      }
    }
  };

  const handleCategorySubmit = () => {
    if (editingCategory) {
      handleUpdateCategory();
    } else {
      handleAddCategory();
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
      
      // Load categories
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
      
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
    { id: 'categories', label: 'Categories', icon: 'fas fa-tags' },
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
                        src={(product.images && product.images.length > 0 ? product.images[0] : product.image) || '/images/placeholder.jpg'} 
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
                              src={(product.images && product.images.length > 0 ? product.images[0] : product.image) || '/images/placeholder.jpg'} 
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
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
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
                          <div className="w-8 h-8 bg-black flex items-center justify-center mr-3 rounded">
                            <i className="fas fa-receipt text-white text-sm"></i>
                          </div>
                          <span className="font-medium text-gray-900">#{order.id?.slice(-8) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-black flex items-center justify-center mr-3 rounded">
                            <i className="fas fa-user text-white text-sm"></i>
                          </div>
                          <span className="text-gray-900">{order.customerEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-black text-white rounded">
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
                          className={`px-3 py-2 text-sm font-medium border-2 rounded focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 ${
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
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg flex-shrink-0">
                      <i className="fas fa-receipt text-white"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">Order #{order.id?.slice(-8) || 'N/A'}</h4>
                          <p className="text-sm text-gray-500 truncate">{order.customerEmail || 'N/A'}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</p>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded">
                            {order.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                          className={`w-full px-3 py-2 text-sm font-medium border-2 rounded focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 ${
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }
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
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
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
                                <div className="w-10 h-10 bg-black flex items-center justify-center mr-4 rounded">
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
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border rounded ${
                                (customer.role === 'admin' || customer.userType === 'admin')
                                  ? 'bg-black text-white border-black' 
                                  : 'bg-black text-white border-black'
                              }`}>
                                <span className={`w-2 h-2 mr-2 rounded-full ${
                                  (customer.role === 'admin' || customer.userType === 'admin') ? 'bg-white' : 'bg-white'
                                }`}></span>
                                {customer.role || customer.userType || 'Customer'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2 py-1 text-xs font-medium bg-black text-white rounded">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4 p-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg flex-shrink-0">
                            <span className="text-white font-semibold">
                              {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{customer.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                                <p className="text-xs text-gray-400 mt-1">ID: {customer.id?.slice(-8) || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded ${
                                  (customer.role === 'admin' || customer.userType === 'admin')
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-black text-white border-black'
                                }`}>
                                  <span className={`w-1.5 h-1.5 mr-1 rounded-full ${
                                    (customer.role === 'admin' || customer.userType === 'admin') ? 'bg-white' : 'bg-white'
                                  }`}></span>
                                  {customer.role || customer.userType || 'Customer'}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  Active
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            }
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
              <button
                onClick={() => {
                  setShowAddCategory(true);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', slug: '', isActive: true });
                }}
                className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add Category
              </button>
            </div>

            <div className="bg-white shadow-lg">
              {loading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
                  <p className="text-gray-500">Create your first category to organize your products.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Category</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Description</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Slug</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Created</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                          <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-black flex items-center justify-center mr-4 rounded">
                                  <i className="fas fa-tag text-white text-sm"></i>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                  <p className="text-sm text-gray-500">ID: {category.id?.slice(-8) || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                              {category.description || 'No description'}
                            </td>
                            <td className="py-4 px-6">
                              <code className="bg-gray-100 px-2 py-1 text-sm text-gray-800 rounded">{category.slug}</code>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border rounded ${
                                category.isActive
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                <span className={`w-2 h-2 mr-2 rounded-full ${
                                  category.isActive ? 'bg-green-400' : 'bg-red-400'
                                }`}></span>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {category.createdAt ? new Date(category.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded hover:bg-blue-50"
                                  title="Edit Category"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id!)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded hover:bg-red-50"
                                  title="Delete Category"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4 p-4">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg flex-shrink-0">
                            <i className="fas fa-tag text-white"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{category.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{category.description || 'No description'}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <code className="bg-gray-100 px-2 py-1 text-xs text-gray-800 rounded">{category.slug}</code>
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded ${
                                    category.isActive
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 mr-1 rounded-full ${
                                      category.isActive ? 'bg-green-400' : 'bg-red-400'
                                    }`}></span>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                  Created: {category.createdAt ? new Date(category.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-3">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded hover:bg-blue-50"
                                title="Edit Category"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id!)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded hover:bg-red-50"
                                title="Delete Category"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            }
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
      <aside className={`fixed top-0 left-0 z-50 w-72 sm:w-80 bg-black text-white transform transition-all duration-300 ease-in-out ${
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 touch-manipulation"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 capitalize truncate" style={{fontFamily: 'Playfair Display, serif'}}>
                {activeSection}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 flex items-center justify-center rounded">
                <i className="fas fa-user text-white text-sm sm:text-lg"></i>
              </div>
              <span className="hidden sm:block text-gray-700 font-semibold text-sm lg:text-base" style={{fontFamily: 'Helvetica, sans-serif'}}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 lg:p-6">
          <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-12rem)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-gray-300 shadow-2xl w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide rounded-lg" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', category: '', image: '' });
                    setSelectedImageFiles([]);
                    setImagePreviews([]);
                    setExistingImages([]);
                    setImagesToDelete([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 touch-manipulation"
                >
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleProductSubmit(); }} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
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
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.isActive).map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="space-y-3">
                    
                    {/* Existing Images (for editing) */}
                    {editingProduct && existingImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Current Images ({existingImages.length}):</p>
                        <div className="grid grid-cols-3 gap-2">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Current product image ${index + 1}`}
                                className="w-full h-20 object-cover border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(imageUrl)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove this image"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        {imagesToDelete.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600">
                              {imagesToDelete.length} image(s) will be removed when you save.
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {imagesToDelete.map((imageUrl, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => restoreExistingImage(imageUrl)}
                                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                  title="Click to restore this image"
                                >
                                  Restore #{index + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Product Image Upload */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageFileChange}
                        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 file:rounded-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">Select product images (max 10, 5MB each)</p>
                    </div>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">New Images ({imagePreviews.length}):</p>
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Product preview ${index + 1}`}
                                className="w-full h-20 object-cover border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeImagePreview(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                

                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
                      setSelectedImageFiles([]);
                      setImagePreviews([]);
                      setExistingImages([]);
                      setImagesToDelete([]);
                    }}
                    className="flex-1 px-4 py-3 sm:py-2 bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 rounded-lg transition-all duration-200 touch-manipulation font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productLoading}
                    className={`flex-1 px-4 py-3 sm:py-2 font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                      productLoading 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {productLoading ? (
                      <div className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {editingProduct ? 'Updating...' : 'Adding...'}
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-gray-300 shadow-2xl w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide rounded-lg" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', slug: '', isActive: true });
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 touch-manipulation"
                >
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCategorySubmit(); }} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    placeholder="e.g., T-Shirts, Hoodies, Pants"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    rows={3}
                    placeholder="Brief description of this category..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={categoryForm.slug || generateSlug(categoryForm.name)}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-3 py-3 sm:py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:border-black text-base sm:text-sm"
                    placeholder="auto-generated-from-name"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from category name</p>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-black focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Category</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Only active categories will be visible on the website</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setEditingCategory(null);
                      setCategoryForm({ name: '', description: '', slug: '', isActive: true });
                    }}
                    className="flex-1 px-4 py-3 sm:py-2 bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 rounded-lg transition-all duration-200 touch-manipulation font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 sm:py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-all duration-200 touch-manipulation font-medium"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
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