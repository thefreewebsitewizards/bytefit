import React, { useState, useEffect } from 'react';
import {
  listShippingRates,
  updateShippingRate,
  formatShippingAmount,
  formatDeliveryEstimate,
  ShippingRate
} from '../services/clientShipping';
import { toast } from 'react-toastify';

interface ShippingRateManagerProps {
  connectedAccountId: string;
  onRatesUpdated?: () => void;
}

const ShippingRateManager: React.FC<ShippingRateManagerProps> = ({
  connectedAccountId,
  onRatesUpdated
}) => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingRates();
  }, [connectedAccountId]);

  const loadShippingRates = async () => {
    try {
      setLoading(true);
      const response = await listShippingRates(connectedAccountId);
      setRates(response.data);
    } catch (error) {
      console.error('Error loading shipping rates:', error);
      toast.error('Failed to load shipping rates');
    } finally {
      setLoading(false);
    }
  };



  const handleToggleActive = async (rateId: string, currentActive: boolean) => {
    try {
      await updateShippingRate(connectedAccountId, rateId, {
        active: !currentActive
      });
      toast.success(`Shipping rate ${!currentActive ? 'activated' : 'deactivated'}`);
      loadShippingRates();
      onRatesUpdated?.();
    } catch (error) {
      console.error('Error updating shipping rate:', error);
      toast.error('Failed to update shipping rate');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading shipping rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Rates</h3>
        <div className="text-sm text-gray-600">
          Configure shipping rates in your <a href="https://dashboard.stripe.com/shipping-rates" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Stripe Dashboard</a>
        </div>
      </div>

      {/* Existing Rates */}
      {rates.length > 0 ? (
        <div className="grid gap-4">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className={`p-4 border rounded-lg ${
                rate.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{rate.display_name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatShippingAmount(rate)} • 
                    {formatDeliveryEstimate(rate.delivery_estimate)}
                  </p>
                  {rate.metadata?.description && (
                    <p className="text-xs text-gray-500 mt-1">{rate.metadata.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      rate.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rate.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(rate.id, rate.active || false)}
                    className={`px-3 py-1 text-xs rounded ${
                      rate.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } transition-colors`}
                  >
                    {rate.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping rates configured</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure shipping rates in your Stripe Dashboard to start accepting orders.
          </p>
          <a
            href="https://dashboard.stripe.com/shipping-rates"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            Open Stripe Dashboard
          </a>
        </div>
      )}


    </div>
  );
};

export default ShippingRateManager;