/**
 * Dashboard Service - Handles dashboard-related API calls
 */

import { api } from './api';

/**
 * Get dashboard overview data (balance, stats, etc.)
 * @returns {Promise<Object>}
 */
export const getDashboardOverview = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data || {};
};

/**
 * Get balance information
 * @returns {Promise<{available: number, pending: number, total: number}>}
 */
export const getBalance = async () => {
  const response = await api.get('/balance');
  return response.data || { available: 0, pending: 0, total: 0 };
};

/**
 * Sync balance with SilkPay
 * @returns {Promise<Object>}
 */
export const syncBalance = async () => {
  const response = await api.post('/balance/sync');
  return response.data;
};
