/**
 * Custom React hook for API data fetching with loading and error states
 */

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Custom hook for fetching API data with loading and error states
 * @param {string} endpoint - API endpoint to fetch from
 * @param {string} dataKey - Key to extract from response.data (e.g., 'payouts', 'beneficiaries')
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Enable/disable automatic fetching (default: true)
 * @param {Array} options.deps - Dependency array for refetch (default: [])
 * @param {Function} options.transform - Transform data before setting (default: identity)
 * @param {boolean} options.showErrors - Show error toasts (default: false)
 * @returns {{data, loading, error, refetch}}
 */
export const useApiData = (endpoint, dataKey = null, options = {}) => {
  const {
    enabled = true,
    deps = [],
    transform = (data) => data,
    showErrors = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoint);
      
      // Extract data from response
      let extracted = response.data;
      if (dataKey) {
        extracted = response.data?.[dataKey] || [];
      }
      
      // Apply transformation
      const transformed = transform(extracted);
      setData(transformed);
    } catch (err) {
      setError(err);
      handleApiError(err, `fetching data from ${endpoint}`, showErrors);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, enabled, ...deps]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData 
  };
};
