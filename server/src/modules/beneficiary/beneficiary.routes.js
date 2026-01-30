const express = require('express');
const router = express.Router();
const beneficiaryController = require('./beneficiary.controller');
const { validateCreateBeneficiary, validateUpdateBeneficiary } = require('./beneficiary.validator');
const authMiddleware = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/beneficiaries - List all beneficiaries
router.get('/', beneficiaryController.getBeneficiaries);

// GET /api/beneficiaries/:id - Get single beneficiary
router.get('/:id', beneficiaryController.getBeneficiaryById);

// POST /api/beneficiaries - Create beneficiary
router.post('/', validateCreateBeneficiary, beneficiaryController.createBeneficiary);

// PUT /api/beneficiaries/:id - Update beneficiary
router.put('/:id', validateUpdateBeneficiary, beneficiaryController.updateBeneficiary);

// DELETE /api/beneficiaries/:id - Delete beneficiary (soft delete)
router.delete('/:id', beneficiaryController.deleteBeneficiary);

module.exports = router;
