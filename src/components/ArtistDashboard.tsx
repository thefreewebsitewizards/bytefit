import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getConnectedAccount,
  getAccountBalance,
  getAccountTransfers,
  getAccountPayouts,
  createLoginLink,
  isAccountFullyOnboarded,
  formatCurrency,
  formatDate,
  ConnectedAccount,
  AccountBalance,
  Transfer,
  Payout
} from '../services/stripeConnect';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import ArtistOnboarding from './ArtistOnboarding';

interface Order {
  id: string;
  productId: string;
  productTitle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: any;
  customerEmail: string;
}

const ArtistDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'transfers' | 'payouts'>('overview');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    thisMonthEarnings: 0,
    thisMonthOrders: 0
  });

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get artist data from Firebase
      const artistDoc = await getDoc(doc(db, 'artists', currentUser.uid));
      if (!artistDoc.exists()) {
        setError('Artist profile not found');
        return;
      }

      const artistData = artistDoc.data();
      if (!artistData.stripeAccountId) {
        // No Stripe account yet, show onboarding
        setLoading(false);
        return;
      }

      setStripeAccountId(artistData.stripeAccountId);

      // Load Stripe account data
      const accountData = await getConnectedAccount(artistData.stripeAccountId);
      setAccount(accountData);

      if (isAccountFullyOnboarded(accountData)) {
        // Load financial data
        await Promise.all([
          loadBalance(artistData.stripeAccountId),
          loadTransfers(artistData.stripeAccountId),
          loadPayouts(artistData.stripeAccountId),
          loadOrders()
        ]);
      }

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (accountId: string) => {
    try {
      const balanceData = await getAccountBalance(accountId);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error loading balance:', err);
    }
  };

  const loadTransfers = async (accountId: string) => {
    try {
      const transfersData = await getAccountTransfers(accountId, 10);
      setTransfers(transfersData.transfers);
    } catch (err) {
      console.error('Error loading transfers:', err);
    }
  };

  const loadPayouts = async (accountId: string) => {
    try {
      const payoutsData = await getAccountPayouts(accountId, 10);
      setPayouts(payoutsData.payouts);
    } catch (err) {
      console.error('Error loading payouts:', err);
    }
  };

  const loadOrders = async () => {
    try {
      // Get orders for this artist
      const ordersQuery = query(
        collection(db, 'orders'),
        where('artistId', '==', currentUser!.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersData);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalEarnings = ordersData
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
      
      const totalOrders = ordersData.filter(order => order.status === 'completed').length;
      
      const thisMonthOrders = ordersData.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return order.status === 'completed' && orderDate >= thisMonth;
      });
      
      const thisMonthEarnings = thisMonthOrders.reduce((sum, order) => sum + order.amount, 0);
      
      setStats({
        totalEarnings,
        totalOrders,
        thisMonthEarnings,
        thisMonthOrders: thisMonthOrders.length
      });
      
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const handleAccessDashboard = async () => {
    if (!stripeAccountId) return;

    try {
      const loginLink = await createLoginLink(stripeAccountId);
      window.open(loginLink.url, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to access Stripe dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // Show onboarding if no Stripe account
  if (!stripeAccountId || !account) {
    return <ArtistOnboarding onComplete={loadDashboardData} />;
  }

  // Show setup incomplete message
  if (!isAccountFullyOnboarded(account)) {
    return <ArtistOnboarding onComplete={loadDashboardData} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your sales, earnings, and account settings</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.thisMonthEarnings)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Orders This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.thisMonthOrders}</p>
        </div>
      </div>

      {/* Account Balance */}
      {balance && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Account Balance</h2>
            <button
              onClick={handleAccessDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Stripe Dashboard
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Available for Payout</h3>
              {balance.available.map((bal, index) => (
                <div key={index} className="text-2xl font-bold text-green-600">
                  {formatCurrency(bal.amount, bal.currency)}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
              {balance.pending.map((bal, index) => (
                <div key={index} className="text-2xl font-bold text-orange-600">
                  {formatCurrency(bal.amount, bal.currency)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'orders', label: 'Recent Orders' },
              { key: 'transfers', label: 'Transfers' },
              { key: 'payouts', label: 'Payouts' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-mono text-sm">{stripeAccountId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span>{account.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Name:</span>
                  <span>{account.business_profile?.name || 'Not set'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.productTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customerEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.amount, order.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.createdAt?.toDate ? 
                              order.createdAt.toDate().toLocaleDateString() :
                              new Date(order.createdAt).toLocaleDateString()
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfers' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transfers</h3>
              {transfers.length === 0 ? (
                <p className="text-gray-500">No transfers yet</p>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{formatCurrency(transfer.amount, transfer.currency)}</p>
                          <p className="text-sm text-gray-500">{transfer.description || 'Payment transfer'}</p>
                          <p className="text-xs text-gray-400">ID: {transfer.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(transfer.created)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payouts</h3>
              {payouts.length === 0 ? (
                <p className="text-gray-500">No payouts yet</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                          <p className="text-sm text-gray-500">
                            {payout.method} • {payout.type}
                          </p>
                          <p className="text-xs text-gray-400">ID: {payout.id}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payout.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payout.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payout.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Arrives: {formatDate(payout.arrival_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;