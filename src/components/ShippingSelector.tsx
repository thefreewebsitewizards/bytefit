import React, { useState, useEffect, useRef } from 'react';
import { getCheckoutRates, formatShippingAmount, formatDeliveryEstimate, ShippingRate } from '../services/clientShipping';

interface ShippingSelectorProps {
  orderTotal: number;
  connectedAccountId?: string;
  onShippingSelect: (rate: ShippingRate | null) => void;
  selectedShippingRate?: ShippingRate | null;
}

const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  orderTotal,
  connectedAccountId,
  onShippingSelect,
  selectedShippingRate
}) => {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualifiesForFreeShipping, setQualifiesForFreeShipping] = useState(false);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!connectedAccountId || connectedAccountId === 'acct_placeholder') {
        setError('No connected account configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getCheckoutRates(connectedAccountId, orderTotal);
        setShippingRates(response.rates || []);
        
        // Check if any rate has amount 0 for free shipping
        const hasFreeShipping = response.rates?.some(rate => {
          const amount = rate.fixed_amount?.amount ?? rate.amount ?? 0;
          return amount === 0;
        }) || false;
        setQualifiesForFreeShipping(hasFreeShipping);
        
        // Auto-select free shipping if available (only once)
        if (response.rates && response.rates.length > 0 && !hasAutoSelected.current) {
          const freeShippingRate = response.rates.find(rate => {
            const amount = rate.fixed_amount?.amount ?? rate.amount ?? 0;
            return amount === 0;
          });
          if (freeShippingRate) {
            onShippingSelect(freeShippingRate);
            hasAutoSelected.current = true;
          } else {
            // Auto-select first rate if no free shipping
            onShippingSelect(response.rates[0]);
            hasAutoSelected.current = true;
          }
        }
      } catch (err) {
        console.error('Failed to fetch shipping rates:', err);
        setError('Failed to load shipping options. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShippingRates();
  }, [orderTotal, connectedAccountId, onShippingSelect]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
        <h3 className="font-patrick-hand-sc text-lg font-bold mb-3 text-slate-800">
          Shipping Options
        </h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-red-200">
        <h3 className="font-patrick-hand-sc text-lg font-bold mb-3 text-slate-800">
          Shipping Options
        </h3>
        <div className="text-center py-3">
          <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-patrick-hand text-red-600 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (shippingRates.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
        <h3 className="font-patrick-hand-sc text-lg font-bold mb-3 text-slate-800">
          Shipping Options
        </h3>
        <div className="text-center py-3">
          <div className="w-8 h-8 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-patrick-hand text-slate-600 text-xs">
            No shipping options available. Shipping will be calculated at checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
      <h3 className="font-patrick-hand-sc text-lg font-bold mb-3 text-slate-800">
        Choose Shipping Option
      </h3>
      
      {qualifiesForFreeShipping && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-patrick-hand text-green-700 text-sm font-medium">
              🎉 You qualify for free shipping!
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {shippingRates.map((rate) => (
          <div
            key={rate.id}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedShippingRate?.id === rate.id
                ? 'ring-2 ring-slate-900 bg-slate-50'
                : 'hover:bg-slate-50 border border-slate-200'
            } rounded-lg p-3`}
            onClick={() => onShippingSelect(rate)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  selectedShippingRate?.id === rate.id
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300'
                }`}>
                  {selectedShippingRate?.id === rate.id && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-patrick-hand-sc font-bold text-slate-800 text-sm">
                      {rate.display_name}
                    </h4>
                    {rate.amount === 0 && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="font-patrick-hand text-slate-600 text-xs">
                    {formatDeliveryEstimate(rate.delivery_estimate)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-patrick-hand-sc font-bold text-slate-800 text-sm">
                  {(rate.fixed_amount?.amount ?? rate.amount ?? 0) === 0 ? 'Free' : formatShippingAmount(rate)}
                </div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedShippingRate?.id === rate.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 to-slate-600/10 rounded-lg pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-patrick-hand text-slate-700 text-xs">
            Shipping rates are set by the artist. Final shipping cost will be calculated based on your delivery address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingSelector;