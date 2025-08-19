// Stripe Connect operations for artist account management
// This file handles all Stripe Connect operations through Firebase Functions

// Firebase Functions API base URL
const API_BASE_URL = process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 'https://us-central1-bytefit-v2.cloudfunctions.net';

// Types for Stripe Connect
export interface ConnectedAccount {
  id: string;
  email: string;
  country: string;
  type: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    pending_verification: string[];
  };
  business_profile?: {
    name?: string;
    product_description?: string;
    url?: string;
  };
  capabilities?: {
    card_payments?: { status: string };
    transfers?: { status: string };
  };
}

export interface AccountLink {
  url: string;
  expires_at: number;
}

export interface AccountBalance {
  available: Array<{
    amount: number;
    currency: string;
  }>;
  pending: Array<{
    amount: number;
    currency: string;
  }>;
}

export interface Transfer {
  id: string;
  amount: number;
  currency: string;
  created: number;
  description?: string;
  metadata?: Record<string, string>;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  arrival_date: number;
  created: number;
  description?: string;
  status: string;
  type: string;
  method: string;
}

// Create a new connected account for an artist
export const createConnectedAccount = async (email: string, country: string = 'US'): Promise<ConnectedAccount> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        country,
        type: 'express',
        businessType: 'individual',
        metadata: {
          platform: 'bytefit',
          userType: 'artist',
          registrationDate: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create connected account');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating connected account:', error);
    throw error;
  }
};

// Create an account link for onboarding
export const createAccountLink = async (accountId: string, type: string = 'account_onboarding'): Promise<AccountLink> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/create-account-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        type
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create account link');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
};

// Get account information
export const getConnectedAccount = async (accountId: string): Promise<ConnectedAccount> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/account/${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve account');
    }

    const result = await response.json();
    return result.account;
  } catch (error) {
    console.error('Error retrieving account:', error);
    throw error;
  }
};

// Update account information
export const updateConnectedAccount = async (accountId: string, updateData: any): Promise<Partial<ConnectedAccount>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/account/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to update account');
    }

    const result = await response.json();
    return result.account;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

// Create a login link for the Express dashboard
export const createLoginLink = async (accountId: string): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/create-login-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create login link');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
};

// Get account balance
export const getAccountBalance = async (accountId: string): Promise<AccountBalance> => {
  try {
    const response = await fetch(`${API_BASE_URL}/connect/balance/${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve balance');
    }

    const result = await response.json();
    return result.balance;
  } catch (error) {
    console.error('Error retrieving balance:', error);
    throw error;
  }
};

// Get transfers for account
export const getAccountTransfers = async (accountId: string, limit: number = 10, startingAfter?: string): Promise<{ transfers: Transfer[]; has_more: boolean }> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    if (startingAfter) {
      params.append('starting_after', startingAfter);
    }

    const response = await fetch(`${API_BASE_URL}/connect/transfers/${accountId}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve transfers');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error retrieving transfers:', error);
    throw error;
  }
};

// Get payouts for account
export const getAccountPayouts = async (accountId: string, limit: number = 10, startingAfter?: string): Promise<{ payouts: Payout[]; has_more: boolean }> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    if (startingAfter) {
      params.append('starting_after', startingAfter);
    }

    const response = await fetch(`${API_BASE_URL}/connect/payouts/${accountId}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to retrieve payouts');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error retrieving payouts:', error);
    throw error;
  }
};

// Helper function to check if account is fully onboarded
export const isAccountFullyOnboarded = (account: ConnectedAccount): boolean => {
  return account.charges_enabled && 
         account.payouts_enabled && 
         account.details_submitted &&
         (!account.requirements.currently_due || account.requirements.currently_due.length === 0);
};

// Helper function to get account status message
export const getAccountStatusMessage = (account: ConnectedAccount): string => {
  if (isAccountFullyOnboarded(account)) {
    return 'Your account is fully activated and ready to receive payments!';
  }
  
  if (!account.details_submitted) {
    return 'Please complete your account setup to start receiving payments.';
  }
  
  if (account.requirements.currently_due && account.requirements.currently_due.length > 0) {
    return `${account.requirements.currently_due.length} items need attention to complete your account setup.`;
  }
  
  if (!account.charges_enabled) {
    return 'Your account is being reviewed. You\'ll be able to accept payments once approved.';
  }
  
  if (!account.payouts_enabled) {
    return 'Your account can accept payments, but payouts are still being set up.';
  }
  
  return 'Your account setup is in progress.';
};

// Helper function to format currency amounts
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
};

// Helper function to format dates
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};