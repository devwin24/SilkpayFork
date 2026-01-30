
export const mockBeneficiaries = Array.from({ length: 25 }).map((_, i) => ({
  id: `ben_${i + 1}`,
  name: i % 4 === 0 ? 'Rohan Gupta' : (i % 4 === 1 ? 'Aditi Verma' : (i % 4 === 2 ? 'Global Services Inc' : 'Priya Singh')),
  mobile: `98765${43210 - i}`,
  account_number: `XXXXXXXX${5000 + i}`,
  bank_name: i % 2 === 0 ? 'HDFC Bank' : 'ICICI Bank',
  ifsc_code: i % 2 === 0 ? 'HDFC0001234' : 'ICIC0005678',
  status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
  created_at: new Date(new Date().setDate(new Date().getDate() - i * 2)).toISOString(),
}));
