import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createConnectedAccount,
  createAccountLink,
  getConnectedAccount,
  createLoginLink,
  getAccountBalance,
  isAccountFullyOnboarded,
  getAccountStatusMessage,
  formatCurrency,
  ConnectedAccount,
  AccountBalance
} from '../services/stripeConnect';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ArtistOnboardingProps {
  onComplete?: () => void;
}

const ArtistOnboarding: React.FC<ArtistOnboardingProps> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadArtistData();
    }
  }, [currentUser]);

  const loadArtistData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Get artist data from Firebase
      const artistDoc = await getDoc(doc(db, 'artists', currentUser.uid));
      if (artistDoc.exists()) {
        const artistData = artistDoc.data();
        if (artistData.stripeAccountId) {
          setStripeAccountId(artistData.stripeAccountId);
          
          // Load Stripe account data
          const accountData = await getConnectedAccount(artistData.stripeAccountId);
          setAccount(accountData);
          
          // Load balance if account is active
          if (isAccountFullyOnboarded(accountData)) {
            const balanceData = await getAccountBalance(artistData.stripeAccountId);
            setBalance(balanceData);
          }
        }
      }
    } catch (err) {
      console.error('Error loading artist data:', err);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!currentUser?.email) {
      setError('User email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create Stripe Connect account
      const newAccount = await createConnectedAccount(currentUser.email);
      setAccount(newAccount);
      setStripeAccountId(newAccount.id);

      // Save account ID to Firebase
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        stripeAccountId: newAccount.id,
        stripeAccountCreated: new Date(),
        accountStatus: 'pending'
      });

      // Create onboarding link and redirect
      const accountLink = await createAccountLink(newAccount.id, 'account_onboarding');
      window.location.href = accountLink.url;

    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    if (!stripeAccountId) return;

    try {
      setLoading(true);
      setError(null);

      const accountLink = await createAccountLink(stripeAccountId, 'account_onboarding');
      window.location.href = accountLink.url;

    } catch (err: any) {
      console.error('Error creating onboarding link:', err);
      setError(err.message || 'Failed to create onboarding link');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    if (!stripeAccountId) return;

    try {
      setLoading(true);
      setError(null);

      const loginLink = await createLoginLink(stripeAccountId);
      window.open(loginLink.url, '_blank');

    } catch (err: any) {
      console.error('Error creating login link:', err);
      setError(err.message || 'Failed to access dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshAccountData = async () => {
    if (!stripeAccountId) return;

    try {
      setLoading(true);
      const accountData = await getConnectedAccount(stripeAccountId);
      setAccount(accountData);

      // Update Firebase with latest status
      await updateDoc(doc(db, 'artists', currentUser!.uid), {
        accountStatus: isAccountFullyOnboarded(accountData) ? 'active' : 'pending',
        lastAccountUpdate: new Date()
      });

      if (isAccountFullyOnboarded(accountData)) {
        const balanceData = await getAccountBalance(stripeAccountId);
        setBalance(balanceData);
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err: any) {
      console.error('Error refreshing account:', err);
      setError(err.message || 'Failed to refresh account data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading account information...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Artist Payment Setup</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!account ? (
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Set Up Your Payment Account</h3>
          <p className="text-gray-600 mb-6">
            To start selling your artwork and receive payments, you'll need to set up a Stripe account.
            This process is secure and takes just a few minutes.
          </p>
          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Set Up Payment Account'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Status</h3>
            <p className="text-gray-600 mb-4">{getAccountStatusMessage(account)}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Charges Enabled:</span>
                <span className={`ml-2 ${account.charges_enabled ? 'text-green-600' : 'text-red-600'}`}>
                  {account.charges_enabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Payouts Enabled:</span>
                <span className={`ml-2 ${account.payouts_enabled ? 'text-green-600' : 'text-red-600'}`}>
                  {account.payouts_enabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Details Submitted:</span>
                <span className={`ml-2 ${account.details_submitted ? 'text-green-600' : 'text-red-600'}`}>
                  {account.details_submitted ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Requirements:</span>
                <span className={`ml-2 ${account.requirements.currently_due.length === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {account.requirements.currently_due.length} pending
                </span>
              </div>
            </div>
          </div>

          {balance && (
            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Balance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Available:</span>
                  {balance.available.map((bal, index) => (
                    <div key={index} className="text-lg font-semibold text-green-600">
                      {formatCurrency(bal.amount, bal.currency)}
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Pending:</span>
                  {balance.pending.map((bal, index) => (
                    <div key={index} className="text-lg font-semibold text-orange-600">
                      {formatCurrency(bal.amount, bal.currency)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {!isAccountFullyOnboarded(account) && (
              <button
                onClick={handleContinueOnboarding}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Continue Setup'}
              </button>
            )}
            
            {account.charges_enabled && (
              <button
                onClick={handleAccessDashboard}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Access Dashboard
              </button>
            )}
            
            <button
              onClick={refreshAccountData}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          {account.requirements.currently_due.length > 0 && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <h4 className="font-medium text-orange-800 mb-2">Required Information:</h4>
              <ul className="list-disc list-inside text-sm text-orange-700">
                {account.requirements.currently_due.map((requirement, index) => (
                  <li key={index} className="capitalize">
                    {requirement.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistOnboarding;