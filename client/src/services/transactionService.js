/**
 * Transaction Service - Handles all transaction-related API calls
 */

import { api } from './api';

/**
 * Get all transactions with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<{transactions: Array, total: number}>}
 */
export const getTransactions = async (filters = {}) => {
  const response = await api.get('/transactions', filters);
  return response.data || { transactions: [], total: 0 };
};

/**
 * Get single transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>}
 */
export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

/**
 * Export transactions to CSV
 * @param {Object} filters - Export filters (date range, status, etc.)
 * @returns {Promise<void>}
 */
export const exportTransactions = async (filters = {}) => {
  return api.exportData('/transactions/export', filters);
};
