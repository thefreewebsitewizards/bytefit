import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatFirestoreDate } from '../utils/dateUtils';
import { toast } from 'react-toastify';
import { updateOrderStatus } from '../services/firebase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Order {
  id: string;
  userId: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  createdAt?: any;
  updatedAt?: any;
  paymentMethod?: string;
  paymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'orders', orderId!));
      
      if (orderDoc.exists()) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
        setOrder(orderData);
      } else {
        toast.error('Order not found');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return 'fas fa-check-circle';
      case 'shipped': return 'fas fa-truck';
      case 'processing': return 'fas fa-cog fa-spin';
      case 'paid': return 'fas fa-credit-card';
      case 'pending': return 'fas fa-clock';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-white hover:bg-black rounded-lg mb-4 transition-all duration-200 border border-gray-300 hover:border-black"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.id.slice(-8)}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                <i className={`${getStatusIcon(order.status)} mr-2`}></i>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-shopping-bag mr-3 text-black"></i>
                  Order Items
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fas fa-image text-gray-400 text-2xl"></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-gray-600 mt-1">
                            <i className="fas fa-tag mr-1"></i>
                            Size: <span className="font-medium">{item.size}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          <i className="fas fa-cubes mr-1"></i>
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-xl">AED {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">AED {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <i className="fas fa-shipping-fast mr-3 text-blue-600"></i>
                    Shipping Address
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
                    <div className="space-y-2">
                      <p className="font-bold text-gray-900 text-lg flex items-center">
                        <i className="fas fa-user mr-2 text-gray-600"></i>
                        {order.shippingAddress.name}
                      </p>
                      <p className="text-gray-700 flex items-start">
                        <i className="fas fa-map-marker-alt mr-2 text-gray-600 mt-1"></i>
                        <span>
                          {order.shippingAddress.address}<br/>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br/>
                          {order.shippingAddress.country}
                        </span>
                      </p>
                      {order.shippingAddress.phone && (
                        <p className="text-gray-700 flex items-center">
                          <i className="fas fa-phone mr-2 text-gray-600"></i>
                          {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-calculator mr-3 text-green-600"></i>
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">AED {(order.subtotal || order.total).toFixed(2)}</span>
                </div>
                {order.shippingCost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">AED {order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">AED {order.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">AED {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-info-circle mr-3 text-purple-600"></i>
                  Order Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Email</label>
                  <p className="text-gray-900">{order.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Date</label>
                  <p className="text-gray-900">{formatFirestoreDate(order.createdAt)}</p>
                </div>
                {order.paymentMethod && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-gray-900">{order.paymentMethod}</p>
                  </div>
                )}
                {order.paymentIntentId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment ID</label>
                    <p className="text-gray-900 text-sm font-mono">{order.paymentIntentId}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                    <p className="text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-edit mr-3 text-orange-600"></i>
                  Update Status
                </h2>
              </div>
              <div className="p-6">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                  disabled={updating}
                  className={`w-full px-4 py-3 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 ${getStatusColor(order.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updating && (
                  <p className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Updating status...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;