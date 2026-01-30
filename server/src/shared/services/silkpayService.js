const crypto = require('crypto');
const axios = require('axios');
const logger = require('../../shared/utils/logger');

class SilkPayService {
  constructor() {
    this.apiUrl = process.env.SILKPAY_API_URL;
    this.merchantId = process.env.SILKPAY_MERCHANT_ID;
    this.secretKey = process.env.SILKPAY_SECRET_KEY;
  }

  /**
   * Generate MD5 signature for SilkPay API
   * Different endpoints use different signature formats
   */
  generateSignature(data, type = 'balance') {
    let signString;
    
    switch (type) {
      case 'payout':
        // md5(mId+mOrderId+amount+timestamp+secret)
        signString = `${data.mId}${data.mOrderId}${data.amount}${data.timestamp}${this.secretKey}`;
        break;
      case 'query':
        // md5(mId+mOrderId+timestamp+secret)
        signString = `${data.mId}${data.mOrderId}${data.timestamp}${this.secretKey}`;
        break;
      case 'balance':
        // md5(mId+timestamp+secret)
        signString = `${data.mId}${data.timestamp}${this.secretKey}`;
        break;
      default:
        throw new Error(`Unknown signature type: ${type}`);
    }
    
    // Generate MD5 in lowercase
    const signature = crypto
      .createHash('md5')
      .update(signString)
      .digest('hex')
      .toLowerCase();
    
    logger.debug('Signature generated', { 
      type,
      signString: signString.replace(this.secretKey, '***') 
    });
    
    return signature;
  }

  /**
   * Verify webhook signature
   * Signature format: md5(mId+mOrderId+amount+timestamp+secret)
   */
  verifySignature(params, receivedSignature) {
    // Official Spec: md5(mId+mOrderId+amount+timestamp+secret)
    const signString = `${params.mId}${params.mOrderId}${params.amount}${params.timestamp}${this.secretKey}`;
    const calculatedSignature = crypto
      .createHash('md5')
      .update(signString)
      .digest('hex')
      .toLowerCase();
    return calculatedSignature === receivedSignature;
  }

  /**
   * Create payout via SilkPay API
   * POST /transaction/payout
   */
  async createPayout(payoutData) {
    const timestamp = Date.now();
    
    // Official Spec Params
    const params = {
      amount: payoutData.amount.toFixed(2), // "100.00" string
      mId: this.merchantId,
      mOrderId: payoutData.out_trade_no,
      timestamp: timestamp,
      notifyUrl: `${process.env.FRONTEND_URL}/api/webhook/silkpay`,
      upi: payoutData.upi || '',
      bankNo: payoutData.account_number,
      ifsc: payoutData.ifsc_code,
      name: payoutData.beneficiary_name
    };

    // Generate signature: md5(mId+mOrderId+amount+timestamp+secret)
    const sign = this.generateSignature(params, 'payout');
    params.sign = sign;

    try {
      logger.info('Creating payout via SilkPay', { 
        mOrderId: params.mOrderId,
        amount: params.amount 
      });

      const response = await axios.post(
        `${this.apiUrl}/transaction/payout`,
        params,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      // Official Spec Response: { status: "200", message: "success", data: { payOrderId } }
      logger.info('SilkPay payout response', { 
        mOrderId: params.mOrderId,
        status: response.data.status,
        message: response.data.message,
        payOrderId: response.data.data?.payOrderId
      });

      return response.data;
    } catch (error) {
      logger.error('SilkPay API error', {
        mOrderId: params.mOrderId,
        error: error.message,
        response: error.response?.data
      });

      throw new Error(`SilkPay API error: ${error.message}`);
    }
  }

  /**
   * Query payout status
   * POST /transaction/payout/query
   */
  async queryPayout(outTradeNo) {
    const timestamp = Date.now();
    
    const params = {
      mId: this.merchantId,
      mOrderId: outTradeNo,
      timestamp: timestamp
    };

    // Signature: md5(mId+mOrderId+timestamp+secret)
    const sign = this.generateSignature(params, 'query');
    params.sign = sign;

    try {
      const response = await axios.post(
        `${this.apiUrl}/transaction/payout/query`,
        params,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('SilkPay query error', {
        mOrderId: outTradeNo,
        error: error.message
      });

      throw new Error(`SilkPay query error: ${error.message}`);
    }
  }

  /**
   * Get merchant balance from SilkPay
   * POST /transaction/balance
   */
  async getMerchantBalance() {
    const timestamp = Date.now();
    
    const params = {
      mId: this.merchantId,
      timestamp: timestamp
    };

    // Signature: md5(mId+timestamp+secret)
    const sign = this.generateSignature(params, 'balance');
    params.sign = sign;

    try {
      const response = await axios.post(
        `${this.apiUrl}/transaction/balance`,
        params,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('SilkPay balance query error', {
        error: error.message,
        response: error.response?.data
      });

      throw new Error(`SilkPay balance query error: ${error.message}`);
    }
  }
}

module.exports = new SilkPayService();
