const Payout = require('./payout.model');
const Beneficiary = require('../beneficiary/beneficiary.model');
const Merchant = require('../merchant/merchant.model');
const silkpayService = require('../../shared/services/silkpayService');
const logger = require('../../shared/utils/logger');

class PayoutService {
  /**
   * Create new payout
   */
  async createPayout(merchantId, merchantNo, data) {
    // Get beneficiary
    const beneficiary = await Beneficiary.findOne({
      _id: data.beneficiary_id,
      merchant_id: merchantId,
      status: 'ACTIVE'
    });

    if (!beneficiary) {
      const error = new Error('Beneficiary not found or inactive');
      error.statusCode = 404;
      error.code = 'BENEFICIARY_NOT_FOUND';
      throw error;
    }

    // Check merchant balance
    const merchant = await Merchant.findById(merchantId);
    if (merchant.balance.available < parseFloat(data.amount)) {
      const error = new Error('Insufficient balance');
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_BALANCE';
      throw error;
    }

    // Generate unique out_trade_no
    const outTradeNo = Payout.generateOutTradeNo(merchantNo);

    // Decrypt account number for SilkPay
    const decryptedAccountNumber = beneficiary.getDecryptedAccountNumber();

    // Prepare SilkPay payout request
    const silkpayRequest = {
      out_trade_no: outTradeNo,
      amount: data.amount,
      currency: data.currency || 'INR',
      beneficiary_name: beneficiary.name,
      account_number: decryptedAccountNumber,
      ifsc_code: beneficiary.bank_details.ifsc_code,
      mobile: beneficiary.contact_info?.mobile || '',
      email: beneficiary.contact_info?.email || '',
      purpose: data.purpose || 'Payout'
    };

    try {
      // Call SilkPay API
      const silkpayResponse = await silkpayService.createPayout(silkpayRequest);

      // Create payout record
      const payout = await Payout.create({
        merchant_id: merchantId,
        merchant_no: merchantNo,
        beneficiary_id: beneficiary._id,
        silkpay_order_no: silkpayResponse.data?.order_no || outTradeNo,
        out_trade_no: outTradeNo,
        amount: data.amount,
        currency: data.currency || 'INR',
        beneficiary_details: {
          name: beneficiary.name,
          account_number: beneficiary.getMaskedAccountNumber(),
          ifsc_code: beneficiary.bank_details.ifsc_code,
          mobile: beneficiary.contact_info?.mobile,
          email: beneficiary.contact_info?.email
        },
        // Official Spec: status "200" means success
        status: silkpayResponse.status === '200' ? 'PROCESSING' : 'PENDING',
        silkpay_response: silkpayResponse,
        purpose: data.purpose,
        notes: data.notes
      });

      // Deduct from available balance, add to pending
      merchant.balance.available -= parseFloat(data.amount);
      merchant.balance.pending += parseFloat(data.amount);
      await merchant.save();

      logger.info(`Payout created: ${payout.out_trade_no}`, {
        merchant_no: merchantNo,
        amount: data.amount,
        beneficiary: beneficiary.name
      });

      return payout;
    } catch (error) {
      logger.error('Payout creation failed', {
        merchant_no: merchantNo,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get payouts with filters
   */
  async getPayouts(merchantId, filters = {}) {
    const { status, beneficiary_id, search, page = 1, limit = 10 } = filters;
    
    const query = { merchant_id: merchantId };
    
    if (status) query.status = status;
    if (beneficiary_id) query.beneficiary_id = beneficiary_id;
    
    if (search) {
      query.$or = [
        { out_trade_no: { $regex: search, $options: 'i' } },
        { silkpay_order_no: { $regex: search, $options: 'i' } },
        { 'beneficiary_details.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Payout.countDocuments(query)
    ]);
    
    return {
      payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single payout
   */
  async getPayoutById(payoutId, merchantId) {
    const payout = await Payout.findOne({
      _id: payoutId,
      merchant_id: merchantId
    }).lean();
    
    if (!payout) {
      const error = new Error('Payout not found');
      error.statusCode = 404;
      error.code = 'PAYOUT_NOT_FOUND';
      throw error;
    }
    
    return payout;
  }

  /**
   * Query payout status from SilkPay
   */
  async queryPayoutStatus(payoutId, merchantId) {
    const payout = await Payout.findOne({
      _id: payoutId,
      merchant_id: merchantId
    });
    
    if (!payout) {
      const error = new Error('Payout not found');
      error.statusCode = 404;
      error.code = 'PAYOUT_NOT_FOUND';
      throw error;
    }

    try {
      const statusResponse = await silkpayService.queryPayout(payout.out_trade_no);
      
      // Update payout if status changed
      if (statusResponse.data?.status && statusResponse.data.status !== payout.status) {
        await this.updatePayoutStatus(payout, statusResponse.data.status, statusResponse);
      }

      return await Payout.findById(payoutId).lean();
    } catch (error) {
      logger.error('Payout status query failed', {
        payout_id: payoutId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Update payout status (used by webhook and worker)
   */
  async updatePayoutStatus(payout, newStatus, responseData = {}) {
    const oldStatus = payout.status;
    
    payout.status = newStatus;
    payout.silkpay_response = responseData;

    if (newStatus === 'SUCCESS') {
      payout.completed_at = new Date();
      
      // Update merchant balance
      const merchant = await Merchant.findById(payout.merchant_id);
      merchant.balance.pending -= parseFloat(payout.amount);
      merchant.balance.total -= parseFloat(payout.amount);
      await merchant.save();

      // Update beneficiary stats
      await Beneficiary.findByIdAndUpdate(payout.beneficiary_id, {
        $inc: {
          'stats.total_payouts': 1,
          'stats.total_amount': parseFloat(payout.amount)
        },
        $set: {
          'stats.last_payout_date': new Date()
        }
      });
    } else if (newStatus === 'FAILED' || newStatus === 'REVERSED') {
      payout.completed_at = new Date();
      payout.failure_reason = responseData.message || 'Payout failed';

      // Refund to available balance
      const merchant = await Merchant.findById(payout.merchant_id);
      merchant.balance.pending -= parseFloat(payout.amount);
      merchant.balance.available += parseFloat(payout.amount);
      await merchant.save();
    }

    await payout.save();

    logger.info(`Payout status updated: ${payout.out_trade_no}`, {
      old_status: oldStatus,
      new_status: newStatus
    });

    return payout;
  }
}

module.exports = new PayoutService();
