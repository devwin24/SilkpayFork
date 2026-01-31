/**
 * Beneficiary Service - Handles all beneficiary-related API calls
 */

import { api } from './api';

/**
 * Get all beneficiaries with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<{beneficiaries: Array, total: number}>}
 */
export const getBeneficiaries = async (filters = {}) => {
  const response = await api.get('/beneficiaries', filters);
  return response.data || { beneficiaries: [], total: 0 };
};

/**
 * Get single beneficiary by ID
 * @param {string} id - Beneficiary ID
 * @returns {Promise<Object>}
 */
export const getBeneficiaryById = async (id) => {
  const response = await api.get(`/beneficiaries/${id}`);
  return response.data;
};

/**
 * Create new beneficiary
 * @param {Object} beneficiaryData - Beneficiary details
 * @returns {Promise<Object>}
 */
export const createBeneficiary = async (beneficiaryData) => {
  const response = await api.post('/beneficiaries', beneficiaryData);
  return response.data;
};

/**
 * Update existing beneficiary
 * @param {string} id - Beneficiary ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export const updateBeneficiary = async (id, updates) => {
  const response = await api.put(`/beneficiaries/${id}`, updates);
  return response.data;
};

/**
 * Delete beneficiary
 * @param {string} id - Beneficiary ID
 * @returns {Promise<Object>}
 */
export const deleteBeneficiary = async (id) => {
  const response = await api.delete(`/beneficiaries/${id}`);
  return response.data;
};

/**
 * Export beneficiaries to CSV
 * @param {Object} filters - Export filters
 * @returns {Promise<void>}
 */
export const exportBeneficiaries = async (filters = {}) => {
  return api.exportData('/beneficiaries/export', filters);
};
