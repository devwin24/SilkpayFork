
import { mockPayouts, mockBalance } from './mockTransactions';
import { mockBeneficiaries } from './mockBeneficiaries';

export const mockApiResponses = {
  GET: {
    '/payouts': { data: { payouts: mockPayouts, total: mockPayouts.length } },
    '/transactions': { data: { transactions: mockPayouts, total: mockPayouts.length } },
    '/dashboard/overview': { data: { balance: mockBalance } },
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
  },
  PUT: {
    '/merchant/whitelist-ips': { 
        data: { whitelist_ips: ['192.168.1.1', '10.0.0.5', '127.0.0.1'] } 
    },
    default: { success: true, message: 'Update successful' }
  }
};
