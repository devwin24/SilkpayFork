
export const mockPayouts = Array.from({ length: 35 }).map((_, i) => {
  const statusInt = i % 5 === 0 ? 3 : (i % 7 === 0 ? 1 : 2); // 3=FAILED, 1=PROCESSING, 2=SUCCESS
  const statusStr = statusInt === 2 ? 'SUCCESS' : (statusInt === 1 ? 'PROCESSING' : 'FAILED');
  
  return {
    id: `po_${i + 1}`,
    mId: "TEST",
    mOrderId: `ORD-${Date.now() - (i * 86400000)}-${1000+i}`,
    payOrderId: `DF-${Date.now()}-${i}`,
    beneficiary_name: i % 3 === 0 ? 'Rahul Sharma' : (i % 3 === 1 ? 'Priya Singh' : 'Tech Solutions Pvt Ltd'),
    source: i % 2 === 0 ? 'SAVED' : 'ONE_TIME',
    account_number: `XXXXXXXX${1000 + i}`,
    ifsc_code: i % 2 === 0 ? "HDFC0001234" : "ICIC0005678",
    bank_name: i % 2 === 0 ? "HDFC Bank" : "ICICI Bank",
    amount: (Math.random() * 10000 + 1000).toFixed(2),
    status: statusStr,
    utr: statusInt === 2 ? `UTR${9876543210 - i}` : null,
    timestamp: Date.now() - (i * 86400000),
    created_at: new Date(Date.now() - (i * 86400000)).toISOString()
  };
});

export const mockBalance = {
  available: 125000.00,
  pending: 15000.00,
  total: 140000.00
};
