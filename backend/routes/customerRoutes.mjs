import express from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/').get(protectAdmin, getCustomers);
router.route('/:id').get(protectAdmin, getCustomerById);

export default router;
