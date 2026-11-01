import Customer from '../models/Customer.mjs';
import asyncHandler from '../middleware/asyncHandler.mjs';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (admin)
const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: customers.length, data: customers });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (admin)
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.status(200).json({ success: true, data: customer });
});

export { getCustomers, getCustomerById };

export default { getCustomers, getCustomerById };
