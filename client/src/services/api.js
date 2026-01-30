import { mockPayouts, mockBalance } from '../data/mockTransactions';
import { mockBeneficiaries } from '../data/mockBeneficiaries';

// ==========================================
// CONFIGURATION
// ==========================================
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ==========================================
// MOCK DATA REGISTRY
// ==========================================
const mockData = {
  GET: {
    '/payouts': { data: mockPayouts },
    '/transactions': { data: { transactions: mockPayouts, total: mockPayouts.length } },
    '/dashboard/overview': { data: mockBalance },
    '/beneficiaries': { data: { beneficiaries: mockBeneficiaries, total: mockBeneficiaries.length } },
    '/merchant/profile': { 
      data: {
        merchant_no: 'M-2024-8832',
        name: 'Acme Corp Global',
        email: 'admin@acmecorp.com',
        mobile: '+91 98765 43210',
        status: 'ACTIVE',
      }
    },
    '/merchant/api-keys': {
      data: {
        secret_key: 'sk_live_51Hz...Ra8x',
        whitelist_ips: ['192.168.1.1', '10.0.0.5'],
      }
    },
    '/settings': {
      data: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        notifications: { email: true, sms: false },
        webhook: { url: 'https://api.acmecorp.com/webhooks/silkpay' },
        security: { two_factor_enabled: true },
        session: { timeout: '30m' }
      }
    }
  },
  POST: {
    default: { success: true, message: 'Operation successful' }
  }
};

// ==========================================
// CLIENT IMPLEMENTATION (Fetch Wrapper)
// ==========================================
const getAuthToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('authToken');
    return null;
};

const handleMockRequest = async (method, endpoint, payload) => {
    console.log(`[Mock API] ${method} ${endpoint}`, payload || '');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    // Specific Mock Logic
    if (endpoint === '/payouts' && method === 'POST') {
         return {
            success: true,
            message: 'Payout Initiated',
            data: { mOrderId: `ORD-${Date.now()}`, status: 'INITIAL' }
         };
    }
    
    if (endpoint === '/settings/update' && method === 'POST') {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('settings-updated', { detail: payload }));
        }
    }

    const methodMocks = mockData[method] || {};
    return methodMocks[endpoint] || methodMocks.default || { success: true };
};

const request = async (endpoint, { method = 'GET', body, ...customConfig } = {}) => {
    if (USE_MOCK_DATA) {
        return handleMockRequest(method, endpoint, body);
    }

    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...customConfig.headers,
    };

    const config = {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        ...customConfig,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            // console.warn("Unauthorized access - redirecting to login...");
            // if (typeof window !== 'undefined') window.location.href = '/login';
        }

        if (!response.ok) {
            // Try to parse error message from JSON response
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API ${method} Error:`, error);
        throw error;
    }
};

// ==========================================
// EXPORTED API
// ==========================================
export const api = {
    get: (url, params) => request(url, { method: 'GET', ...params }),
    post: (url, data) => request(url, { method: 'POST', body: data }),
    put: (url, data) => request(url, { method: 'PUT', body: data }),
    delete: (url) => request(url, { method: 'DELETE' }),
    
    // Generic Data Export (Blob)
    exportData: async (endpoint, params = {}) => {
        if (USE_MOCK_DATA) return handleMockRequest('GET', endpoint, params);

        try {
             // Construct Query String
             const querytString = new URLSearchParams(params).toString();
             const url = `${API_BASE_URL}${endpoint}?${querytString}`;

             const response = await fetch(url, {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${getAuthToken()}`
                  }
             });
             
             if (!response.ok) throw new Error('Export failed');
             
             // Trigger Download
             const blob = await response.blob();
             const downloadUrl = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = downloadUrl;
             // Try to get filename from headers or default
             const disposition = response.headers.get('content-disposition');
             const filename = disposition 
                ? disposition.split('filename=')[1]?.replace(/"/g, '') 
                : `export_${Date.now()}.csv`;
                
             a.download = filename;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             window.URL.revokeObjectURL(downloadUrl);
             
             return { success: true };
        } catch (error) {
             console.error("Export Error", error);
             throw error;
        }
    }
};
