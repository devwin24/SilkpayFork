const Joi = require('joi');

/**
 * Validate create beneficiary request
 */
exports.validateCreateBeneficiary = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    contact_info: Joi.object({
      mobile: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).messages({
        'string.pattern.base': 'Invalid mobile number format'
      }),
      email: Joi.string().email({ tlds: { allow: false } }).messages({
        'string.email': 'Invalid email format'
      })
    }),
    bank_details: Joi.object({
      account_number: Joi.string().required().min(9).max(18).pattern(/^[0-9]+$/).messages({
        'string.pattern.base': 'Account number must contain only digits',
        'string.min': 'Account number must be at least 9 digits',
        'string.max': 'Account number cannot exceed 18 digits',
        'any.required': 'Account number is required'
      }),
      ifsc_code: Joi.string().required().length(11).pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).messages({
        'string.pattern.base': 'Invalid IFSC code format (e.g., SBIN0001234)',
        'string.length': 'IFSC code must be exactly 11 characters',
        'any.required': 'IFSC code is required'
      }),
      bank_name: Joi.string().max(100),
      upi_id: Joi.string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/).messages({
        'string.pattern.base': 'Invalid UPI ID format (e.g., username@bank)'
      })
    }).required(),
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

/**
 * Validate update beneficiary request
 */
exports.validateUpdateBeneficiary = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100),
    contact_info: Joi.object({
      mobile: Joi.string().pattern(/^[+]?[0-9]{10,15}$/),
      email: Joi.string().email({ tlds: { allow: false } })
    }),
    bank_details: Joi.object({
      account_number: Joi.string().min(9).max(18).pattern(/^[0-9]+$/),
      ifsc_code: Joi.string().length(11).pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
      bank_name: Joi.string().max(100),
      upi_id: Joi.string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)
    }),
    notes: Joi.string().max(500).allow('')
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
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
