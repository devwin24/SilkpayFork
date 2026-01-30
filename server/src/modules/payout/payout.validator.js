const Joi = require('joi');

/**
 * Validate create payout request
 */
exports.validateCreatePayout = (req, res, next) => {
  const schema = Joi.object({
    beneficiary_id: Joi.string().required().messages({
      'any.required': 'Beneficiary ID is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount can have maximum 2 decimal places',
      'any.required': 'Amount is required'
    }),
    currency: Joi.string().valid('INR').default('INR'),
    purpose: Joi.string().max(200).messages({
      'string.max': 'Purpose cannot exceed 200 characters'
    }),
    notes: Joi.string().max(500).allow('').messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }

  next();
};
